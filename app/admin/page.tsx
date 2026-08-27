import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminDashboard from '../components/AdminDashboard';
import PageShell from '../components/PageShell';
import { ArrowIcon } from '../components/BrandIcons';
import {
  ADMIN_FALLBACK_EMAIL,
  SETUP_HINT,
  type Member,
  type Ticket,
} from '../lib/tickets';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Autorité : la fonction Postgres `is_admin()`, pas l'e-mail lu côté app.
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');

  // Si la fonction n'existe pas encore, on montre la marche à suivre au
  // propriétaire du site plutôt qu'un 404 incompréhensible.
  const notInstalled = Boolean(adminError);
  const ownerFallback =
    notInstalled && user.email?.toLowerCase() === ADMIN_FALLBACK_EMAIL.toLowerCase();

  if (!isAdmin && !ownerFallback) notFound();

  if (notInstalled) {
    return (
      <PageShell
        eyebrow="ADMINISTRATION"
        title={<>Installation requise</>}
        intro={<p>{SETUP_HINT}</p>}
        crumbs={[{ name: 'Administration', path: '/admin' }]}
      >
        <section className="page-section prose alert-box">
          <h2>Deux scripts à exécuter</h2>
          <p>
            Dans l’éditeur SQL Supabase, dans cet ordre :{' '}
            <code>supabase/blackjack.sql</code> puis <code>supabase/tickets.sql</code>. Le second
            crée la table des tickets, le bucket privé des preuves de dépôt et la whitelist
            d’administrateurs (déjà initialisée avec <strong>{ADMIN_FALLBACK_EMAIL}</strong>).
          </p>
          <p>
            Vérifiez aussi la fonction <code>blackjack_points_row()</code> en tête du premier
            script : c’est elle qui relie un compte Discord à sa ligne de points.
          </p>
          <Link className="button button-ghost" href="/compte">
            Retour à mon compte <ArrowIcon />
          </Link>
        </section>
      </PageShell>
    );
  }

  const [{ data: tickets }, { data: members }, { data: counts }] = await Promise.all([
    supabase.rpc('admin_list_tickets', { p_status: null }),
    supabase.rpc('admin_list_members'),
    supabase.rpc('admin_ticket_counts'),
  ]);

  const countMap = Object.fromEntries(
    ((counts ?? []) as { kind: string; pending: number }[]).map((row) => [row.kind, row.pending])
  );

  return (
    <PageShell
      eyebrow="ADMINISTRATION"
      title={
        <>
          CONSOLE
          <br />
          <span className="gradient-text">SPIN DISTRICT</span>
        </>
      }
      intro={
        <>
          <p>
            Demandes de cartes cadeaux, réservations de bonus buys et remboursements Celsius.
            Valider consomme les points immobilisés ; refuser les rend automatiquement au membre.
          </p>
          <p className="page-hero-note">
            Connecté en tant que {user.email} • Page non indexée et réservée aux comptes de la
            whitelist
          </p>
        </>
      }
      crumbs={[{ name: 'Administration', path: '/admin' }]}
    >
      <AdminDashboard
        tickets={(tickets ?? []) as Ticket[]}
        members={(members ?? []) as Member[]}
        counts={countMap}
      />
    </PageShell>
  );
}
