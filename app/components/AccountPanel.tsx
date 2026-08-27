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

  const signIn = async () => {
    setPending(true);
    const supabase = createClient();
    // Aucune query string ici : Supabase compare l'URL de redirection à sa
    // liste blanche en incluant les paramètres. Un `?next=…` ne matcherait
    // pas une entrée `.../auth/callback` et Supabase retomberait
    // silencieusement sur le Site URL (l'utilisateur atterrit sur l'accueil,
    // non connecté).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setPending(false);
  };

  return (
    <button type="button" className="button button-primary" onClick={signIn} disabled={pending}>
      <DiscordIcon size={16} />
      {pending ? 'Redirection…' : 'Se connecter avec Discord'}
      <ArrowIcon />
    </button>
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

  // Décompte : le code doit visiblement expirer, sinon l'utilisateur tape un
  // code mort et ne comprend pas le refus du bot.
  useEffect(() => {
    if (!active) return;
    const tick = () => setRemaining(secondsUntil(active.expiresAt));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const expired = active !== null && remaining <= 0;

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
    <div className="content-card">
      <span className="card-kicker">Étape 2</span>
      <h3>Lier votre pseudo Rumble</h3>

      {!active || expired ? (
        <>
          <p className="card-copy">
            Générez un code, puis tapez-le dans le chat du live pour associer votre pseudo
            Rumble à ce compte. Vos points deviendront visibles ici.
          </p>
          {expired && (
            <p className="alert-box">Ce code a expiré. Générez-en un nouveau.</p>
          )}
          <button
            type="button"
            className="button button-primary"
            onClick={request}
            disabled={pending}
          >
            {pending ? 'Génération…' : expired ? 'Générer un nouveau code' : 'Générer mon code'}
            <ArrowIcon />
          </button>
        </>
      ) : (
        <>
          <p className="card-copy">
            Copiez cette commande et collez-la dans le chat Rumble pendant le live :
          </p>

          <div className="compact-input-group">
            <code className="formula" aria-label={`Commande à taper : ${command}`}>
              {command}
            </code>
            <button type="button" className="button button-ghost" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>

          <p className="offer-terms">
            Valable encore <strong>{formatCountdown(remaining)}</strong> · usage unique ·
            ne fonctionne que depuis le pseudo Rumble que vous souhaitez lier.
          </p>

          <button type="button" className="button button-ghost" onClick={request} disabled={pending}>
            {pending ? 'Génération…' : 'Générer un autre code'}
          </button>
        </>
      )}

      {error && <p className="alert-box text-danger">{error}</p>}
    </div>
  );
}

/** Bouton de déconnexion (POST : un GET serait déclenchable par un lien tiers). */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="button button-ghost">
        Se déconnecter
      </button>
    </form>
  );
}
