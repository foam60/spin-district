'use client';

import { useEffect, useMemo, useState } from 'react';
import { fallbackSlots, type SlotRelease } from '../data/slots';

type HuntEntry = { id: string; slotId: string; name: string; provider: string; thumbnailUrl?: string | null; bet: number; gain: number | null; collected: boolean };
type Hunt = { id: string; title: string; startAmount: number; currency: 'EUR'; createdAt: string; entries: HuntEntry[] };
type StoredState = { hunts: Hunt[]; activeId: string | null };
const STORAGE_KEY = 'spin-district-hunts-v2';
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function safeNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function BonusHuntBoard() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<SlotRelease[]>(fallbackSlots);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('Bonus Hunt Spin District');
  const [startAmount, setStartAmount] = useState('1500');
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('Tous');
  const [visibleLimit, setVisibleLimit] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<SlotRelease | null>(null);
  const [bet, setBet] = useState('1');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredState;
        setHunts(Array.isArray(stored.hunts) ? stored.hunts : []);
        setActiveId(stored.activeId ?? stored.hunts?.[0]?.id ?? null);
      }
    } catch {}
    setReady(true);
    fetch('/api/slots').then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const slots = (payload as { slots?: SlotRelease[] }).slots;
        if (slots?.length) setCatalog(slots);
      })
      .catch(() => {}).finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ hunts, activeId } satisfies StoredState));
  }, [activeId, hunts, ready]);

  const activeHunt = hunts.find((hunt) => hunt.id === activeId) ?? null;
  const entries = activeHunt?.entries ?? [];
  const totalGain = entries.reduce((sum, entry) => sum + (entry.gain ?? 0), 0);
  const totalBet = entries.reduce((sum, entry) => sum + entry.bet, 0);
  const pendingBet = entries.filter((entry) => !entry.collected).reduce((sum, entry) => sum + entry.bet, 0);
  const collected = entries.filter((entry) => entry.collected);
  const profit = totalGain - (activeHunt?.startAmount ?? 0);
  const breakEven = totalBet > 0 && activeHunt ? activeHunt.startAmount / totalBet : 0;
  const evolvingBreakEven = pendingBet > 0 && activeHunt ? Math.max(0, activeHunt.startAmount - totalGain) / pendingBet : 0;
  const bestGain = [...collected].sort((a, b) => (b.gain ?? 0) - (a.gain ?? 0))[0];
  const bestMulti = [...collected].sort((a, b) => ((b.gain ?? 0) / b.bet) - ((a.gain ?? 0) / a.bet))[0];

  const providerStats = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => counts.set(entry.provider, (counts.get(entry.provider) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [entries]);
  const providers = useMemo(() => ['Tous', ...Array.from(new Set(catalog.map((slot) => slot.provider))).sort()], [catalog]);
  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr');
    return catalog.filter((slot) => (provider === 'Tous' || slot.provider === provider) && (!needle || `${slot.name} ${slot.provider}`.toLocaleLowerCase('fr').includes(needle)));
  }, [catalog, provider, query]);

  function updateActive(updater: (hunt: Hunt) => Hunt) {
    setHunts((current) => current.map((hunt) => hunt.id === activeId ? updater(hunt) : hunt));
  }
  function createHunt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hunt: Hunt = { id: uid(), title: title.trim() || 'Bonus Hunt', startAmount: safeNumber(startAmount), currency: 'EUR', createdAt: new Date().toISOString(), entries: [] };
    setHunts((current) => [hunt, ...current]); setActiveId(hunt.id); setShowCreate(false);
  }
  function openAdd() { setQuery(''); setProvider('Tous'); setVisibleLimit(60); setSelectedSlot(null); setBet('1'); setShowAdd(true); }
  function addSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || !activeHunt) return;
    const entry: HuntEntry = { id: uid(), slotId: selectedSlot.id, name: selectedSlot.name, provider: selectedSlot.provider, thumbnailUrl: selectedSlot.thumbnailUrl, bet: Math.max(.01, safeNumber(bet)), gain: null, collected: false };
    updateActive((hunt) => ({ ...hunt, entries: [...hunt.entries, entry] })); setShowAdd(false);
  }
  function patchEntry(id: string, patch: Partial<HuntEntry>) {
    updateActive((hunt) => ({ ...hunt, entries: hunt.entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry) }));
  }
  function deleteEntry(id: string) { updateActive((hunt) => ({ ...hunt, entries: hunt.entries.filter((entry) => entry.id !== id) })); }
  function deleteHunt() {
    if (!activeHunt) return;
    const remaining = hunts.filter((hunt) => hunt.id !== activeHunt.id);
    setHunts(remaining); setActiveId(remaining[0]?.id ?? null);
  }

  if (!ready) return <div className="hunt-loading">Chargement du Hunt Lab…</div>;
  if (!activeHunt) {
    return <div className="hunt-empty-state">
      <div className="hunt-empty-icon">+</div><p className="hunt-overline">TON TABLEAU PERSONNEL</p>
      <h3>PRÊT À LANCER<br /><em>TA PREMIÈRE CHASSE ?</em></h3>
      <p>Crée une session, ajoute les bonus du catalogue et suis automatiquement tes gains, multiplicateurs et seuil de rentabilité.</p>
      <button className="button button-primary" type="button" onClick={() => setShowCreate(true)}>Créer mon premier hunt <span>↗</span></button>
      <p className="hunt-local-note">Sauvegarde locale • sans compte • plus de {catalog.length.toLocaleString('fr-FR')} slots</p>
      {showCreate && <CreateModal title={title} startAmount={startAmount} setTitle={setTitle} setStartAmount={setStartAmount} onClose={() => setShowCreate(false)} onSubmit={createHunt} />}
    </div>;
  }

  return <div className="hunt-app">
    <div className="hunt-appbar"><div><span className="hunt-live-dot"><i /> Hunt en cours</span><select aria-label="Choisir un hunt" value={activeId ?? ''} onChange={(event) => setActiveId(event.target.value)}>{hunts.map((hunt) => <option key={hunt.id} value={hunt.id}>{hunt.title}</option>)}</select></div><div className="hunt-app-actions"><button type="button" className="hunt-button-secondary" onClick={deleteHunt}>Supprimer</button><button type="button" className="hunt-button-primary" onClick={() => setShowCreate(true)}>+ Nouveau hunt</button></div></div>
    <div className="hunt-metrics">
      <article><span>Montant de départ</span><strong>{money.format(activeHunt.startAmount)}</strong><small>Bankroll définie</small></article>
      <article><span>Total gagné</span><strong>{money.format(totalGain)}</strong><small>{collected.length} bonus collecté{collected.length > 1 ? 's' : ''}</small></article>
      <article className={profit >= 0 ? 'positive' : 'negative'}><span>↗ Profit / Pertes</span><strong>{profit >= 0 ? '+' : ''}{money.format(profit)}</strong><small>par rapport au départ</small></article>
      <article className="slots-count"><span># Slots</span><strong>{entries.length}</strong><small><b>{entries.length - collected.length} en attente</b><b>{collected.length} collectés</b></small></article>
    </div>
    <div className="hunt-insights">
      <article><h4>◎ Break Even</h4><div><span>Break Even fixe</span><strong>{breakEven.toFixed(1)}x</strong></div><div><span>Break Even évolutif</span><strong>{evolvingBreakEven.toFixed(1)}x</strong></div></article>
      <article><h4>▣ Providers</h4><div><span>Le plus joué</span><strong>{providerStats ? providerStats[0] : '—'} <em>{providerStats?.[1] ?? 0}</em></strong></div></article>
      <article><h4>☆ Remarquables</h4><div><span>Meilleur gain</span><strong>{bestGain ? `${bestGain.name} · ${money.format(bestGain.gain ?? 0)}` : '—'}</strong></div><div><span>Meilleur multiplicateur</span><strong>{bestMulti ? `${bestMulti.name} · ${((bestMulti.gain ?? 0) / bestMulti.bet).toFixed(1)}x` : '—'}</strong></div></article>
    </div>
    <div className="hunt-slots-panel">
      <div className="hunt-panel-title"><div><span>TABLEAU DE SESSION</span><h3>DÉTAIL DES SLOTS <em>({entries.length})</em></h3></div><button type="button" className="hunt-button-primary" onClick={openAdd}>+ Ajouter une slot</button></div>
      {entries.length ? <div className="hunt-session-table-wrap"><table className="hunt-session-table"><thead><tr><th>Slot</th><th>Provider</th><th>Mise</th><th>Statut</th><th>Gain</th><th>Multi.</th><th>Action</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}>
        <td><span className="slot-identity"><SlotThumb src={entry.thumbnailUrl} name={entry.name} /><strong>{entry.name}</strong></span></td><td>{entry.provider}</td>
        <td><label className="compact-input"><input aria-label={`Mise ${entry.name}`} inputMode="decimal" value={entry.bet} onChange={(event) => patchEntry(entry.id, { bet: Math.max(.01, safeNumber(event.target.value)) })} /><span>€</span></label></td>
        <td><button className={entry.collected ? 'status collected' : 'status pending'} type="button" onClick={() => patchEntry(entry.id, { collected: !entry.collected })}>{entry.collected ? '◎ Collecté' : '○ En attente'}</button></td>
        <td><label className="compact-input gain"><input aria-label={`Gain ${entry.name}`} inputMode="decimal" placeholder="0,00" value={entry.gain ?? ''} onChange={(event) => patchEntry(entry.id, { gain: event.target.value === '' ? null : safeNumber(event.target.value), collected: event.target.value !== '' })} /><span>€</span></label></td>
        <td><strong className="multi-value">{entry.gain === null ? '—' : `${(entry.gain / entry.bet).toFixed(1)}x`}</strong></td><td><button className="delete-entry" type="button" aria-label={`Supprimer ${entry.name}`} onClick={() => deleteEntry(entry.id)}>×</button></td>
      </tr>)}</tbody></table></div> : <div className="hunt-no-slots"><span>+</span><h4>Aucun bonus enregistré</h4><p>Ajoute la première machine de ta chasse.</p><button type="button" onClick={openAdd}>Parcourir le catalogue</button></div>}
      <div className="hunt-board-footer"><p>Les données du hunt restent sur cet appareil. Aucun résultat ne garantit un gain futur.</p><p>Catalogue : <a href="https://www.slotindex.io/" target="_blank" rel="noopener">SlotIndex ↗</a></p></div>
    </div>
    {showCreate && <CreateModal title={title} startAmount={startAmount} setTitle={setTitle} setStartAmount={setStartAmount} onClose={() => setShowCreate(false)} onSubmit={createHunt} />}
    {showAdd && <div className="hunt-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowAdd(false)}><form className="hunt-modal hunt-add-modal" onSubmit={addSlot}>
      <button className="modal-close" type="button" aria-label="Fermer" onClick={() => setShowAdd(false)}>×</button><div className="modal-heading"><span>+</span><div><h3>AJOUTER UNE SLOT</h3><p>{catalogLoading ? 'Chargement du catalogue…' : `${catalog.length.toLocaleString('fr-FR')} machines disponibles`}</p></div></div>
      <div className="catalog-tools"><label><span>⌕</span><input autoFocus placeholder="Rechercher une machine" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleLimit(60); }} /></label><select value={provider} onChange={(event) => { setProvider(event.target.value); setVisibleLimit(60); }}>{providers.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="catalog-results">{filteredCatalog.slice(0, visibleLimit).map((slot) => <button type="button" key={slot.id} className={selectedSlot?.id === slot.id ? 'selected' : ''} onClick={() => setSelectedSlot(slot)}><SlotThumb src={slot.thumbnailUrl} name={slot.name} large /><span><strong>{slot.name}</strong><small>{slot.provider}{slot.rtp ? ` · RTP ${slot.rtp}%` : ''}</small></span><b>{selectedSlot?.id === slot.id ? '✓' : '+'}</b></button>)}{filteredCatalog.length === 0 && <p>Aucune slot trouvée.</p>}</div>
      {filteredCatalog.length > visibleLimit && <button className="catalog-more" type="button" onClick={() => setVisibleLimit((limit) => limit + 80)}>Afficher plus ({filteredCatalog.length - visibleLimit})</button>}
      <div className="selected-slot-row"><div><span>Slot sélectionnée</span><strong>{selectedSlot?.name ?? 'Choisis une machine ci-dessus'}</strong></div><label><span>Mise</span><span className="modal-money-input"><input inputMode="decimal" value={bet} onChange={(event) => setBet(event.target.value)} /><b>€</b></span></label></div>
      <div className="modal-actions"><button type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="confirm" type="submit" disabled={!selectedSlot}>Ajouter au hunt</button></div>
    </form></div>}
  </div>;
}

