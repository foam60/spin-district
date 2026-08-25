import { fallbackSlots, type SlotRelease } from '../../data/slots';

const CATALOG_URL = 'https://www.slotindex.io/api/slots';
const PAGE_SIZE = 200;
const PAGE_COUNT = 12;

type ExternalSlot = {
  name?: unknown;
  slug?: unknown;
  provider?: unknown;
  rtp?: unknown;
  volatility?: unknown;
  last_checked_at?: unknown;
  thumbnail_url?: unknown;
};

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function providerName(value: string) {
  const known: Record<string, string> = {
    '4theplayer': '4ThePlayer', bgaming: 'BGaming', 'elk-studios': 'ELK Studios',
    'hacksaw-gaming': 'Hacksaw Gaming', netent: 'NetEnt', 'nolimit-city': 'Nolimit City',
    'play-n-go': "Play'n GO", 'pragmatic-play': 'Pragmatic Play',
    'push-gaming': 'Push Gaming', 'relax-gaming': 'Relax Gaming',
  };
  return known[value.toLowerCase()] ?? value.split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ');
}

function normalize(slot: ExternalSlot, index: number): SlotRelease | null {
  const name = text(slot.name);
  const provider = text(slot.provider);
  if (!name || !provider) return null;
  return {
    id: text(slot.slug) ?? `${provider}-${name}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    provider: providerName(provider),
    rtp: number(slot.rtp),
    volatility: text(slot.volatility),
    maxWin: null,
    releaseDate: text(slot.last_checked_at),
    thumbnailUrl: text(slot.thumbnail_url)
      ? new URL(text(slot.thumbnail_url)!, CATALOG_URL).toString()
      : null,
  };
}

async function fetchPage(page: number) {
  const response = await fetch(`${CATALOG_URL}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'SpinDistrict/1.0' },
  });
  if (!response.ok) throw new Error(`Catalog upstream ${response.status}`);
  return (await response.json()) as ExternalSlot[];
}

export async function GET() {
  try {
    const pages = await Promise.all(Array.from({ length: PAGE_COUNT }, (_, page) => fetchPage(page)));
    const seen = new Set<string>();
    const slots = pages.flat().map(normalize).filter((slot): slot is SlotRelease => slot !== null).filter((slot) => {
      if (seen.has(slot.id)) return false;
      seen.add(slot.id);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    if (!slots.length) throw new Error('Empty catalog result');
    return Response.json({ slots, source: 'slot-index', updatedAt: new Date().toISOString() });
  } catch {
    return Response.json({ slots: fallbackSlots, source: 'celsius', updatedAt: new Date().toISOString() });
  }
}
