import type { Metadata } from 'next';
import Link from 'next/link';
import CasinoCards from '../components/CasinoCards';
import PageShell from '../components/PageShell';
import { ArrowIcon, StakeMark } from '../components/BrandIcons';
import { casinos, links, siteUrl } from '../lib/site';

const title = 'Casinos partenaires : Stake vs Celsius Casino — comparatif 2026';
const description =
  'Comparatif des deux casinos partenaires de Spin District : Stake (Originals, rakeback, retraits crypto) et Celsius Casino (jusqu’à 550 % de bonus, 1er dépôt de 20 € remboursé). Bonus, paiements, points forts et limites. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/casinos` },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/casinos`,
    type: 'article',
  },
};

const comparisonRows: { label: string; celsius: string; stake: string }[] = [
  {
    label: 'Bonus de bienvenue',
    celsius: 'Jusqu’à 550 % + 1er dépôt de 20 € remboursé*',
    stake: 'Bonus d’entrée modéré, valeur sur la durée',
  },
  {
    label: 'Récompenses régulières',
    celsius: 'Free spins & cashback VIP*',
    stake: 'Rakeback, bonus hebdo, paliers VIP progressifs',
  },
  { label: 'Moyens de paiement', celsius: 'Crypto & cartes bancaires', stake: '20+ cryptos (BTC, ETH, LTC, SOL…)' },
  { label: 'Vitesse de retrait', celsius: 'Retraits crypto rapides', stake: 'Retraits crypto quasi instantanés' },
  { label: 'Jeux exclusifs', celsius: 'Catalogue slots complet', stake: 'Stake Originals (Plinko, Mines, Limbo, Crash)' },
  { label: 'Profil conseillé', celsius: 'Démarrer avec la plus grosse bankroll bonus', stake: 'Jouer régulièrement sur le long terme' },
  { label: 'Licence ANJ (France)', celsius: 'Non', stake: 'Non' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Casinos partenaires de Spin District',
  itemListOrder: 'https://schema.org/ItemListUnordered',
  numberOfItems: casinos.length,
  itemListElement: casinos.map((casino, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Organization',
      name: casino.name,
      url: casino.url,
      description: casino.highlight,
    },
  })),
};

export default function CasinosPage() {
  return (
    <PageShell
      eyebrow="COMPARATIF — CASINOS PARTENAIRES"
      title={
        <>
          STAKE <em>VS</em> CELSIUS
          <br />
          <span className="gradient-text">LEQUEL POUR TOI ?</span>
        </>
      }
      intro={
        <>
          <p>
            Spin District travaille avec <strong>deux casinos partenaires</strong> et un seul. Pas
            trente. Celsius Casino pour le package de bienvenue le plus agressif, et{' '}
            <strong>Stake</strong> — la plateforme la plus utilisée par les streamers casino au monde
            — pour ses Originals et son VIP progressif.
          </p>
          <p className="page-hero-note">
            Liens partenaires • 18+ • Aucun de ces opérateurs ne détient d’agrément ANJ en France
          </p>
        </>
      }
      crumbs={[{ name: 'Casinos partenaires', path: '/casinos' }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="page-section" aria-labelledby="cards-title">
        <h2 id="cards-title">Les deux casinos en détail</h2>
        <CasinoCards detailed />
      </section>

      <section className="page-section" aria-labelledby="table-title">
        <h2 id="table-title">Tableau comparatif</h2>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <caption className="sr-only">
              Comparatif des offres Celsius Casino et Stake proposées par Spin District
            </caption>
            <thead>
              <tr>
                <th scope="col">Critère</th>
                <th scope="col">
                  <span className="th-brand th-celsius">Celsius Casino</span>
                </th>
                <th scope="col">
                  <span className="th-brand th-stake">
                    <StakeMark size={18} /> Stake
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.celsius}</td>
                  <td>{row.stake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="compare-cta-row">
          <a
            className="button button-ghost"
            href={links.celsius}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Ouvrir Celsius Casino <ArrowIcon />
          </a>
          <a
            className="button button-stake"
            href={links.stake}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            <StakeMark size={18} /> Ouvrir Stake <ArrowIcon />
          </a>
        </div>
      </section>

      <section className="page-section" aria-labelledby="method-title">
        <h2 id="method-title">Comment nous choisissons un partenaire</h2>
        <div className="method-grid">
          <article>
            <span className="step-num">01</span>
            <h3>Testé en live</h3>
            <p>
              Un casino n’arrive sur le site qu’après avoir été joué en direct sur la chaîne, dépôts
              et retraits inclus. Si un retrait traîne, on le dit.
            </p>
          </article>
          <article>
            <span className="step-num">02</span>
            <h3>Catalogue de slots utile</h3>
            <p>
              Les providers qu’on utilise en bonus hunt doivent être là : Pragmatic Play, Hacksaw
              Gaming, Nolimit City, Play’n GO, Push Gaming, Relax Gaming.
            </p>
          </article>
          <article>
            <span className="step-num">03</span>
            <h3>Conditions lisibles</h3>
            <p>
              Un bonus n’a de valeur que si son wager est atteignable. On met en avant les offres dont
              les conditions sont compréhensibles avant de déposer.
            </p>
          </article>
          <article>
            <span className="step-num">04</span>
            <h3>Support qui répond</h3>
            <p>
              Un support joignable 24/7 et une communauté qui remonte les problèmes : c’est ce qui
              fait la différence quand quelque chose bloque.
            </p>
          </article>
        </div>
      </section>

      <section className="page-section disclosure-box" aria-labelledby="disclosure-title">
        <h2 id="disclosure-title">Transparence sur nos liens partenaires</h2>
        <p>
          Les liens vers Stake et Celsius Casino présents sur cette page sont des{' '}
          <strong>liens d’affiliation</strong>. Si vous créez un compte via ces liens, Spin District
          peut percevoir une commission versée par l’opérateur — <strong>sans surcoût pour vous</strong>
          , et sans modifier les offres auxquelles vous avez droit. Ce financement permet de maintenir
          le <Link href="/#bonus-hunt">Bonus Hunt Lab gratuit</Link>, le site et les animations
          communautaires.
        </p>
        <p>
          Ces deux opérateurs <strong>ne détiennent pas d’agrément de l’ANJ</strong> (Autorité
          nationale des jeux) : en France, le casino en ligne n’est pas ouvert à la licence. Vous
          jouez donc sous votre propre responsabilité, sur des plateformes régulées à l’étranger, et
          les protections du cadre français ne s’appliquent pas.
        </p>
        <p>
          Les jeux d’argent sont interdits aux mineurs (18+) et comportent des risques d’addiction,
          d’isolement et de pertes financières. Consultez nos{' '}
          <Link href="/jeu-responsable">règles de jeu responsable</Link> avant de déposer.
        </p>
      </section>
    </PageShell>
  );
}
