import type { Metadata } from 'next';
import Link from 'next/link';
import BonusHuntBoard from '../components/BonusHuntBoard';
import PageShell from '../components/PageShell';
import { ArrowIcon } from '../components/BrandIcons';
import { siteUrl } from '../lib/site';

const title = 'Bonus Hunt Lab — tracker de bonus hunt gratuit et sans inscription';
const description =
  'Tracker de Bonus Hunt 100 % gratuit et sans compte : catalogue de 2 000+ machines à sous, calcul en direct du multiplicateur moyen et du break-even, export CSV/JSON, mode overlay pour le stream et sauvegarde automatique dans votre navigateur. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/bonus-hunt` },
  openGraph: { title, description, url: `${siteUrl}/bonus-hunt`, type: 'website' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${siteUrl}/bonus-hunt#app`,
  name: 'Spin District Bonus Hunt Lab',
  url: `${siteUrl}/bonus-hunt`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  inLanguage: 'fr-FR',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
  description:
    'Outil gratuit de suivi et de gestion de Bonus Hunts de casino : calcul en temps réel du multiplicateur, du break-even, stats détaillées et sauvegarde locale automatique.',
  featureList: [
    'Catalogue de +2 000 machines à sous (Pragmatic, Hacksaw, Nolimit City, Play’n GO)',
    'Calcul en direct du multiplicateur moyen',
    'Calcul automatique du point d’équilibre (break-even fixe et évolutif)',
    'Sauvegarde locale automatique dans le navigateur',
    'Export CSV et JSON des sessions',
    'Mode overlay plein écran pour le streaming',
  ],
};

const STEPS = [
  {
    title: 'CRÉEZ VOTRE HUNT',
    text: 'Nommez votre session (ex: Session Samedi) et définissez votre bankroll de départ. Elle apparaît instantanément dans votre barre de sessions.',
  },
  {
    title: 'REMPLISSEZ LE TABLEAU',
    text: 'Sélectionnez vos machines dans le catalogue de plus de 2 000 slots ou ajoutez vos titres personnalisés avec leur mise.',
  },
  {
    title: 'SUIVEZ VOS GAINS',
    text: 'Saisissez les gains lors de l’ouverture : calcul en direct du multiplicateur, du break-even et du profit net. Tout est sauvegardé automatiquement.',
  },
];

const FEATURES = [
  {
    title: 'Catalogue de 2 000+ slots',
    text: 'Pragmatic Play, Hacksaw Gaming, Nolimit City, Play’n GO, Push Gaming, Relax Gaming — avec recherche et filtre par provider. Vos titres perso s’ajoutent en une ligne.',
  },
  {
    title: 'Break-even fixe et évolutif',
    text: 'Le multiplicateur à atteindre sur toute la série, et celui qu’il reste à faire sur les bonus non ouverts. Recalculé à chaque gain saisi.',
  },
  {
    title: 'Sauvegarde locale, sans compte',
    text: 'Tout est écrit dans le stockage de votre navigateur. Aucune inscription, aucune donnée envoyée sur un serveur : fermez l’onglet, vos sessions sont toujours là.',
  },
  {
    title: 'Export CSV et JSON',
    text: 'Le CSV s’ouvre directement dans Excel et Google Sheets (séparateur « ; », décimales françaises). Le JSON sert de sauvegarde et se réimporte sur un autre appareil.',
  },
  {
    title: 'Mode stream pour OBS',
    text: 'Un affichage plein écran avec les métriques en gros, la progression et la liste des bonus — capturable directement comme source navigateur dans OBS.',
  },
  {
    title: 'Résumé prêt pour Discord',
    text: 'Un bouton copie un récapitulatif formaté de la session (bankroll, multi moyen, meilleur multi, profit) à coller dans le chat.',
  },
];

export default function BonusHuntPage() {
  return (
    <PageShell
      eyebrow="OUTIL GRATUIT — TRACKER"
      title={
        <>
          BONUS HUNT LAB
          <br />
          <span className="gradient-text">TES CHASSES SAUVEGARDÉES</span>
        </>
      }
      intro={
        <>
          <p>
            Créez une session, ajoutez vos machines une à une, notez les mises et renseignez les
            gains lors de l’ouverture. Le multiplicateur moyen, le break-even et le profit net se
            calculent en direct.
          </p>
          <p className="storage-highlight">
            💡 <strong>Sauvegarde locale automatique :</strong> fermez l’onglet, éteignez votre
            ordinateur — toutes vos sessions passées et leurs tableaux restent consultables et
            modifiables lors de votre prochaine visite.
          </p>
          <p className="page-hero-note">
            100 % gratuit • Sans inscription • Aucune donnée envoyée sur un serveur • 18+
          </p>
        </>
      }
      crumbs={[{ name: 'Bonus Hunt Lab', path: '/bonus-hunt' }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hunt-page-board" id="tracker" aria-label="Tracker de Bonus Hunt">
        <BonusHuntBoard />
      </section>

      <section className="page-section" aria-labelledby="howto-title">
        <h2 id="howto-title">Comment ça marche</h2>
        <div className="hunt-howto">
          {STEPS.map((step, index) => (
            <article key={step.title}>
              <div className="howto-header">
                <span className="step-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section" aria-labelledby="features-title">
        <h2 id="features-title">Ce que fait le Hunt Lab</h2>
        <div className="fact-cards">
          {FEATURES.map((feature) => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section prose" aria-labelledby="next-title">
        <h2 id="next-title">Pour aller plus loin</h2>
        <p>
          Vous ne savez pas quel break-even viser ni comment répartir vos mises ? Le guide détaille
          la méthode complète, avec les formules et des exemples chiffrés.
        </p>
        <div className="compare-cta-row">
          <Link className="button button-ghost" href="/guide-bonus-hunt">
            Lire le guide du Bonus Hunt <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/casinos">
            Voir les casinos partenaires <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/#faq">
            FAQ &amp; questions fréquentes <ArrowIcon />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
