'use client';

import { useEffect, useMemo, useState } from 'react';
import { fallbackSlots, type SlotRelease } from '../data/slots';

type ApiPayload = {
  slots: SlotRelease[];
  source: 'slot-report' | 'slot-index' | 'celsius';
  updatedAt: string;
};

const volatilityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  'very-high': 'Très élevée',
  extreme: 'Extrême',
};

function formatDate(value: string | null) {
  if (!value) return 'Nouveau sur Celsius';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function BonusHuntBoard() {
  const [slots, setSlots] = useState<SlotRelease[]>(fallbackSlots);
  const [source, setSource] = useState<ApiPayload['source']>('celsius');
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('Tous');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/slots')
      .then((response) => {
        if (!response.ok) throw new Error('API indisponible');
        return response.json() as Promise<ApiPayload>;
      })
      .then((payload) => {
        if (!active || !payload.slots?.length) return;
        setSlots(payload.slots);
        setSource(payload.source);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const providers = useMemo(
    () => ['Tous', ...Array.from(new Set(slots.map((slot) => slot.provider))).slice(0, 6)],
    [slots],
  );

  const visibleSlots = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return slots.filter((slot) => {
      const matchesProvider = provider === 'Tous' || slot.provider === provider;
      const matchesQuery = !needle || `${slot.name} ${slot.provider}`.toLowerCase().includes(needle);
      return matchesProvider && matchesQuery;
    });
  }, [provider, query, slots]);

  function toggleSlot(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="hunt-board">
      <div className="hunt-toolbar">
        <div className="hunt-stats">
          <div><strong>{slots.length}</strong><span>Nouveautés</span></div>
          <div><strong>{selected.size}</strong><span>Dans ta sélection</span></div>
          <div className="hunt-feed-status"><i className={loading ? 'loading' : ''} /><span>{loading ? 'Actualisation…' : source === 'slot-report' ? 'Nouveautés quotidiennes' : source === 'slot-index' ? 'Catalogue vérifié' : 'Sélection Celsius'}</span></div>
        </div>
        <label className="hunt-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une machine ou un studio" />
        </label>
      </div>

      <div className="provider-filter" aria-label="Filtrer par studio">
        {providers.map((item) => (
          <button key={item} type="button" className={provider === item ? 'active' : ''} onClick={() => setProvider(item)}>{item}</button>
        ))}
      </div>

      <div className="hunt-table-wrap">
        <table className="hunt-table">
          <thead><tr><th>#</th><th>Machine</th><th>Studio</th><th>Mise à jour</th><th>RTP</th><th>Volatilité</th><th>Max win</th><th /></tr></thead>
          <tbody>
            {visibleSlots.map((slot, index) => {
              const isSelected = selected.has(slot.id);
              return (
                <tr key={slot.id} className={isSelected ? 'selected' : ''}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td><strong>{slot.name}</strong></td>
                  <td>{slot.provider}</td>
                  <td>{formatDate(slot.releaseDate)}</td>
                  <td>{slot.rtp ? `${slot.rtp.toFixed(2)} %` : '—'}</td>
                  <td>{slot.volatility ? volatilityLabels[slot.volatility] ?? slot.volatility : '—'}</td>
                  <td>{slot.maxWin ? `x${slot.maxWin.toLocaleString('fr-FR')}` : '—'}</td>
                  <td><button type="button" aria-pressed={isSelected} onClick={() => toggleSlot(slot.id)}>{isSelected ? 'Ajoutée ✓' : '+ Ajouter'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visibleSlots.length && <p className="hunt-empty">Aucune machine ne correspond à cette recherche.</p>}
      </div>

      <div className="hunt-board-footer">
        <p>La sélection est locale à cet appareil et n’engage aucune mise réelle.</p>
        <p className="hunt-sources">Sources : <a href="https://slot.report/" target="_blank" rel="noopener">slot.report</a> · <a href="https://www.slotindex.io/" target="_blank" rel="noopener">SlotIndex ↗</a></p>
      </div>
    </div>
  );
}
