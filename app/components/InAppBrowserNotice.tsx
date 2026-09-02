'use client';

import { useState, useSyncExternalStore } from 'react';

/**
 * Navigateurs intégrés dans lesquels la connexion Discord se passe mal.
 *
 * Le vrai problème de la connexion mobile n'est pas Discord lui-même : c'est
 * que le lien du site est souvent ouvert DEPUIS Discord ou Telegram, donc dans
 * leur navigateur intégré. Ce contexte a son propre stockage de cookies :
 * l'utilisateur n'y est pas connecté à Discord et doit ressaisir e-mail, mot
 * de passe et 2FA — au lieu du simple « Autoriser » qu'il aurait dans Safari
 * ou Chrome où sa session Discord existe déjà.
 *
 * Détection par User-Agent, donc heuristique : Telegram sur iOS notamment ne
 * laisse aucune trace fiable. On avertit quand on reconnaît, on ne bloque
 * jamais le bouton de connexion.
 */
const IN_APP_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bDiscord\b/i, name: 'Discord' },
  { pattern: /\bTelegram\b/i, name: 'Telegram' },
  { pattern: /\bInstagram\b/i, name: 'Instagram' },
  { pattern: /FBAN|FBAV|FB_IAB/i, name: 'Facebook' },
  { pattern: /\bSnapchat\b/i, name: 'Snapchat' },
  { pattern: /musical_ly|Bytedance/i, name: 'TikTok' },
  { pattern: /LinkedInApp/i, name: 'LinkedIn' },
  { pattern: /\bLine\//i, name: 'LINE' },
];

type Env = { app: string; android: boolean } | null;

/** Le User-Agent ne change jamais : l'abonnement est un no-op. */
const subscribe = () => () => {};

/**
 * Snapshot mis en cache : `useSyncExternalStore` compare les résultats par
 * identité, un nouvel objet à chaque appel provoquerait une boucle de rendu.
 */
let cached: Env;
let read = false;

function detect(): Env {
  if (!read) {
    read = true;
    const ua = navigator.userAgent;
    const match = IN_APP_PATTERNS.find((entry) => entry.pattern.test(ua));
    cached = match ? { app: match.name, android: /Android/i.test(ua) } : null;
  }
  return cached;
}

/** Serveur et hydratation : rien affiché, donc aucun décalage de rendu. */
const getServerSnapshot = (): Env => null;

export default function InAppBrowserNotice() {
  // `useSyncExternalStore` plutôt qu'un effet : lire le User-Agent est la
  // lecture d'une source externe, et cette forme évite le rendu en cascade.
  const env = useSyncExternalStore(subscribe, detect, getServerSnapshot);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle');

  if (!env) return null;

  /**
   * Sur Android, une webview peut passer la main à Chrome via un lien
   * `intent://`. iOS n'a pas d'équivalent fiable : on se rabat sur la copie
   * du lien, que l'utilisateur colle dans Safari.
   */
  function openInChrome() {
    const { host, pathname, search, href } = window.location;
    // `browser_fallback_url` évite un ERR_UNKNOWN_URL_SCHEME si Chrome est
    // absent de l'appareil : la webview recharge simplement la page.
    const fallback = `S.browser_fallback_url=${encodeURIComponent(href)}`;
    window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;${fallback};end`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState('done');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      // Presse-papier refusé par le navigateur : on le dit, sinon le bouton
      // paraît simplement cassé.
      setCopyState('failed');
    }
  }

  return (
    <aside className="inapp-notice" role="note">
      <p>
        Le navigateur intégré de <strong>{env.app}</strong> fait souvent échouer la connexion.
      </p>
      {env.android ? (
        <button type="button" className="inapp-notice-btn" onClick={openInChrome}>
          Ouvrir dans Chrome
        </button>
      ) : (
        <button type="button" className="inapp-notice-btn" onClick={copyLink}>
          {copyState === 'done' && '✓ Copié — collez dans Safari'}
          {copyState === 'failed' && 'Copiez l’adresse en haut de l’écran'}
          {copyState === 'idle' && 'Copier le lien pour Safari'}
        </button>
      )}
    </aside>
  );
}
