'use client';

import { useState } from 'react';
import { ArrowIcon } from './BrandIcons';

/**
 * Bouton de demande d'un article de la boutique.
 *
 * Le prix n'est pas transmis : la route API le relit dans le catalogue serveur
 * à partir du palier ou du slug, pour qu'on ne puisse pas commander une carte
 * de 100 USDT au tarif d'une carte de 5.
 */
export default function ShopRequestButton({
  kind,
  usdt,
  slug,
  label,
}: {
  kind: 'giftcard' | 'bonusbuy';
  usdt?: number;
  slug?: string;
  label: string;
}) {
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setState('pending');
    setError(null);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, usdt, slug }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Erreur inattendue.');
        setState('idle');
        return;
      }
      setState('done');
    } catch {
      setError('Connexion impossible. Réessayez.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <span className="giftcard-cta is-sent" role="status">
        ✓ Demande envoyée
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="button button-primary giftcard-cta"
        onClick={submit}
        disabled={state === 'pending'}
        aria-busy={state === 'pending'}
      >
        {state === 'pending' ? 'Envoi…' : label} <ArrowIcon />
      </button>
      {error && (
        <p className="account-notice is-error shop-inline-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
