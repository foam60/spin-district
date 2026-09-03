'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type BotLive = {
  is_live: boolean;
  updated_at: string | null;
  updated_by_email: string | null;
};

/** « il y a 4 min », sans dépendance de formatage de dates. */
function since(iso: string | null) {
  if (!iso) return null;
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export default function BotLiveToggle({
  status,
  unavailable,
}: {
  status: BotLive | null;
  /** Message d'installation quand `bot_live_status()` n'existe pas encore. */
  unavailable?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (unavailable) {
    return (
      <section className="bot-switch is-unavailable" aria-labelledby="bot-switch-title">
        <div className="bot-switch-text">
          <h2 id="bot-switch-title">Bot Rumble</h2>
          <p>{unavailable}</p>
        </div>
      </section>
    );
  }

  const live = status?.is_live ?? false;
  const ago = since(status?.updated_at ?? null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ live: !live }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Erreur inattendue.');
        return;
      }
      router.refresh();
    } catch {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={`bot-switch ${live ? 'is-live' : 'is-off'}`}
      aria-labelledby="bot-switch-title"
    >
      <div className="bot-switch-text">
        <h2 id="bot-switch-title">
          Bot Rumble
          <span className="bot-switch-state">
            <i className="status-dot" aria-hidden="true" />
            {live ? 'Actif' : 'Coupé'}
          </span>
        </h2>
        <p>
          {live
            ? 'Le bot suit le chat, distribue les points et valide les codes de liaison.'
            : 'Le bot tourne sur Railway mais reste en veille : aucun point distribué, aucun code validé.'}
        </p>
        {ago && (
          <p className="bot-switch-meta">
            Dernier changement {ago}
            {status?.updated_by_email ? ` par ${status.updated_by_email}` : ''}
          </p>
        )}
      </div>

      <div className="bot-switch-control">
        {/* Un vrai bouton : `aria-pressed` annonce l'état aux lecteurs
            d'écran, ce qu'une case à cocher stylée ne fait pas. */}
        <button
          type="button"
          className="bot-switch-btn"
          onClick={toggle}
          disabled={busy}
          aria-pressed={live}
        >
          <span className="bot-switch-track" aria-hidden="true">
            <span className="bot-switch-knob" />
          </span>
          {busy ? 'Envoi…' : live ? 'Couper le bot' : 'Activer le bot'}
        </button>
        {error && (
          <p className="bot-switch-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
