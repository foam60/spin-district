'use client';

import Link from 'next/link';
import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'spin-district-age-ack-v1';

/** Repli mémoire si le stockage local est bloqué (navigation privée). */
let sessionAck = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot() {
  if (sessionAck) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Serveur + hydratation : bandeau masqué, pour éviter tout saut de mise en page. */
function getServerSnapshot() {
  return true;
}

/**
 * Bandeau 18+ / jeu responsable, indispensable côté conformité pour un site
 * d'affiliation casino. Affiché une seule fois par navigateur, sans impact SEO
 * (rendu côté client uniquement).
 */
export default function ResponsibleBanner() {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const acknowledge = useCallback(() => {
    sessionAck = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* stockage indisponible : l'accusé reste valable pour la session en cours */
    }
    notify();
  }, []);

  if (acknowledged) return null;

  return (
    <aside className="age-banner" role="region" aria-label="Avertissement jeu responsable">
      <div className="age-banner-inner">
        <span className="age-badge" aria-hidden="true">
          18+
        </span>
        <p>
          Spin District contient des <strong>liens partenaires</strong> vers des casinos en ligne
          réservés aux personnes majeures. Jouer comporte des risques : endettement, isolement,
          dépendance.{' '}
          <Link href="/jeu-responsable" className="age-banner-link">
            Nos règles de jeu responsable ↗
          </Link>
        </p>
        <button type="button" className="age-banner-btn" onClick={acknowledge}>
          J’ai 18 ans ou plus
        </button>
      </div>
    </aside>
  );
}
