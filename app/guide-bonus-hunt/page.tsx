import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { ArrowIcon, StakeMark } from '../components/BrandIcons';
import { links, siteUrl } from '../lib/site';

const title = 'Guide du Bonus Hunt : règles, break-even et bankroll (2026)';
const description =
  'Le guide complet du Bonus Hunt : définition, vocabulaire, calcul du break-even et du multiplicateur moyen, choix de la bankroll et des mises, erreurs à éviter, et comment tout suivre gratuitement avec le Bonus Hunt Lab de Spin District. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/guide-bonus-hunt` },
  openGraph: { title, description, url: `${siteUrl}/guide-bonus-hunt`, type: 'article' },
};

const steps = [
  {
    name: 'Fixer la bankroll de départ',
    text: 'Décidez du montant exact consacré à la chasse (le “start”) avant le premier spin. Ce montant ne bouge plus : c’est lui qui servira à calculer le break-even.',
  },
  {
    name: 'Collecter les bonus sans les ouvrir',
    text: 'Jouez machine après machine jusqu’à déclencher les tours gratuits, puis mettez le bonus de côté sans le lancer. Notez chaque machine et la mise utilisée au moment du déclenchement.',
  },
  {
    name: 'Arrêter la collecte au bon moment',
    text: 'La chasse s’arrête quand la bankroll est consommée ou quand le nombre de bonus visé est atteint. Notez le nombre de bonus collectés et la mise totale engagée.',
  },
  {
    name: 'Ouvrir les bonus et enregistrer les gains',
    text: 'Ouvrez les bonus un par un et saisissez chaque gain. Le multiplicateur moyen et le résultat net se calculent au fur et à mesure de l’ouverture.',
  },
];

const glossary = [
  { term: 'Start / Bankroll', def: 'Le montant total engagé dans la chasse avant d’ouvrir le premier bonus.' },
  { term: 'Bonus (ou feature)', def: 'Les tours gratuits déclenchés sur une machine, mis de côté pour être ouverts plus tard.' },
  { term: 'Mise (bet)', def: 'Le montant misé par tour sur la machine au moment où le bonus a été déclenché.' },
  { term: 'Multiplicateur (multi)', def: 'Gain du bonus divisé par la mise. Un bonus de 200 € sur une mise de 2 € vaut 100x.' },
  { term: 'Break-even', def: 'Le multiplicateur moyen à atteindre sur l’ensemble des bonus pour récupérer exactement la bankroll de départ.' },
  { term: 'Multi moyen', def: 'Moyenne des multiplicateurs de tous les bonus ouverts. C’est lui qu’on compare au break-even.' },
  { term: 'Total misé', def: 'Somme des mises de tous les bonus collectés. Sert de base au calcul du break-even.' },
  { term: 'Volatilité', def: 'Amplitude des écarts de gains d’une machine. Haute volatilité = bonus rares mais potentiellement énormes.' },
  { term: 'RTP', def: 'Return To Player : pourcentage théorique redistribué sur le très long terme (souvent 94-96,5 %).' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HowTo',
      '@id': `${siteUrl}/guide-bonus-hunt#howto`,
      name: 'Comment réaliser un Bonus Hunt étape par étape',
      description:
        'Méthode complète pour organiser une chasse aux bonus : bankroll, collecte des bonus, calcul du break-even et ouverture.',
      totalTime: 'PT2H',
      tool: [{ '@type': 'HowToTool', name: 'Bonus Hunt Lab de Spin District' }],
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        url: `${siteUrl}/guide-bonus-hunt#etape-${index + 1}`,
      })),
    },
    {
      '@type': 'Article',
      '@id': `${siteUrl}/guide-bonus-hunt#article`,
      headline: 'Guide du Bonus Hunt : règles, break-even et bankroll',
      description,
      inLanguage: 'fr-FR',
      author: { '@type': 'Organization', name: 'Spin District', url: siteUrl },
      publisher: { '@type': 'Organization', name: 'Spin District', url: siteUrl },
      mainEntityOfPage: `${siteUrl}/guide-bonus-hunt`,
    },
  ],
};

