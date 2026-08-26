'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fallbackSlots, type SlotRelease } from '../data/slots';

export type HuntEntry = {
  id: string;
  slotId: string;
  name: string;
  provider: string;
  thumbnailUrl?: string | null;
  bet: number;
  gain: number | null;
  collected: boolean;
};

export type Hunt = {
  id: string;
  title: string;
  startAmount: number;
  currency: 'EUR';
  createdAt: string;
  updatedAt: string;
  entries: HuntEntry[];
};

type StoredState = { hunts: Hunt[]; activeId: string | null };

const STORAGE_KEY = 'spin-district-hunts-v3';
const LEGACY_KEYS = ['spin-district-hunts-v2', 'spin-district-hunts-v1'];

const money = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const day = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeNumber(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : 0;
  const parsed = Number(String(value).replace(',', '.').trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function asText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function asAmount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizeEntry(value: unknown): HuntEntry | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Partial<HuntEntry>;
  const name = asText(entry.name);
  const id = asText(entry.id) || uid();
  if (!name) return null;
  return {
    id,
    slotId: asText(entry.slotId) || id,
    name,
    provider: asText(entry.provider) || 'Autre',
    thumbnailUrl: typeof entry.thumbnailUrl === 'string' ? entry.thumbnailUrl : null,
    bet: Math.max(0.01, asAmount(entry.bet) || 1),
    gain: typeof entry.gain === 'number' && Number.isFinite(entry.gain) ? entry.gain : null,
    collected: Boolean(entry.collected) || (typeof entry.gain === 'number' && entry.gain !== null),
  };
}

function normalizeHunt(value: unknown): Hunt | null {
  if (!value || typeof value !== 'object') return null;
  const hunt = value as Partial<Hunt>;
  const id = asText(hunt.id) || uid();
  const createdAt = asText(hunt.createdAt) || new Date().toISOString();
  return {
    id,
    title: asText(hunt.title) || 'Bonus Hunt',
    startAmount: asAmount(hunt.startAmount),
    currency: 'EUR',
    createdAt,
    updatedAt: asText(hunt.updatedAt) || createdAt,
    entries: Array.isArray(hunt.entries)
      ? hunt.entries.map(normalizeEntry).filter((entry): entry is HuntEntry => entry !== null)
      : [],
  };
}

function readStoredState(): StoredState {
  if (typeof window === 'undefined') return { hunts: [], activeId: null };
  try {
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { hunts?: unknown; activeId?: unknown };
        const hunts = Array.isArray(parsed.hunts)
          ? parsed.hunts.map(normalizeHunt).filter((hunt): hunt is Hunt => hunt !== null)
          : [];
        const activeId =
          typeof parsed.activeId === 'string' && hunts.some((h) => h.id === parsed.activeId)
            ? parsed.activeId
            : hunts[0]?.id ?? null;
        return { hunts, activeId };
      } catch {
        continue;
      }
    }
  } catch {
    return { hunts: [], activeId: null };
  }
  return { hunts: [], activeId: null };
}

function persistState(state: StoredState) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(state);
  window.localStorage.setItem(STORAGE_KEY, payload);
  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

function huntProfit(hunt: Hunt) {
  const totalGain = hunt.entries.reduce((sum, entry) => sum + (entry.gain ?? 0), 0);
  return totalGain - hunt.startAmount;
}

const DEMO_HUNT: Hunt = {
  id: 'demo-hunt-spin-district',
  title: 'Session Live #42 — Spin District',
  startAmount: 1500,
  currency: 'EUR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  entries: [
    {
      id: 'demo-1',
      slotId: 'le-prechaun',
      name: 'Le Prechaun',
      provider: 'Hacksaw Gaming',
      bet: 2,
      gain: 340.5,
      collected: true,
    },
    {
      id: 'demo-2',
      slotId: 'gates-of-olympus-super-scatter',
      name: 'Gates of Olympus Super Scatter',
      provider: 'Pragmatic Play',
      bet: 1.5,
      gain: 520,
      collected: true,
    },
    {
      id: 'demo-3',
      slotId: 'mental-2',
      name: 'Mental 2',
      provider: 'Nolimit City',
      bet: 2,
      gain: 180,
      collected: true,
    },
    {
      id: 'demo-4',
      slotId: 'big-bass-bonanza-1000',
      name: 'Big Bass Bonanza 1000',
      provider: 'Pragmatic Play',
      bet: 3,
      gain: 890,
      collected: true,
    },
    {
      id: 'demo-5',
      slotId: 'le-celsius',
      name: 'Le Celsius',
      provider: 'Hacksaw Gaming',
      bet: 2.5,
      gain: null,
      collected: false,
    },
    {
      id: 'demo-6',
      slotId: 'reactoonz-100',
      name: 'Reactoonz 100',
      provider: "Play'n GO",
      bet: 2,
      gain: null,
      collected: false,
    },
    {
      id: 'demo-7',
      slotId: 'hounds-of-hell',
      name: 'Hounds of Hell',
      provider: 'Hacksaw Gaming',
      bet: 2,
      gain: null,
      collected: false,
    },
  ],
};

