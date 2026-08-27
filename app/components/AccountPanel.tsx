'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatCountdown, secondsUntil } from '../lib/verification';
import { ArrowIcon, DiscordIcon } from './BrandIcons';

type ActiveCode = { code: string; expiresAt: string };

type LinkCodeResponse = { code: string; expiresAt: string; error?: never };
type LinkCodeError = { error: string; code?: never; expiresAt?: never };

/** Bouton de connexion Discord (état déconnecté). */
export function DiscordSignIn() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setPending(true);
    setError(null);
    const supabase = createClient();
    // Aucune query string ici : Supabase compare l'URL de redirection à sa
    // liste blanche en incluant les paramètres. Un `?next=…` ne matcherait
    // pas une entrée `.../auth/callback` et Supabase retomberait
    // silencieusement sur le Site URL (l'utilisateur atterrit sur l'accueil,
    // non connecté).
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signInError) {
      setError('Connexion Discord indisponible pour le moment. Réessayez.');
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="discord-auth-btn"
        onClick={signIn}
        disabled={pending}
        aria-busy={pending}
      >
        <DiscordIcon size={20} />
        <span>{pending ? 'Redirection vers Discord…' : 'Se connecter avec Discord'}</span>
        <ArrowIcon />
      </button>
      {error && (
        <p className="account-notice is-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

/** Génération et affichage du code `!verify` (connecté, non lié). */
export function LinkCodePanel({ initialCode }: { initialCode: ActiveCode | null }) {
  const [active, setActive] = useState<ActiveCode | null>(initialCode);
  const [remaining, setRemaining] = useState(() =>
    initialCode ? secondsUntil(initialCode.expiresAt) : 0
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Durée de référence de la jauge : le plus grand « restant » observé pour le
  // code courant. Évite de coupler l'affichage à la variable d'env du serveur.
  const [total, setTotal] = useState(remaining);

  // Décompte : le code doit visiblement expirer, sinon l'utilisateur tape un
  // code mort et ne comprend pas le refus du bot.
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const left = secondsUntil(active.expiresAt);
      setRemaining(left);
      setTotal((previous) => Math.max(previous, left));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const expired = active !== null && remaining <= 0;
  const percent = active && !expired && total > 0 ? Math.min(100, (remaining / total) * 100) : 0;

  const request = useCallback(async () => {
    setPending(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch('/api/account/link-code', { method: 'POST' });
      const payload = (await response.json()) as LinkCodeResponse | LinkCodeError;
      if (!response.ok || !payload.code) {
        setError(payload.error ?? 'Erreur inattendue.');
        return;
      }
      setTotal(0);
      setActive({ code: payload.code, expiresAt: payload.expiresAt });
    } catch {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setPending(false);
    }
  }, []);

  const command = useMemo(() => (active ? `!verify ${active.code}` : ''), [active]);

  const copy = async () => {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copie impossible : sélectionnez le code à la main.');
    }
  };

  return (
    <article className="account-card is-current" aria-labelledby="link-step-title">
      <header className="account-card-head">
        <span className="account-step-tag">Étape 2</span>
        <h2 id="link-step-title">Lier votre pseudo Rumble</h2>
      </header>

      {!active || expired ? (
        <>
          <p className="account-card-text">
            Générez un code à usage unique, puis tapez-le dans le chat du live. Le bot associe
            alors le pseudo Rumble utilisé à ce compte, et vos points apparaissent ici.
          </p>
          {expired && (
            <p className="account-notice is-warning" role="status">
              Ce code a expiré. Générez-en un nouveau pour réessayer.
            </p>
          )}
          <button
            type="button"
            className="button button-primary account-action"
            onClick={request}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? 'Génération…' : expired ? 'Générer un nouveau code' : 'Générer mon code'}
            <ArrowIcon />
          </button>
        </>
      ) : (
        <>
          <p className="account-card-text">
            Copiez cette commande et collez-la dans le chat Rumble pendant le live :
          </p>

          <div className="code-block">
            <code aria-label={`Commande à taper dans le chat : ${command}`}>{command}</code>
            <button
              type="button"
              className={`code-copy-btn ${copied ? 'is-copied' : ''}`}
              onClick={copy}
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          <div className="code-countdown">
            <div className="code-countdown-bar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} suppressHydrationWarning />
            </div>
            <p suppressHydrationWarning>
              Valable encore <strong>{formatCountdown(remaining)}</strong>
            </p>
          </div>

          <ul className="account-hint-list">
            <li>Usage unique : le code est consommé dès qu’il est validé.</li>
            <li>À taper depuis le pseudo Rumble que vous voulez lier.</li>
          </ul>

          <button
            type="button"
            className="account-text-btn"
            onClick={request}
            disabled={pending}
          >
            {pending ? 'Génération…' : 'Générer un autre code'}
          </button>
        </>
      )}

      {error && (
        <p className="account-notice is-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

/** Bouton de déconnexion (POST : un GET serait déclenchable par un lien tiers). */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="account-signout-btn">
        Se déconnecter
      </button>
    </form>
  );
}
