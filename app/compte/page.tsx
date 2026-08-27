import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { DiscordSignIn, LinkCodePanel, SignOutButton } from '../components/AccountPanel';
import { ArrowIcon } from '../components/BrandIcons';
import { links, siteUrl } from '../lib/site';
import { createClient } from '@/utils/supabase/server';

const title = 'Mon compte — Points & liaison Rumble';
const description =
  'Connectez-vous avec Discord, liez votre pseudo Rumble au chat du live et suivez vos points Spin District. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/compte` },
  openGraph: { title, description, url: `${siteUrl}/compte`, type: 'website' },
  // Espace personnel : aucune raison de l'indexer.
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  oauth: 'La connexion Discord a été annulée ou refusée.',
  missing_code: 'Réponse Discord incomplète. Réessayez.',
  exchange: 'Session impossible à ouvrir. Réessayez.',
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Chargé uniquement si connecté : RLS filtre déjà sur auth.uid(), les
  // requêtes ne peuvent donc pas retourner les données d'un autre compte.
  const link = user
    ? (await supabase.from('account_links').select('rumble_username, linked_at').maybeSingle()).data
    : null;

  const points = link
    ? (await supabase.from('chat_users').select('points, updated_at').maybeSingle()).data
    : null;

  const activeCode =
    user && !link
      ? (
          await supabase
            .from('verification_codes')
            .select('code, expires_at')
            .is('consumed_at', null)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()
        ).data
      : null;

  const pseudo = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email;

  return (
    <PageShell
      eyebrow="Espace membre"
      title={<>Mon compte Spin District</>}
      intro={
        <p>
          Liez votre pseudo Rumble à votre compte Discord pour cumuler des points pendant
          les lives et les dépenser dans la boutique virtuelle.
        </p>
      }
      crumbs={[{ name: 'Mon compte', path: '/compte' }]}
    >
      {error && <p className="alert-box text-danger">{ERRORS[error] ?? 'Une erreur est survenue.'}</p>}

      {!user ? (
        <section className="page-section">
          <div className="content-card">
            <span className="card-kicker">Étape 1</span>
            <h3>Se connecter</h3>
            <p className="card-copy">
              La connexion se fait via Discord. Aucun mot de passe à créer, aucune donnée
              bancaire : les points sont purement virtuels et ne sont ni achetables ni
              convertibles en argent.
            </p>
            <DiscordSignIn />
            <p className="offer-terms">
              Pas encore sur le serveur ?{' '}
              <a href={links.discord} target="_blank" rel="noopener noreferrer">
                Rejoindre le Discord Spin District
              </a>
              .
            </p>
          </div>
        </section>
      ) : (
        <section className="page-section">
          <div className="content-grid">
            <div className="content-card">
              <span className="card-kicker">Connecté</span>
              <h3>{pseudo}</h3>
              <p className="card-copy">
                {link ? (
                  <>
                    Pseudo Rumble lié : <strong>{link.rumble_username}</strong>
                  </>
                ) : (
                  <>Aucun pseudo Rumble lié pour l’instant.</>
                )}
              </p>
              <SignOutButton />
            </div>

            {link ? (
              <div className="content-card">
                <span className="card-kicker">Solde</span>
                <h3>{points?.points ?? 0} points</h3>
                <p className="card-copy">
                  Vous gagnez des points en participant au chat pendant les lives, et avec
                  la commande <code>!bonus</code> une fois par heure.
                </p>
                <p className="offer-terms">
                  Commandes du chat : <code>!points</code> · <code>!bonus</code> ·{' '}
                  <code>!help</code>
                </p>
              </div>
            ) : (
              <LinkCodePanel
                initialCode={
                  activeCode ? { code: activeCode.code, expiresAt: activeCode.expires_at } : null
                }
              />
            )}
          </div>

          <div className="content-card">
            <span className="card-kicker">Prochainement</span>
            <h3>Boutique virtuelle</h3>
            <p className="card-copy">
              Vos points serviront à débloquer des avantages communautaires. Rien
              d’achetable avec de l’argent réel, rien de convertible : uniquement du
              virtuel.
            </p>
            <Link className="button button-ghost" href={links.stream} target="_blank">
              Voir le live en cours <ArrowIcon />
            </Link>
          </div>
        </section>
      )}
    </PageShell>
  );
}
