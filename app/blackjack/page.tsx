import type { Metadata } from 'next';
import Link from 'next/link';
import BlackjackTable from '../components/BlackjackTable';
import PageShell from '../components/PageShell';
import { ArrowIcon } from '../components/BrandIcons';
import { siteUrl } from '../lib/site';
import { MAX_BET, MIN_BET } from '../lib/blackjack';
import { formatPoints } from '../lib/shop';
import { createClient } from '@/utils/supabase/server';

const title = 'Blackjack — jouez vos points Spin District';
const description =
  'Blackjack à points de la communauté Spin District : 6 jeux, croupier qui reste sur tous les 17, blackjack payé 3:2. Se joue uniquement avec les points gagnés pendant les lives. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/blackjack` },
  openGraph: { title, description, url: `${siteUrl}/blackjack`, type: 'website' },
  // Espace membre : solde personnalisé, aucun intérêt à l'indexer.
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

const RULES = [
  {
    title: 'Objectif',
    text: 'Approcher 21 sans le dépasser, et faire mieux que le croupier. Au-delà de 21, la main est perdue immédiatement.',
  },
  {
    title: 'Valeur des cartes',
    text: 'Les figures valent 10. L’as vaut 11, ou 1 s’il ferait dépasser 21 — c’est ce qu’on appelle une main « souple ».',
  },
  {
    title: 'Le croupier',
    text: 'Il tire tant qu’il est sous 17 et reste sur tous les 17, y compris souples. Il ne tire pas si vous avez déjà sauté.',
  },
  {
    title: 'Les paiements',
    text: 'Gain simple : 2× la mise recréditée. Blackjack (21 en deux cartes) : 2,5×. Égalité : mise remboursée. Perte : mise conservée.',
  },
  {
    title: 'Le double',
    text: 'Uniquement sur vos deux premières cartes : la mise est doublée et vous recevez une seule carte supplémentaire.',
  },
  {
    title: 'Non disponible',
    text: 'Pas de split, pas d’assurance, pas d’abandon. Sabot de 6 jeux remélangé à chaque manche : le comptage ne sert à rien.',
  },
];

export default async function BlackjackPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const link = user
    ? (await supabase.from('account_links').select('rumble_username').maybeSingle()).data
    : null;

  const points = link
    ? (await supabase.from('chat_users').select('points').maybeSingle()).data
    : null;

  const balance = points?.points ?? 0;

  return (
    <PageShell
      eyebrow="JEU DE POINTS — MEMBRES"
      title={
        <>
          BLACKJACK
          <br />
          <span className="gradient-text">21 OU RIEN</span>
        </>
      }
      intro={
        <>
          <p>
            Le blackjack de la communauté, joué avec les <strong>points gagnés pendant les lives</strong>.
            Six jeux, croupier qui reste sur tous les 17, blackjack payé 3:2. Aucun achat possible :
            on ne joue que ce qu’on a gagné dans le chat.
          </p>
          <p className="page-hero-note">
            Mise de {formatPoints(MIN_BET)} à {formatPoints(MAX_BET)} points • 18+ • Le jeu a un
            avantage maison : sur la durée, on perd des points
          </p>
        </>
      }
      crumbs={[{ name: 'Blackjack', path: '/blackjack' }]}
    >
      <BlackjackTable
        initialBalance={balance}
        canPlay={Boolean(link)}
        isAuthenticated={Boolean(user)}
      />

      <section className="page-section" aria-labelledby="rules-title">
        <h2 id="rules-title">Les règles de la table</h2>
        <div className="fact-cards">
          {RULES.map((rule) => (
            <article key={rule.title}>
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section prose" aria-labelledby="fair-title">
        <h2 id="fair-title">Comment les manches sont tirées</h2>
        <p>
          Le sabot est mélangé <strong>sur le serveur</strong> avec le générateur cryptographique du
          runtime, jamais dans votre navigateur. La page ne reçoit que vos cartes et la carte
          visible du croupier : la carte cachée et le reste du sabot ne quittent pas le serveur, et
          chaque action est rejouée à partir de l’état stocké en base.
        </p>
        <p>
          Concrètement : personne ne peut lire la suite du paquet, ni rejouer une manche gagnante
          pour se faire créditer deux fois. Les points sont débités à la distribution et recrédités
          au règlement, dans la même transaction.
        </p>
      </section>

      <section className="page-section prose alert-box" aria-labelledby="rg-title">
        <h2 id="rg-title">Avant de miser</h2>
        <p>
          Ce blackjack a un <strong>avantage maison</strong>, comme au casino : plus vous jouez de
          manches, plus le total tend à baisser. Il est fait pour animer la communauté, pas pour
          faire grossir un solde — et les points servent d’abord à être échangés dans la{' '}
          <Link href="/boutique">boutique</Link>.
        </p>
        <p>
          Si vous vous surprenez à rejouer pour « récupérer » des points perdus, c’est exactement le
          réflexe décrit dans nos <Link href="/jeu-responsable">règles de jeu responsable</Link> —
          et le bon moment pour fermer l’onglet.
        </p>
        <div className="compare-cta-row">
          <Link className="button button-ghost" href="/boutique">
            Échanger mes points <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/jeu-responsable">
            Jeu responsable &amp; 18+ <ArrowIcon />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