export default function BonusHuntBoard() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<SlotRelease[]>(fallbackSlots);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Modals & Drawers
  const [showCreate, setShowCreate] = useState(false);
  const [showEditHunt, setShowEditHunt] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Form states for hunt creation / edition
  const [huntTitle, setHuntTitle] = useState('Bonus Hunt Spin District');
  const [huntStartAmount, setHuntStartAmount] = useState('1500');

  // Catalog modal states
  const [catalogTab, setCatalogTab] = useState<'catalog' | 'custom'>('catalog');
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('Tous');
  const [visibleLimit, setVisibleLimit] = useState(48);
  const [selectedSlot, setSelectedSlot] = useState<SlotRelease | null>(null);
  const [customSlotName, setCustomSlotName] = useState('');
  const [customProvider, setCustomProvider] = useState('');
  const [bet, setBet] = useState('1');

  // Active hunt internal search & filter
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'pending' | 'collected'>('all');
  const [tableSort, setTableSort] = useState<'default' | 'gain-desc' | 'multi-desc' | 'bet-desc'>('default');

  // Responsive state
  const [mobileShowList, setMobileShowList] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const loaded = useRef(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = readStoredState();
    if (stored.hunts.length > 0) {
      setHunts(stored.hunts);
      setActiveId(stored.activeId ?? stored.hunts[0].id);
    } else {
      // Initialize with demo hunt so user immediately has an engaging interface
      setHunts([DEMO_HUNT]);
      setActiveId(DEMO_HUNT.id);
      persistState({ hunts: [DEMO_HUNT], activeId: DEMO_HUNT.id });
    }
    loaded.current = true;
    setReady(true);

    // Fetch catalog
    fetch('/api/slots')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((payload) => {
        const slots = (payload as { slots?: SlotRelease[] }).slots;
        if (slots?.length) setCatalog(slots);
      })
      .catch(() => {})
      .finally(() => setCatalogLoading(false));
  }, []);

  // Save to local storage on any state change
  useEffect(() => {
    if (!loaded.current || !ready) return;
    try {
      setSaveStatus('saving');
      persistState({ hunts, activeId });
      const timer = setTimeout(() => setSaveStatus('saved'), 350);
      return () => clearTimeout(timer);
    } catch {
      setSaveStatus('error');
    }
  }, [activeId, hunts, ready]);

  // Keyboard shortcut for modals
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowAdd(false);
        setShowCreate(false);
        setShowEditHunt(false);
        setShowImport(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeHunt = hunts.find((hunt) => hunt.id === activeId) ?? hunts[0] ?? null;
  const entries = activeHunt?.entries ?? [];

  // Metrics calculations
  const totalGain = entries.reduce((sum, entry) => sum + (entry.gain ?? 0), 0);
  const totalBet = entries.reduce((sum, entry) => sum + entry.bet, 0);
  const collected = entries.filter((entry) => entry.collected);
  const pending = entries.filter((entry) => !entry.collected);
  const pendingBet = pending.reduce((sum, entry) => sum + entry.bet, 0);
  const startBankroll = activeHunt?.startAmount ?? 0;
  const profit = totalGain - startBankroll;
  const roi = startBankroll > 0 ? (profit / startBankroll) * 100 : 0;
  const breakEven = totalBet > 0 ? startBankroll / totalBet : 0;
  const evolvingBreakEven =
    pendingBet > 0 ? Math.max(0, startBankroll - totalGain) / pendingBet : 0;
  const averageMulti =
    collected.length > 0
      ? collected.reduce((sum, e) => sum + ((e.gain ?? 0) / (e.bet || 1)), 0) / collected.length
      : 0;

  const bestGain = useMemo(
    () => [...collected].sort((a, b) => (b.gain ?? 0) - (a.gain ?? 0))[0] ?? null,
    [collected]
  );
  const bestMulti = useMemo(
    () => [...collected].sort((a, b) => (b.gain ?? 0) / b.bet - (a.gain ?? 0) / a.bet)[0] ?? null,
    [collected]
  );

  const providerStats = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => counts.set(entry.provider, (counts.get(entry.provider) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [entries]);

  const providers = useMemo(
    () => ['Tous', ...Array.from(new Set(catalog.map((slot) => slot.provider))).sort()],
    [catalog]
  );

  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr');
    return catalog.filter(
      (slot) =>
        (provider === 'Tous' || slot.provider === provider) &&
        (!needle || `${slot.name} ${slot.provider}`.toLocaleLowerCase('fr').includes(needle))
    );
  }, [catalog, provider, query]);

  // Filtered and sorted table entries
  const displayedEntries = useMemo(() => {
    let result = [...entries];
    if (tableSearch.trim()) {
      const q = tableSearch.trim().toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.provider.toLowerCase().includes(q)
      );
    }
    if (tableStatusFilter === 'pending') {
      result = result.filter((e) => !e.collected);
    } else if (tableStatusFilter === 'collected') {
      result = result.filter((e) => e.collected);
    }

    if (tableSort === 'gain-desc') {
      result.sort((a, b) => (b.gain ?? 0) - (a.gain ?? 0));
    } else if (tableSort === 'multi-desc') {
      result.sort((a, b) => (b.gain ?? 0) / b.bet - (a.gain ?? 0) / a.bet);
    } else if (tableSort === 'bet-desc') {
      result.sort((a, b) => b.bet - a.bet);
    }
    return result;
  }, [entries, tableSearch, tableStatusFilter, tableSort]);

  // Filtered past hunts in library
  const filteredHunts = useMemo(() => {
    if (!librarySearch.trim()) return hunts;
    const q = librarySearch.trim().toLowerCase();
    return hunts.filter((h) => h.title.toLowerCase().includes(q));
  }, [hunts, librarySearch]);

  function touch(hunt: Hunt): Hunt {
    return { ...hunt, updatedAt: new Date().toISOString() };
  }

  function updateActive(updater: (hunt: Hunt) => Hunt) {
    if (!activeHunt) return;
    const id = activeHunt.id;
    setHunts((current) =>
      current.map((hunt) => (hunt.id === id ? touch(updater(hunt)) : hunt))
    );
  }

  function openCreateModal() {
    setHuntTitle(`Bonus Hunt #${hunts.length + 1}`);
    setHuntStartAmount('1500');
    setShowCreate(true);
  }

  function handleCreateHunt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const newHunt: Hunt = {
      id: uid(),
      title: huntTitle.trim() || `Bonus Hunt #${hunts.length + 1}`,
      startAmount: safeNumber(huntStartAmount),
      currency: 'EUR',
      createdAt: now,
      updatedAt: now,
      entries: [],
    };
    setHunts((current) => [newHunt, ...current]);
    setActiveId(newHunt.id);
    setShowCreate(false);
    setMobileShowList(false);
  }

  function handleEditHunt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeHunt) return;
    updateActive((hunt) => ({
      ...hunt,
      title: huntTitle.trim() || hunt.title,
      startAmount: safeNumber(huntStartAmount),
    }));
    setShowEditHunt(false);
  }

  function openEditModal() {
    if (!activeHunt) return;
    setHuntTitle(activeHunt.title);
    setHuntStartAmount(String(activeHunt.startAmount));
    setShowEditHunt(true);
  }

  function duplicateHunt(hunt: Hunt) {
    const copy: Hunt = {
      ...hunt,
      id: uid(),
      title: `${hunt.title} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entries: hunt.entries.map((e) => ({
        ...e,
        id: uid(),
        gain: null,
        collected: false,
      })),
    };
    setHunts((current) => [copy, ...current]);
    setActiveId(copy.id);
    setMobileShowList(false);
  }

  function deleteHunt(id: string) {
    const hunt = hunts.find((item) => item.id === id);
    if (!hunt) return;
    if (
      !window.confirm(
        `Supprimer définitivement « ${hunt.title} » et ses ${hunt.entries.length} slots enregistrées ?`
      )
    )
      return;
    const remaining = hunts.filter((item) => item.id !== id);
    setHunts(remaining);
    setActiveId(remaining[0]?.id ?? null);
    if (!remaining.length) setMobileShowList(true);
  }

  function resetActiveGains() {
    if (!activeHunt || !activeHunt.entries.length) return;
    if (
      !window.confirm(
        'Réinitialiser tous les gains et statuts de cette session pour relancer l’ouverture ?'
      )
    )
      return;
    updateActive((hunt) => ({
      ...hunt,
      entries: hunt.entries.map((e) => ({ ...e, gain: null, collected: false })),
    }));
  }

  function openAddModal() {
    setQuery('');
    setProvider('Tous');
    setVisibleLimit(48);
    setSelectedSlot(null);
    setCustomSlotName('');
    setCustomProvider('');
    setBet('1');
    setCatalogTab('catalog');
    setShowAdd(true);
  }

  function handleAddSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeHunt) return;

    let newEntry: HuntEntry | null = null;
    const parsedBet = Math.max(0.01, safeNumber(bet));

    if (catalogTab === 'catalog') {
      if (!selectedSlot) return;
      newEntry = {
        id: uid(),
        slotId: selectedSlot.id,
        name: selectedSlot.name,
        provider: selectedSlot.provider,
        thumbnailUrl: selectedSlot.thumbnailUrl,
        bet: parsedBet,
        gain: null,
        collected: false,
      };
    } else {
      if (!customSlotName.trim()) return;
      newEntry = {
        id: uid(),
        slotId: `custom-${uid()}`,
        name: customSlotName.trim(),
        provider: customProvider.trim() || 'Custom',
        thumbnailUrl: null,
        bet: parsedBet,
        gain: null,
        collected: false,
      };
    }

    if (newEntry) {
      updateActive((hunt) => ({ ...hunt, entries: [...hunt.entries, newEntry!] }));
      setShowAdd(false);
    }
  }

  function patchEntry(id: string, patch: Partial<HuntEntry>) {
    updateActive((hunt) => ({
      ...hunt,
      entries: hunt.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  }

  function deleteEntry(id: string) {
    updateActive((hunt) => ({
      ...hunt,
      entries: hunt.entries.filter((entry) => entry.id !== id),
    }));
  }

  function copyDiscordSummary() {
    if (!activeHunt) return;
    const multiMaxStr = bestMulti
      ? `${bestMulti.name} (${((bestMulti.gain ?? 0) / bestMulti.bet).toFixed(1)}x)`
      : '—';
    const text = [
      `🎯 **SPIN DISTRICT — BONUS HUNT**`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📁 **Session :** ${activeHunt.title}`,
      `💰 **Bankroll Départ :** ${money.format(activeHunt.startAmount)}`,
      `🎰 **Slots :** ${collected.length}/${entries.length} ouvertes (${money.format(totalBet)} misé)`,
      `💵 **Total Gagné :** ${money.format(totalGain)}`,
      `📊 **Profit / Pertes :** ${profit >= 0 ? '+' : ''}${money.format(profit)} (${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%)`,
      `⚡ **Multiplicateur Moyen :** ${averageMulti.toFixed(1)}x`,
      `🔥 **Meilleur Multi :** ${multiMaxStr}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🌐 *Suivi sur Spin District : https://spin-district.sandra-mousse-sm.chatgpt.site*`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copié dans le presse-papier !');
      setTimeout(() => setCopyFeedback(''), 3000);
    });
  }

  function exportHuntsJSON() {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ hunts, activeId }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spin-district-hunts-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportJSON(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsed = JSON.parse(importData) as { hunts?: unknown; activeId?: unknown };
      if (!Array.isArray(parsed.hunts)) throw new Error('Format invalide');
      const importedHunts = parsed.hunts
        .map(normalizeHunt)
        .filter((hunt): hunt is Hunt => hunt !== null);
      if (!importedHunts.length) throw new Error('Aucun hunt valide trouvé');
      setHunts((prev) => [...importedHunts, ...prev]);
      setActiveId(importedHunts[0].id);
      setShowImport(false);
      setImportData('');
      alert(`${importedHunts.length} hunt(s) importé(s) avec succès !`);
    } catch {
      alert('Erreur lors de l’importation. Vérifiez que le JSON est valide.');
    }
  }

  function loadDemoHunt() {
    const newDemo = { ...DEMO_HUNT, id: uid(), createdAt: new Date().toISOString() };
    setHunts((prev) => [newDemo, ...prev]);
    setActiveId(newDemo.id);
  }

  if (!ready) {
    return (
      <div className="hunt-loading">
        <div className="loading-spinner" />
        <span>Chargement de vos hunts sauvegardés…</span>
      </div>
    );
  }

  const libraryContent = (
    <aside className="hunt-library" aria-label="Historique des bonus hunts sauvegardés">
      <div className="hunt-library-head">
        <div>
          <span className="library-tag">NAVIGATEUR LOCAL</span>
          <strong>{hunts.length} Hunt{hunts.length > 1 ? 's' : ''}</strong>
        </div>
        <div className="hunt-library-actions">
          <button
            type="button"
            className="hunt-button-primary"
            onClick={openCreateModal}
            title="Créer un nouveau hunt"
          >
            + Nouveau
          </button>
        </div>
      </div>

      <div className="hunt-library-search">
        <input
          type="text"
          placeholder="Rechercher une session…"
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
        />
        {librarySearch && (
          <button type="button" onClick={() => setLibrarySearch('')} className="clear-search">
            ×
          </button>
        )}
      </div>

      {filteredHunts.length ? (
        <ul className="hunt-list">
          {filteredHunts.map((hunt) => {
            const result = huntProfit(hunt);
            const selected = hunt.id === activeHunt?.id;
            const collectedCount = hunt.entries.filter((e) => e.collected).length;
            return (
              <li key={hunt.id} className={selected ? 'active-item' : ''}>
                <button
                  type="button"
                  className="hunt-card-select"
                  onClick={() => {
                    setActiveId(hunt.id);
                    setMobileShowList(false);
                  }}
                >
                  <div className="hunt-card-top">
                    <b title={hunt.title}>{hunt.title}</b>
                    <span className={`hunt-profit-pill ${result >= 0 ? 'up' : 'down'}`}>
                      {result >= 0 ? '+' : ''}
                      {money.format(result)}
                    </span>
                  </div>
                  <div className="hunt-card-bottom">
                    <small>{day.format(new Date(hunt.createdAt))}</small>
                    <span className="hunt-slots-badge">
                      {collectedCount}/{hunt.entries.length} slots
                    </span>
                  </div>
                </button>
                <div className="hunt-card-menu">
                  <button
                    type="button"
                    className="library-btn"
                    title="Dupliquer ce hunt"
                    onClick={() => duplicateHunt(hunt)}
                  >
                    ⎘
                  </button>
                  <button
                    type="button"
                    className="library-btn delete"
                    title={`Supprimer ${hunt.title}`}
                    onClick={() => deleteHunt(hunt.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="hunt-library-empty">
          <p>Aucun hunt trouvé.</p>
          <button type="button" className="btn-text" onClick={openCreateModal}>
            Créer un nouveau hunt ↗
          </button>
        </div>
      )}

      <div className="hunt-library-footer">
        <div className="backup-row">
          <button type="button" onClick={exportHuntsJSON} title="Sauvegarder vos sessions en JSON">
            💾 Exporter JSON
          </button>
          <button type="button" onClick={() => setShowImport(true)} title="Restaurer un fichier JSON">
            📥 Importer
          </button>
        </div>
        <div className="demo-btn-row">
          <button type="button" className="btn-demo-link" onClick={loadDemoHunt}>
            ✨ Charger une session démo
          </button>
        </div>
        <p className="hunt-storage-info">
          <span className="dot-pulse" /> Sauvegarde locale automatique (sans compte)
        </p>
      </div>
    </aside>
  );

  if (!activeHunt) {
    return (
      <div className="hunt-shell">
        {libraryContent}
        <div className="hunt-empty-state">
          <div className="hunt-empty-icon">+</div>
          <p className="hunt-overline">BONUS HUNT LAB</p>
          <h3>
            COMMENCEZ VOTRE<br />
            <em>PREMIÈRE SESSION</em>
          </h3>
          <p>
            Enregistrez toutes vos machines à sous, fixez votre bankroll de départ et suivez vos
            gains en temps réel. Toutes vos sessions restent automatiquement sauvegardées dans votre
            navigateur.
          </p>
          <div className="empty-actions">
            <button className="button button-primary" type="button" onClick={openCreateModal}>
              Créer mon premier hunt <span>↗</span>
            </button>
            <button className="button button-ghost" type="button" onClick={loadDemoHunt}>
              Charger une session démo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionPercent =
    entries.length > 0 ? Math.round((collected.length / entries.length) * 100) : 0;

  return (
    <div className={`hunt-shell ${mobileShowList ? 'mobile-library-open' : 'mobile-board-open'}`}>
      {libraryContent}

      <div className="hunt-app">
        {/* Top Control Bar */}
        <div className="hunt-appbar">
          <div className="hunt-appbar-left">
            <button
              type="button"
              className="hunt-back-btn"
              onClick={() => setMobileShowList(true)}
            >
              ← Voir mes hunts ({hunts.length})
            </button>
            <div className="hunt-title-row">
              <span className="hunt-live-badge">
                <i className="status-dot" />
                {saveStatus === 'saved' && 'Sauvegardé en local'}
                {saveStatus === 'saving' && 'Enregistrement…'}
                {saveStatus === 'error' && 'Erreur stockage local'}
              </span>
              <div className="title-edit-combo">
                <h3 className="hunt-current-title">{activeHunt.title}</h3>
                <button
                  type="button"
                  className="btn-edit-title"
                  onClick={openEditModal}
                  title="Renommer ou changer la bankroll"
                >
                  ✎ Modifier
                </button>
              </div>
            </div>
          </div>

          <div className="hunt-appbar-actions">
            <button
              type="button"
              className={`hunt-btn-discord ${copyFeedback ? 'copied' : ''}`}
              onClick={copyDiscordSummary}
              title="Copier un résumé formaté pour Discord"
            >
              {copyFeedback ? '✓ ' + copyFeedback : '📋 Résumé Discord'}
            </button>
            <button
              type="button"
              className="hunt-button-primary"
              onClick={openAddModal}
            >
              + Ajouter une slot
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="hunt-metrics">
          <article className="metric-card clickable" onClick={openEditModal}>
            <div className="metric-header">
              <span>Bankroll Départ</span>
              <span className="edit-hint">✎</span>
            </div>
            <strong>{money.format(activeHunt.startAmount)}</strong>
            <small>Cliquez pour modifier</small>
          </article>

          <article className="metric-card">
            <div className="metric-header">
              <span>Total Misé</span>
            </div>
            <strong>{money.format(totalBet)}</strong>
            <small>Mise moy. : {entries.length ? money.format(totalBet / entries.length) : '0 €'}</small>
          </article>

          <article className="metric-card">
            <div className="metric-header">
              <span>Total Gagné</span>
            </div>
            <strong>{money.format(totalGain)}</strong>
            <small>
              {collected.length}/{entries.length} bonus ouvert{collected.length > 1 ? 's' : ''} ({completionPercent}%)
            </small>
          </article>

          <article className={`metric-card profit-card ${profit >= 0 ? 'positive' : 'negative'}`}>
            <div className="metric-header">
              <span>Profit Net (ROI)</span>
            </div>
            <strong>
              {profit >= 0 ? '+' : ''}
              {money.format(profit)}
            </strong>
            <small>
              ROI : {roi >= 0 ? '+' : ''}
              {roi.toFixed(1)}%
            </small>
          </article>
        </div>

        {/* Insights & Session Progress */}
        <div className="hunt-insights-grid">
          <article className="insight-box">
            <h4>🎯 Progression & Break Even</h4>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="insight-row">
              <span>Break Even Fixe</span>
              <strong>{breakEven.toFixed(1)}x</strong>
            </div>
            <div className="insight-row">
              <span>Break Even Évolutif (restant)</span>
              <strong>{evolvingBreakEven.toFixed(1)}x</strong>
            </div>
          </article>

          <article className="insight-box">
            <h4>🔥 Faits Marquants</h4>
            <div className="insight-row">
              <span>Meilleur Gain</span>
              <strong>
                {bestGain ? `${bestGain.name} (${money.format(bestGain.gain ?? 0)})` : '—'}
              </strong>
            </div>
            <div className="insight-row">
              <span>Meilleur Multi</span>
              <strong className="multi-highlight">
                {bestMulti
                  ? `${bestMulti.name} (${((bestMulti.gain ?? 0) / (bestMulti.bet || 1)).toFixed(1)}x)`
                  : '—'}
              </strong>
            </div>
            <div className="insight-row">
              <span>Multiplicateur Moyen</span>
              <strong>{averageMulti.toFixed(1)}x</strong>
            </div>
          </article>

          <article className="insight-box">
            <h4>🎰 Stats Machines</h4>
            <div className="insight-row">
              <span>Provider Favori</span>
              <strong>
                {providerStats ? (
                  <>
                    {providerStats[0]} <em>({providerStats[1]} slots)</em>
                  </>
                ) : (
                  '—'
                )}
              </strong>
            </div>
            <div className="insight-row">
              <span>En attente</span>
              <strong>{pending.length} slot{pending.length > 1 ? 's' : ''}</strong>
            </div>
            <div className="insight-row">
              <span>Collectées</span>
              <strong className="collected-text">{collected.length} slot{collected.length > 1 ? 's' : ''}</strong>
            </div>
          </article>
        </div>

        {/* Slots Table Panel */}
        <div className="hunt-slots-panel">
          <div className="hunt-panel-toolbar">
            <div className="table-filters">
              <div className="filter-search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Filtrer les machines…"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
                {tableSearch && (
                  <button type="button" onClick={() => setTableSearch('')} className="clear-btn">
                    ×
                  </button>
                )}
              </div>

              <div className="status-tabs">
                <button
                  type="button"
                  className={tableStatusFilter === 'all' ? 'active' : ''}
                  onClick={() => setTableStatusFilter('all')}
                >
                  Toutes ({entries.length})
                </button>
                <button
                  type="button"
                  className={tableStatusFilter === 'pending' ? 'active' : ''}
                  onClick={() => setTableStatusFilter('pending')}
                >
                  En attente ({pending.length})
                </button>
                <button
                  type="button"
                  className={tableStatusFilter === 'collected' ? 'active' : ''}
                  onClick={() => setTableStatusFilter('collected')}
                >
                  Collectées ({collected.length})
                </button>
              </div>
            </div>

            <div className="table-actions-right">
              <select
                value={tableSort}
                onChange={(e) => setTableSort(e.target.value as typeof tableSort)}
                className="table-sort-select"
                aria-label="Trier le tableau"
              >
                <option value="default">Tri : Ordre d’ajout</option>
                <option value="gain-desc">Tri : Plus gros gain</option>
                <option value="multi-desc">Tri : Plus gros multi</option>
                <option value="bet-desc">Tri : Plus grosse mise</option>
              </select>

              <button
                type="button"
                className="hunt-button-secondary"
                onClick={resetActiveGains}
                title="Remettre tous les gains à zéro"
              >
                🔄 Réinitialiser
              </button>
              <button
                type="button"
                className="hunt-button-primary"
                onClick={openAddModal}
              >
                + Ajouter
              </button>
            </div>
          </div>

          {displayedEntries.length > 0 ? (
            <div className="hunt-session-table-wrap">
              <table className="hunt-session-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Machine</th>
                    <th>Provider</th>
                    <th>Mise</th>
                    <th>Statut</th>
                    <th>Gain</th>
                    <th>Multiplicateur</th>
                    <th aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEntries.map((entry, index) => {
                    const multi =
                      entry.gain !== null && entry.bet > 0
                        ? (entry.gain / entry.bet).toFixed(1)
                        : null;
                    return (
                      <tr key={entry.id} className={entry.collected ? 'row-collected' : 'row-pending'}>
                        <td className="col-idx">{index + 1}</td>
                        <td data-label="Machine">
                          <div className="slot-identity">
                            <SlotThumb src={entry.thumbnailUrl} name={entry.name} />
                            <div className="slot-name-block">
                              <strong>{entry.name}</strong>
                              <span className="slot-sub-provider">{entry.provider}</span>
                            </div>
                          </div>
                        </td>
                        <td data-label="Provider" className="col-provider">
                          <span className="provider-tag">{entry.provider}</span>
                        </td>
                        <td data-label="Mise">
                          <div className="compact-input-group">
                            <label className="compact-input">
                              <input
                                aria-label={`Mise pour ${entry.name}`}
                                inputMode="decimal"
                                value={entry.bet}
                                onChange={(e) =>
                                  patchEntry(entry.id, {
                                    bet: Math.max(0.01, safeNumber(e.target.value)),
                                  })
                                }
                              />
                              <span>€</span>
                            </label>
                            <div className="quick-bet-steppers">
                              <button
                                type="button"
                                onClick={() =>
                                  patchEntry(entry.id, {
                                    bet: Math.max(0.2, Number((entry.bet + 0.5).toFixed(2))),
                                  })
                                }
                              >
                                +0.5
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  patchEntry(entry.id, {
                                    bet: Math.max(0.2, Number(Math.max(0.2, entry.bet - 0.5).toFixed(2))),
                                  })
                                }
                              >
                                -0.5
                              </button>
                            </div>
                          </div>
                        </td>
                        <td data-label="Statut">
                          <button
                            type="button"
                            className={`status-toggle-btn ${entry.collected ? 'collected' : 'pending'}`}
                            onClick={() =>
                              patchEntry(entry.id, { collected: !entry.collected })
                            }
                          >
                            {entry.collected ? '✓ Collecté' : '⏳ En attente'}
                          </button>
                        </td>
                        <td data-label="Gain">
                          <label className="compact-input gain-input">
                            <input
                              aria-label={`Gain pour ${entry.name}`}
                              inputMode="decimal"
                              placeholder="0,00"
                              value={entry.gain !== null ? entry.gain : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  patchEntry(entry.id, { gain: null, collected: false });
                                } else {
                                  patchEntry(entry.id, {
                                    gain: safeNumber(val),
                                    collected: true,
                                  });
                                }
                              }}
                            />
                            <span>€</span>
                          </label>
                        </td>
                        <td data-label="Multiplicateur">
                          <span
                            className={`multi-badge ${
                              multi && Number(multi) >= 100
                                ? 'mega-multi'
                                : multi && Number(multi) >= 50
                                ? 'big-multi'
                                : ''
                            }`}
                          >
                            {multi !== null ? `${multi}x` : '—'}
                          </span>
                        </td>
                        <td data-label="Action" className="col-action">
                          <button
                            type="button"
                            className="delete-entry-btn"
                            aria-label={`Supprimer ${entry.name}`}
                            title="Supprimer cette slot"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="hunt-no-slots">
              <span className="no-slots-icon">+</span>
              <h4>
                {tableSearch || tableStatusFilter !== 'all'
                  ? 'Aucune machine ne correspond à votre filtre'
                  : 'Aucune machine dans ce Bonus Hunt'}
              </h4>
              <p>
                {tableSearch || tableStatusFilter !== 'all'
                  ? 'Essayez de modifier votre recherche ou vos filtres.'
                  : 'Ajoutez votre première slot depuis le catalogue ou saisissez un nom personnalisé.'}
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={openAddModal}
              >
                + Ajouter une machine ↗
              </button>
            </div>
          )}

          <div className="hunt-board-footer">
            <p>
              🔒 <strong>Vos données sont privées :</strong> Vos sessions sont enregistrées
              uniquement dans la mémoire de votre navigateur (LocalStorage).
            </p>
            <div className="footer-quick-links">
              <button type="button" onClick={openEditModal}>
                Modifier la bankroll
              </button>
              <span>•</span>
              <button type="button" onClick={() => deleteHunt(activeHunt.id)} className="text-danger">
                Supprimer la session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE HUNT MODAL */}
      {showCreate && (
        <CreateModal
          title={huntTitle}
          startAmount={huntStartAmount}
          setTitle={setHuntTitle}
          setStartAmount={setHuntStartAmount}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateHunt}
        />
      )}

      {/* EDIT HUNT MODAL */}
      {showEditHunt && (
        <EditHuntModal
          title={huntTitle}
          startAmount={huntStartAmount}
          setTitle={setHuntTitle}
          setStartAmount={setHuntStartAmount}
          onClose={() => setShowEditHunt(false)}
          onSubmit={handleEditHunt}
        />
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <div
          className="hunt-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setShowImport(false)}
        >
          <form className="hunt-modal" onSubmit={handleImportJSON}>
            <button
              className="modal-close"
              type="button"
              aria-label="Fermer"
              onClick={() => setShowImport(false)}
            >
              ×
            </button>
            <div className="modal-heading">
              <span>📥</span>
              <div>
                <h3>IMPORTER UN FICHIER JSON</h3>
                <p>Collez le code JSON de sauvegarde généré lors d’une précédente exportation.</p>
              </div>
            </div>
            <label className="modal-field">
              <span>Données JSON</span>
              <textarea
                required
                rows={8}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='{"hunts": [...]}'
                className="json-textarea"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowImport(false)}>
                Annuler
              </button>
              <button className="confirm" type="submit">
                Importer les sessions
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD SLOT MODAL (CATALOG & CUSTOM) */}
      {showAdd && (
        <div
          className="hunt-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <form className="hunt-modal hunt-add-modal" onSubmit={handleAddSlot}>
            <button
              className="modal-close"
              type="button"
              aria-label="Fermer"
              onClick={() => setShowAdd(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <span>+</span>
              <div>
                <h3>AJOUTER UNE MACHINE</h3>
                <p>Sélectionnez une slot du catalogue ou ajoutez un titre personnalisé.</p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="modal-tab-selector">
              <button
                type="button"
                className={catalogTab === 'catalog' ? 'active' : ''}
                onClick={() => setCatalogTab('catalog')}
              >
                Catalogue ({catalog.length.toLocaleString('fr-FR')} slots)
              </button>
              <button
                type="button"
                className={catalogTab === 'custom' ? 'active' : ''}
                onClick={() => setCatalogTab('custom')}
              >
                Ajout libre / Machine personnalisée
              </button>
            </div>

            {catalogTab === 'catalog' ? (
              <>
                <div className="catalog-tools">
                  <label className="search-field">
                    <span>⌕</span>
                    <input
                      autoFocus
                      placeholder="Rechercher par nom (ex: Gates, Le Bandit, Reactoonz)…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setVisibleLimit(48);
                      }}
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="clear-query"
                      >
                        ×
                      </button>
                    )}
                  </label>

                  <select
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value);
                      setVisibleLimit(48);
                    }}
                    className="provider-select"
                  >
                    {providers.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="catalog-results">
                  {filteredCatalog.slice(0, visibleLimit).map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      className={`catalog-slot-card ${
                        selectedSlot?.id === slot.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <SlotThumb src={slot.thumbnailUrl} name={slot.name} large />
                      <div className="slot-info">
                        <strong>{slot.name}</strong>
                        <small>
                          {slot.provider}
                          {slot.rtp ? ` · RTP ${slot.rtp}%` : ''}
                        </small>
                      </div>
                      <span className="select-check">
                        {selectedSlot?.id === slot.id ? '✓' : '+'}
                      </span>
                    </button>
                  ))}

                  {filteredCatalog.length === 0 && (
                    <div className="catalog-empty">
                      <p>Aucune machine trouvée pour « {query} ».</p>
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() => {
                          setCatalogTab('custom');
                          setCustomSlotName(query);
                        }}
                      >
                        Créer « {query} » en ajout libre ↗
                      </button>
                    </div>
                  )}
                </div>

                {filteredCatalog.length > visibleLimit && (
                  <button
                    className="catalog-more-btn"
                    type="button"
                    onClick={() => setVisibleLimit((l) => l + 60)}
                  >
                    Afficher plus de machines ({filteredCatalog.length - visibleLimit} restantes)
                  </button>
                )}

                <div className="selected-slot-row">
                  <div className="selection-label">
                    <span>Machine sélectionnée :</span>
                    <strong>{selectedSlot?.name ?? 'Cliquez sur une machine ci-dessus'}</strong>
                  </div>

                  <div className="bet-setup">
                    <label>
                      <span>Mise (€)</span>
                      <span className="modal-money-input">
                        <input
                          inputMode="decimal"
                          value={bet}
                          onChange={(e) => setBet(e.target.value)}
                        />
                        <b>€</b>
                      </span>
                    </label>

                    <div className="quick-bet-chips">
                      {['0.40', '1.00', '2.00', '5.00'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setBet(chip)}
                          className={bet === chip ? 'active' : ''}
                        >
                          {chip}€
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAdd(false)}>
                    Annuler
                  </button>
                  <button className="confirm" type="submit" disabled={!selectedSlot}>
                    Ajouter à la session ↗
                  </button>
                </div>
              </>
            ) : (
              /* CUSTOM SLOT FORM */
              <div className="custom-slot-form">
                <label className="modal-field">
                  <span>Nom de la machine *</span>
                  <input
                    autoFocus
                    required
                    value={customSlotName}
                    onChange={(e) => setCustomSlotName(e.target.value)}
                    placeholder="Ex: Sweet Bonanza, RIP City, Razor Shark…"
                  />
                </label>

                <label className="modal-field">
                  <span>Fournisseur / Provider</span>
                  <input
                    value={customProvider}
                    onChange={(e) => setCustomProvider(e.target.value)}
                    placeholder="Ex: Pragmatic Play, Hacksaw Gaming, Push Gaming…"
                  />
                </label>

                <div className="bet-setup-custom">
                  <label className="modal-field">
                    <span>Mise de départ (€)</span>
                    <span className="modal-money-input">
                      <input
                        required
                        inputMode="decimal"
                        value={bet}
                        onChange={(e) => setBet(e.target.value)}
                      />
                      <b>€</b>
                    </span>
                  </label>

                  <div className="quick-bet-chips">
                    {['0.20', '0.50', '1.00', '2.00', '5.00', '10.00'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setBet(chip)}
                        className={bet === chip ? 'active' : ''}
                      >
                        {chip}€
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAdd(false)}>
                    Annuler
                  </button>
                  <button className="confirm" type="submit" disabled={!customSlotName.trim()}>
                    Ajouter la machine personnalisée ↗
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

function SlotThumb({
  src,
  name,
  large = false,
}: {
  src?: string | null;
  name: string;
  large?: boolean;
}) {
  const initial = name ? name.slice(0, 1).toUpperCase() : '?';
  return (
    <span
      className={`slot-thumb ${large ? 'large' : ''}`}
      data-initial={initial}
      aria-hidden="true"
    >
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </span>
  );
}

type ModalProps = {
  title: string;
  startAmount: string;
  setTitle: (value: string) => void;
  setStartAmount: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function CreateModal({
  title,
  startAmount,
  setTitle,
  setStartAmount,
  onClose,
  onSubmit,
}: ModalProps) {
  return (
    <div
      className="hunt-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className="hunt-modal" onSubmit={onSubmit}>
        <button className="modal-close" type="button" aria-label="Fermer" onClick={onClose}>
          ×
        </button>
        <div className="modal-heading">
          <span>+</span>
          <div>
            <h3>CRÉER UN NOUVEAU HUNT</h3>
            <p>Le hunt et son tableau seront sauvegardés automatiquement dans votre navigateur.</p>
          </div>
        </div>
        <label className="modal-field">
          <span>Titre de la session</span>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Bonus Hunt du Samedi, Live Rumble #12…"
          />
        </label>
        <label className="modal-field">
          <span>Montant de départ / Bankroll</span>
          <span className="modal-money-input">
            <input
              required
              inputMode="decimal"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              placeholder="1500"
            />
            <b>€</b>
          </span>
        </label>
        <label className="modal-field">
          <span>Devise</span>
          <select disabled>
            <option>EUR — Euro (€)</option>
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="confirm" type="submit">
            Créer et enregistrer ↗
          </button>
        </div>
      </form>
    </div>
  );
}

function EditHuntModal({
  title,
  startAmount,
  setTitle,
  setStartAmount,
  onClose,
  onSubmit,
}: ModalProps) {
  return (
    <div
      className="hunt-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className="hunt-modal" onSubmit={onSubmit}>
        <button className="modal-close" type="button" aria-label="Fermer" onClick={onClose}>
          ×
        </button>
        <div className="modal-heading">
          <span>✎</span>
          <div>
            <h3>MODIFIER LA SESSION</h3>
            <p>Mettez à jour le nom du hunt ou ajustez votre bankroll initiale.</p>
          </div>
        </div>
        <label className="modal-field">
          <span>Titre de la session</span>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de la session"
          />
        </label>
        <label className="modal-field">
          <span>Montant de départ / Bankroll</span>
          <span className="modal-money-input">
            <input
              required
              inputMode="decimal"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              placeholder="1500"
            />
            <b>€</b>
          </span>
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="confirm" type="submit">
            Enregistrer les modifications ↗
          </button>
        </div>
      </form>
    </div>
  );
}
