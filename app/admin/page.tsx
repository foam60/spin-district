import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminDashboard from '../components/AdminDashboard';
import BotLiveToggle, { type BotLive } from '../components/BotLiveToggle';
import PageShell from '../components/PageShell';
import { ArrowIcon } from '../components/BrandIcons';
import { ADMIN_FALLBACK_EMAIL, SETUP_HINT, type Member, type Ticket } from '../lib/tickets';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SelfTestRow = { element: string; value: string };

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
          <h2>Quatre scripts à exécuter, dans cet ordre</h2>
          <ol>
            <li>
              <code>supabase/00-mapping.sql</code> — détecte les colonnes réelles de{' '}
              <code>account_links</code> et <code>chat_users</code> et expose le point d’écriture
              unique des points.
            </li>
            <li>
              <code>supabase/blackjack.sql</code> — table des manches et règlement.
            </li>
            <li>
              <code>supabase/tickets.sql</code> — tickets, bucket privé des preuves de dépôt et
              whitelist d’administrateurs (déjà initialisée avec{' '}
              <strong>{ADMIN_FALLBACK_EMAIL}</strong>).
            </li>
            <li>
              <code>supabase/bot-live.sql</code> — interrupteur du bot Rumble, réservé à cette
              whitelist.
            </li>
          </ol>
          <p>
            Juste après le premier script, lancez{' '}
            <code>select * from public.sd_mapping_report();</code> : les quatre lignes doivent
            afficher « OK ». Si l’une indique « A CORRIGER », la requête à exécuter est en
            commentaire à la fin du fichier.
          </p>
          <p>
            Si une fonction reste « introuvable » alors que les scripts sont passés, c’est le cache
            de schéma de PostgREST : <code>notify pgrst, &apos;reload schema&apos;;</code> (les
            scripts le font désormais en dernière ligne).
          </p>
          <Link className="button button-ghost" href="/compte">
            Retour à mon compte <ArrowIcon />
          </Link>
        </section>
      </PageShell>
    );
  }

  // Les erreurs sont conservées : une liste vide sans explication est
  // indébogable — c'est exactement ce qui affichait « Membres 0 ».
  const [ticketsRes, membersRes, countsRes, selfTestRes, columnsRes, botRes] =
    await Promise.all([
      supabase.rpc('admin_list_tickets', { p_status: null }),
      supabase.rpc('admin_list_members'),
      supabase.rpc('admin_ticket_counts'),
      supabase.rpc('sd_selftest'),
      supabase.rpc('sd_columns_report'),
      supabase.rpc('bot_live_status'),
    ]);

  const failures = [
    ['admin_list_tickets', ticketsRes.error?.message],
    ['admin_list_members', membersRes.error?.message],
    ['admin_ticket_counts', countsRes.error?.message],
    ['sd_selftest', selfTestRes.error?.message],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  // L'interrupteur du bot vit dans un script à part : son absence n'est pas
  // une erreur de la console, on affiche la marche à suivre à sa place.
  const botStatus = ((botRes.data ?? []) as BotLive[])[0] ?? null;
  const botUnavailable = botRes.error
    ? botRes.error.code === 'PGRST202' || botRes.error.code === '42883'
      ? 'Exécutez supabase/bot-live.sql dans Supabase pour piloter le bot depuis cette page.'
      : botRes.error.message
    : undefined;

  const tickets = (ticketsRes.data ?? []) as Ticket[];
  const members = (membersRes.data ?? []) as Member[];
  const selfTest = (selfTestRes.data ?? []) as SelfTestRow[];
  const columns = (columnsRes.data ?? []) as { table_name: string; columns: string }[];

  const countMap = Object.fromEntries(
    ((countsRes.data ?? []) as { kind: string; pending: number }[]).map((row) => [
      row.kind,
      row.pending,
    ])
  );

  const mappingBroken = selfTest.some(
    (row) => row.value === 'INTROUVABLE' || row.value.startsWith('inaccessible')
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
      {failures.length > 0 && (
        <section className="admin-diag is-error" aria-labelledby="diag-error-title">
          <h2 id="diag-error-title">Erreurs Postgres</h2>
          <ul>
            {failures.map(([fn, message]) => (
              <li key={fn}>
                <code>{fn}</code> : {message}
              </li>
            ))}
          </ul>
          <p>
            Relancez <code>supabase/00-mapping.sql</code> puis <code>supabase/tickets.sql</code> :
            la version actuelle des scripts tolère une correspondance de colonne manquante au lieu
            de vider les listes.
          </p>
        </section>
      )}

      {(mappingBroken || failures.length > 0) && (
        <section className="admin-diag" aria-labelledby="diag-title">
          <h2 id="diag-title">Diagnostic de la base</h2>
          <div className="compare-table-wrap">
            <table className="compare-table admin-table">
              <caption className="sr-only">Auto-test de la correspondance de schéma</caption>
              <thead>
                <tr>
                  <th scope="col">Élément</th>
                  <th scope="col">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {selfTest.map((row) => (
                  <tr key={row.element}>
                    <th scope="row">{row.element}</th>
                    <td
                      className={
                        row.value === 'INTROUVABLE' || row.value.startsWith('inaccessible')
                          ? 'admin-diag-bad'
                          : undefined
                      }
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {columns.length > 0 && (
            <>
              <h3 className="shop-subheading">Colonnes réellement présentes</h3>
              <ul className="admin-diag-columns">
                {columns.map((row) => (
                  <li key={row.table_name}>
                    <code>{row.table_name}</code> : {row.columns}
                  </li>
                ))}
              </ul>
              <p>
                Si une ligne ci-dessus indique <strong>INTROUVABLE</strong>, ajoutez le nom réel au
                tableau de candidats de la fonction correspondante dans{' '}
                <code>supabase/00-mapping.sql</code>, puis relancez le script.
              </p>
            </>
          )}
        </section>
      )}

      <BotLiveToggle status={botStatus} unavailable={botUnavailable} />

      <AdminDashboard tickets={tickets} members={members} counts={countMap} />
    </PageShell>
  );
}
