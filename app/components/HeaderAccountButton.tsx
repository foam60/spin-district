'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UserIcon } from './BrandIcons';

type Identity = { name: string; avatar: string | null };

/**
 * Bouton Connexion / Mon compte du header.
 *
 * L'état de session est résolu côté navigateur (et non côté serveur) pour que
 * les pages publiques restent prérendues statiquement : un appel à `cookies()`
 * dans le layout basculerait tout le site en rendu dynamique.
 */
export default function HeaderAccountButton({ onNavigate }: { onNavigate?: () => void }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const read = (metadata: Record<string, unknown> | undefined, email?: string) => {
      const name =
        (typeof metadata?.full_name === 'string' && metadata.full_name) ||
        (typeof metadata?.name === 'string' && metadata.name) ||
        (typeof metadata?.user_name === 'string' && metadata.user_name) ||
        email ||
        'Mon compte';
      const avatar = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null;
      return { name, avatar };
    };

    // getSession() lit le cookie local : pas d'aller-retour réseau, donc pas
    // de clignotement « Connexion » → « Mon compte » perceptible.
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setIdentity(user ? read(user.user_metadata, user.email) : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIdentity(user ? read(user.user_metadata, user.email) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!identity) {
    return (
      <Link
        className="header-account-cta"
        href="/compte"
        onClick={onNavigate}
        title="Se connecter à son espace membre"
      >
        <UserIcon size={15} />
        <span>Connexion</span>
      </Link>
    );
  }

  const initial = identity.name.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <Link
      className="header-account-cta is-authenticated"
      href="/compte"
      onClick={onNavigate}
      title={`Mon compte — ${identity.name}`}
    >
      <span className="header-avatar" data-initial={initial}>
        {identity.avatar && (
          /* eslint-disable-next-line @next/next/no-img-element -- avatar Discord distant : pas de proxy d'optimisation nécessaire pour 28px */
          <img src={identity.avatar} alt="" width={28} height={28} referrerPolicy="no-referrer" />
        )}
      </span>
      <span className="header-account-name">{identity.name}</span>
    </Link>
  );
}
