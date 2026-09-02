import type { Metadata } from 'next';
import AccountDashboard from '../components/AccountDashboard';
import PageShell from '../components/PageShell';
import { DiscordSignIn } from '../components/AccountPanel';
import InAppBrowserNotice from '../components/InAppBrowserNotice';
import { DiscordIcon } from '../components/BrandIcons';
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

  const pseudo = String(
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'Membre'
  );
  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null;

  return (
    <PageShell
      eyebrow="ESPACE MEMBRE"
      title={
        <>
          MON COMPTE
          <br />
          <span className="gradient-text">SPIN DISTRICT</span>
        </>
      }
      intro={
        user ? (
          <p className="page-hero-note">
            {link ? 'Compte lié — tout est prêt.' : 'Dernière étape : lier votre pseudo Rumble.'}
          </p>
        ) : (
          <>
            <p>
              Cumulez des points pendant les lives et échangez-les contre des cartes cadeaux USDT.
            </p>
            <p className="page-hero-note">Gratuit • Sans mot de passe • 18+</p>
          </>
        )
      }
      crumbs={[{ name: 'Mon compte', path: '/compte' }]}
    >
      {error && (
        <p className="account-notice is-error account-notice-top" role="alert">
          {ERRORS[error] ?? 'Une erreur est survenue.'}
        </p>
      )}

      {!user ? (
        <section className="page-section account-auth-section" aria-labelledby="signin-title">
          <div className="account-auth-card">
            <span className="auth-glyph" aria-hidden="true">
              <DiscordIcon size={26} />
            </span>
            <h2 id="signin-title">Connexion en un clic</h2>
            <p>Pas de mot de passe à créer, pas de formulaire.</p>

            <InAppBrowserNotice />

            <DiscordSignIn />

            <p className="account-auth-footer">
              Pas encore sur le serveur ?{' '}
              <a href={links.discord} target="_blank" rel="noopener noreferrer">
                Rejoindre le Discord ↗
              </a>
            </p>
          </div>
        </section>
      ) : (
        <AccountDashboard
          pseudo={pseudo}
          avatarUrl={avatarUrl}
          link={link}
          points={points}
          activeCode={
            activeCode ? { code: activeCode.code, expiresAt: activeCode.expires_at } : null
          }
        />
      )}
    </PageShell>
  );
}
