import { fallbackSlots, type SlotRelease } from '../../data/slots';

const RELEASES_URL = 'https://slot.report/api/v1/new.json';
const CATALOG_URL = 'https://www.slotindex.io/api/slots?limit=200&offset=0';
const SITE_URL = 'https://spin-district.sandra-mousse-sm.chatgpt.site/';

type ExternalSlot = {
  name?: unknown;
  slug?: unknown;
  provider?: unknown;
  rtp?: unknown;
  volatility?: unknown;
  max_win?: unknown;
  release_date?: unknown;
  last_checked_at?: unknown;
};

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function providerName(value: string) {
  const known: Record<string, string> = {
    '4theplayer': '4ThePlayer',
    'bgaming': 'BGaming',
    'elk-studios': 'ELK Studios',
    'hacksaw-gaming': 'Hacksaw Gaming',
    'netent': 'NetEnt',
    'nolimit-city': 'Nolimit City',
    'play-n-go': "Play'n GO",
    'pragmatic-play': 'Pragmatic Play',
    'relax-gaming': 'Relax Gaming',
  };
  return known[value.toLowerCase()] ?? value
    .split('-')
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
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
    maxWin: number(slot.max_win),
    releaseDate: text(slot.release_date) ?? text(slot.last_checked_at),
  };
}

export async function GET() {
  try {
    const response = await fetch(RELEASES_URL, {
      headers: {
        Accept: 'application/json',
        Referer: SITE_URL,
        'User-Agent': 'SpinDistrict/1.0',
      },
    });

    if (!response.ok) throw new Error(`Upstream ${response.status}`);
    const payload = (await response.json()) as { results?: ExternalSlot[] };
    const slots = (payload.results ?? [])
      .map(normalize)
      .filter((slot): slot is SlotRelease => slot !== null)
      .slice(0, 20);

    if (!slots.length) throw new Error('Empty upstream result');

    return Response.json({
      slots,
      source: 'slot-report',
      updatedAt: new Date().toISOString(),
    });
  } catch {
    try {
      const response = await fetch(CATALOG_URL, {
        headers: { Accept: 'application/json', 'User-Agent': 'SpinDistrict/1.0' },
      });
      if (!response.ok) throw new Error(`Catalog upstream ${response.status}`);

      const payload = (await response.json()) as ExternalSlot[];
      const slots = payload
        .map(normalize)
        .filter((slot): slot is SlotRelease => slot !== null)
        .filter((slot) => slot.releaseDate !== null)
        .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
        .slice(0, 20);

      if (!slots.length) throw new Error('Empty catalog result');
      return Response.json({ slots, source: 'slot-index', updatedAt: new Date().toISOString() });
    } catch {
    return Response.json({
      slots: fallbackSlots,
      source: 'celsius',
      updatedAt: new Date().toISOString(),
    });
    }
  }
}