export default function GuidePage() {
  return (
    <PageShell
      eyebrow="GUIDE — BONUS HUNT"
      title={
        <>
          LE BONUS HUNT
          <br />
          <span className="gradient-text">EXPLIQUÉ EN ENTIER</span>
        </>
      }
      intro={
        <>
          <p>
            Le bonus hunt est le format le plus regardé du streaming casino, et aussi le plus mal
            compris. Ce guide couvre le vocabulaire, la méthode, le calcul du{' '}
            <strong>break-even</strong>, la gestion de bankroll et les erreurs qui plombent une
            chasse — avec des exemples chiffrés.
          </p>
          <p className="page-hero-note">
            Lecture ≈ 6 minutes • Aucun conseil financier • 18+ • Jouer comporte des risques
          </p>
        </>
      }
      crumbs={[{ name: 'Guide du Bonus Hunt', path: '/guide-bonus-hunt' }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="toc" aria-label="Sommaire du guide">
        <h2>Sommaire</h2>
        <ol>
          <li>
            <a href="#definition">Qu’est-ce qu’un bonus hunt ?</a>
          </li>
          <li>
            <a href="#etapes">Les 4 étapes d’une chasse</a>
          </li>
          <li>
            <a href="#break-even">Calculer son break-even</a>
          </li>
          <li>
            <a href="#bankroll">Bankroll, mises et nombre de bonus</a>
          </li>
          <li>
            <a href="#erreurs">Les 6 erreurs classiques</a>
          </li>
          <li>
            <a href="#lexique">Lexique complet</a>
          </li>
          <li>
            <a href="#tracker">Suivre sa chasse avec le Hunt Lab</a>
          </li>
        </ol>
      </nav>

      <section className="page-section prose" id="definition" aria-labelledby="definition-title">
        <h2 id="definition-title">1. Qu’est-ce qu’un bonus hunt ?</h2>
        <p>
          Un <strong>bonus hunt</strong> (ou « chasse aux bonus ») consiste à jouer sur une série de
          machines à sous jusqu’à déclencher leurs tours gratuits, <em>sans les ouvrir</em>. Les bonus
          sont mis de côté un par un, puis ouverts tous d’affilée à la fin de la collecte.
        </p>
        <p>
          L’intérêt est double. Côté spectacle, l’ouverture concentre en quinze minutes ce qui prend
          normalement plusieurs heures. Côté analyse, la chasse produit une{' '}
          <strong>mesure comparable</strong> : un multiplicateur moyen, mis en face d’un objectif
          calculé à l’avance — le break-even. C’est cette mesure qui permet de dire si une session a
          été bonne ou mauvaise, indépendamment de la taille de la bankroll.
        </p>
        <p>
          Un bonus hunt ne change ni le RTP ni la volatilité des machines : il ne rend pas le jeu plus
          rentable. C’est un <strong>format de session</strong>, pas une stratégie gagnante.
        </p>
      </section>

      <section className="page-section prose" id="etapes" aria-labelledby="etapes-title">
        <h2 id="etapes-title">2. Les 4 étapes d’une chasse</h2>
        <div className="steps-list">
          {steps.map((step, index) => (
            <article key={step.name} id={`etape-${index + 1}`}>
              <span className="step-num">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.name}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section prose" id="break-even" aria-labelledby="be-title">
        <h2 id="be-title">3. Calculer son break-even</h2>
        <p>
          Le break-even est le multiplicateur moyen nécessaire pour récupérer exactement sa bankroll.
          La formule est simple :
        </p>
        <p className="formula">
          Break-even = Bankroll de départ ÷ Total des mises des bonus collectés
        </p>
        <p>Exemple concret :</p>
        <ul>
          <li>Bankroll de départ : <strong>1 500 €</strong></li>
          <li>Bonus collectés : <strong>30</strong></li>
          <li>Mise moyenne au déclenchement : <strong>2 €</strong> → total misé = 30 × 2 = <strong>60 €</strong></li>
          <li>
            Break-even = 1 500 ÷ 60 = <strong>25x</strong>
          </li>
        </ul>
        <p>
          Il faut donc un multiplicateur moyen de <strong>25x</strong> sur les 30 bonus pour rentrer
          dans ses frais. À 30x de moyenne, la session est bénéficiaire ; à 18x, elle est perdante.
        </p>
        <p>
          Pendant l’ouverture, le chiffre utile n’est plus le break-even fixe mais le{' '}
          <strong>break-even évolutif</strong> : ce qu’il reste à faire sur les bonus non encore
          ouverts.
        </p>
        <p className="formula">
          Break-even évolutif = (Bankroll − Gains déjà encaissés) ÷ Mises des bonus restants
        </p>
        <p>
          C’est ce chiffre qui monte en flèche après une série de bonus ratés — et c’est lui que le{' '}
          <Link href="/#bonus-hunt">Hunt Lab</Link> recalcule à chaque gain saisi.
        </p>
      </section>

      <section className="page-section prose" id="bankroll" aria-labelledby="bankroll-title">
        <h2 id="bankroll-title">4. Bankroll, mises et nombre de bonus</h2>
        <p>
          Trois réglages déterminent l’allure d’une chasse. Ils sont liés : changer l’un déplace
          mécaniquement le break-even.
        </p>
        <div className="fact-cards">
          <article>
            <h3>Le nombre de bonus</h3>
            <p>
              Plus il y a de bonus, plus le résultat moyen est stable — mais plus chaque bonus doit
              être gros pour compenser. En dessous de 15 bonus, un seul gros multi peut porter toute
              la session : c’est spectaculaire, mais très aléatoire.
            </p>
          </article>
          <article>
            <h3>La mise par machine</h3>
            <p>
              Une mise élevée fait baisser le break-even (moins de bonus pour la même bankroll) mais
              consomme la bankroll plus vite. Une règle de prudence courante : ne pas dépasser{' '}
              <strong>0,5 % de la bankroll</strong> par tour.
            </p>
          </article>
          <article>
            <h3>La volatilité</h3>
            <p>
              Mélanger des machines très volatiles (Nolimit City, Hacksaw) et des machines plus
              régulières (Pragmatic, Play’n GO) lisse la courbe d’ouverture sans sacrifier le
              potentiel.
            </p>
          </article>
        </div>
      </section>

      <section className="page-section prose" id="erreurs" aria-labelledby="erreurs-title">
        <h2 id="erreurs-title">5. Les 6 erreurs classiques</h2>
        <ol className="mistakes-list">
          <li>
            <strong>Ne pas noter la mise au déclenchement.</strong> Si la mise change en cours de
            collecte et n’est pas enregistrée, le break-even calculé est faux.
          </li>
          <li>
            <strong>Rallonger la bankroll en cours de route.</strong> Ajouter 200 € au milieu de la
            chasse invalide toute la comparaison : le break-even n’a plus de sens.
          </li>
          <li>
            <strong>Confondre break-even et rentabilité.</strong> Atteindre le break-even, c’est
            récupérer sa mise, pas gagner.
          </li>
          <li>
            <strong>Ouvrir un bonus « pour voir » pendant la collecte.</strong> Le gain n’est plus
            comptabilisable dans la même série.
          </li>
          <li>
            <strong>Chasser les pertes.</strong> Relancer une chasse immédiatement après une session
            perdante est le comportement le plus coûteux du format.
          </li>
          <li>
            <strong>Ne garder aucune trace.</strong> Sans historique, impossible de savoir si un choix
            de machines fonctionne. C’est exactement le problème que résout un tracker.
          </li>
        </ol>
      </section>

      <section className="page-section prose" id="lexique" aria-labelledby="lexique-title">
        <h2 id="lexique-title">6. Lexique complet</h2>
        <dl className="glossary">
          {glossary.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-section prose" id="tracker" aria-labelledby="tracker-title">
        <h2 id="tracker-title">7. Suivre sa chasse avec le Hunt Lab</h2>
        <p>
          Le <strong>Bonus Hunt Lab</strong> de Spin District est un tracker gratuit et sans compte :
          catalogue de plus de 2 000 machines, calcul en direct du multiplicateur moyen, du break-even
          fixe et évolutif, export CSV/JSON et mode overlay pour le stream. Tout est enregistré dans
          le stockage local de votre navigateur — aucune donnée n’est envoyée sur un serveur.
        </p>
        <div className="compare-cta-row">
          <Link className="button button-primary" href="/#bonus-hunt">
            Ouvrir le Hunt Lab <ArrowIcon />
          </Link>
          <a
            className="button button-stake"
            href={links.stake}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            <StakeMark size={18} /> Jouer sur Stake <ArrowIcon />
          </a>
          <Link className="button button-ghost" href="/casinos">
            Comparer les casinos <ArrowIcon />
          </Link>
        </div>
        <p className="page-hero-note">
          Ce guide est fourni à titre informatif et ne constitue pas un conseil de jeu ou financier.
          Les jeux d’argent sont interdits aux mineurs et comportent un risque de dépendance —{' '}
          <Link href="/jeu-responsable">lire nos règles de jeu responsable</Link>.
        </p>
      </section>
    </PageShell>
  );
}
