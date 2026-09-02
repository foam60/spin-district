import type { Metadata } from 'next';
import Link from 'next/link';
import CasinoCards from '../components/CasinoCards';
import PageShell from '../components/PageShell';
import { ArrowIcon } from '../components/BrandIcons';
import { casinos, siteUrl, type Casino } from '../lib/site';

const title = 'Casinos partenaires 2026 : Stake, Celsius, Fieryplay et Zeppelin';
const description =
  'Comparatif des casinos partenaires de Spin District : Stake, Celsius Casino, Fieryplay (jusqu’à 2 500 € + 525 tours gratuits) et Zeppelin (100 tours gratuits sans dépôt sur Gates of Olympus). Offres, points forts et limites. 18+.';

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

/**
 * Le tableau est construit à partir du catalogue : ajouter un casino dans
 * `app/lib/site.ts` suffit pour qu'une colonne apparaisse ici.
 * Une valeur non vérifiée reste vide plutôt qu'inventée.
 */
const comparisonRows: { label: string; value: (casino: Casino) => string }[] = [
  { label: 'Offre de bienvenue', value: (c) => c.highlight.replace(/\*$/, '') },
  { label: 'Le + du casino', value: (c) => c.vibe ?? '—' },
  { label: 'Moyens de paiement', value: (c) => c.currencies ?? 'Non communiqué' },
  { label: 'Retraits', value: (c) => c.payout ?? 'Non communiqué' },
  { label: 'À garder en tête', value: (c) => c.watchouts[0] },
  { label: 'Licence ANJ (France)', value: () => 'Non' },
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
          QUATRE CASINOS
          <br />
          <span className="gradient-text">LEQUEL POUR TOI ?</span>
        </>
      }
      intro={
        <>
          <p>
            Quatre casinos, pas trente : <strong>Fieryplay</strong> pour le plus gros pack de
            bienvenue, <strong>Celsius</strong> pour le premier dépôt remboursé,{' '}
            <strong>Stake</strong> pour les Originals et le VIP, <strong>Zeppelin</strong> pour ses
            100 tours gratuits sans dépôt sur Gates of Olympus.
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
        <h2 id="cards-title">Les casinos en détail</h2>
        <CasinoCards detailed />
      </section>

      {casinos
        .filter((casino) => casino.welcomePackage)
        .map((casino) => (
          <section className="page-section" key={`pack-${casino.slug}`}>
            <details className="terms-details bonus-pack">
              <summary>
                <span>Détail du pack de bienvenue {casino.name}</span>
                <span aria-hidden="true">↓</span>
              </summary>

              <p className="bonus-pack-total">{casino.welcomePackage!.total}</p>

              <div className="compare-table-wrap">
                <table className="compare-table bonus-pack-table">
                  <caption className="sr-only">
                    Paliers du bonus de bienvenue {casino.name}, dépôt par dépôt
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Dépôt</th>
                      <th scope="col">Montant minimum</th>
                      <th scope="col">Bonus</th>
                      <th scope="col">Tours gratuits</th>
                      <th scope="col">Machine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casino.welcomePackage!.steps.map((step) =>
                      step.tiers.map((tier, index) => (
                        <tr key={`${step.label}-${tier.minDeposit}-${tier.bonus}`}>
                          <th scope="row">{index === 0 ? step.label : ''}</th>
                          <td>
                            {tier.minDeposit}
                            {tier.note && <small className="bonus-tier-note">{tier.note}</small>}
                          </td>
                          <td>
                            <strong style={{ color: casino.accent }}>{tier.bonus}</strong>{' '}
                            <small>{tier.cap}</small>
                          </td>
                          <td>{tier.spins}</td>
                          <td>{tier.slot}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p className="shop-rate-note">
                Paliers relevés sur la page de bonus de l’opérateur. Les conditions de mise
                (wager) ne sont pas reprises ici : lisez-les sur le site avant de réclamer.{' '}
                <Link href="/jeu-responsable">Jeu responsable</Link>.
              </p>
            </details>
          </section>
        ))}

      <section className="page-section" aria-labelledby="table-title">
        <h2 id="table-title">Tableau comparatif</h2>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <caption className="sr-only">
              Comparatif des offres des casinos partenaires de Spin District
            </caption>
            <thead>
              <tr>
                <th scope="col">Critère</th>
                {casinos.map((casino) => (
                  <th scope="col" key={casino.slug}>
                    <span className="th-brand" style={{ color: casino.accent }}>
                      {casino.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {casinos.map((casino) => (
                    <td key={casino.slug}>{row.value(casino)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="compare-cta-row">
          {casinos.map((casino) => (
            <a
              key={casino.slug}
              className="button button-ghost"
              href={casino.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Ouvrir {casino.name} <ArrowIcon />
            </a>
          ))}
          <Link className="button button-primary" href="/remboursement-celsius">
            Remboursement du dépôt Celsius <ArrowIcon />
          </Link>
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
          Les liens vers les casinos présents sur cette page sont des{' '}
          <strong>liens d’affiliation</strong>. Si vous créez un compte via ces liens, Spin District
          peut percevoir une commission versée par l’opérateur — <strong>sans surcoût pour vous</strong>
          , et sans modifier les offres auxquelles vous avez droit. Ce financement permet de maintenir
          le <Link href="/bonus-hunt">Bonus Hunt Lab gratuit</Link>, le site et les animations
          communautaires.
        </p>
        <p>
          Ces opérateurs <strong>ne détiennent pas d’agrément de l’ANJ</strong> (Autorité
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
