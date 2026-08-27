'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Raccourci vers la console d'administration, avec le nombre de demandes en
 * attente.
 *
 * N'apparaît que si Postgres confirme `is_admin()`. Ce n'est qu'un raccourci
 * d'interface : la page `/admin` et chaque action sont revalidées côté serveur,
 * donc afficher ce lien ne donne aucun droit.
 */
export default function HeaderAdminLink({ onNavigate }: { onNavigate?: () => void }) {
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const { data: session } = await supabase.auth.getSession();
        if (cancelled || !session.session) return;

        const { data: isAdmin, error } = await supabase.rpc('is_admin');
        if (cancelled || error || !isAdmin) return;

        const { data: counts } = await supabase.rpc('admin_ticket_counts');
        if (cancelled) return;

        const total = ((counts ?? []) as { pending: number }[]).reduce(
          (sum, row) => sum + (row.pending ?? 0),
          0
        );
        setPending(total);
      } catch {
        // Système de tickets non installé : on n'affiche simplement rien.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (pending === null) return null;

  return (
    <Link className="header-admin-cta" href="/admin" onClick={onNavigate} title="Console d’administration">
      <span>Admin</span>
      {pending > 0 && (
        <span className="header-admin-badge" aria-label={`${pending} demandes en attente`}>
          {pending}
        </span>
      )}
    </Link>
  );
}