function SlotThumb({ src, name, large = false }: { src?: string | null; name: string; large?: boolean }) {
  return <span className={`slot-thumb${large ? ' large' : ''}`} data-initial={name.slice(0, 1).toUpperCase()} aria-hidden="true">
    {src && <img src={src} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
  </span>;
}

type CreateModalProps = { title: string; startAmount: string; setTitle: (value: string) => void; setStartAmount: (value: string) => void; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void };
function CreateModal({ title, startAmount, setTitle, setStartAmount, onClose, onSubmit }: CreateModalProps) {
  return <div className="hunt-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="hunt-modal" onSubmit={onSubmit}>
    <button className="modal-close" type="button" aria-label="Fermer" onClick={onClose}>×</button><div className="modal-heading"><span>+</span><div><h3>CRÉER UN NOUVEAU HUNT</h3><p>Configure ta prochaine session Bonus Hunt</p></div></div>
    <label className="modal-field"><span>Titre du hunt</span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nom de ton hunt" /></label>
    <label className="modal-field"><span>Montant de départ</span><span className="modal-money-input"><input required inputMode="decimal" value={startAmount} onChange={(event) => setStartAmount(event.target.value)} placeholder="1500" /><b>€</b></span></label>
    <label className="modal-field"><span>Devise</span><select disabled><option>EUR — Euro</option></select></label>
    <div className="modal-actions"><button type="button" onClick={onClose}>Annuler</button><button className="confirm" type="submit">Créer le hunt</button></div>
  </form></div>;
}
