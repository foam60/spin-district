import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { ArrowIcon, DiscordIcon, RumbleIcon } from '../components/BrandIcons';
import { links, siteUrl } from '../lib/site';
import { EARN_METHODS, GIFT_CARDS, POINTS_PER_USDT, formatPoints, formatUsdt } from '../lib/shop';
import { createClient } from '@/utils/supabase/server';

const title = 'Boutique — échangez vos points contre des cartes cadeaux USDT';
const description =
  'Échangez les points gagnés pendant les lives Spin District contre des cartes cadeaux USDT de 5, 10, 20, 50 ou 100. Points gagnés en participant au chat, avec le bonus horaire et les raffles. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/boutique` },
  openGraph: { title, description, url: `${siteUrl}/boutique`, type: 'website' },
};

// Le solde affiché dépend de la session : aucun cache possible.
export const dynamic = 'force-dynamic';

export default async function BoutiquePage() {
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
  const canRedeem = Boolean(link);

  return (
    <PageShell
      eyebrow="BOUTIQUE — ÉCHANGE DE POINTS"
      title={
        <>
          TES POINTS
          <br />
          <span className="gradient-text">EN CARTES CADEAUX USDT</span>
        </>
      }
      intro={
        <>
          <p>
            Les points cumulés pendant les lives s’échangent contre des cartes cadeaux{' '}
            <strong>USDT</strong> de 5 à 100. Ils se gagnent uniquement en participant :{' '}
            <strong>aucun point n’est achetable avec de l’argent</strong>.
          </p>
          <p className="page-hero-note">
            Taux actuel : {formatPoints(POINTS_PER_USDT)} points = 1 USDT • Réservé aux membres
            majeurs (18+) • Échange traité manuellement par l’équipe
          </p>
        </>
      }
      crumbs={[{ name: 'Boutique', path: '/boutique' }]}
    >
      {/* Bandeau de solde / d'appel à la connexion */}
      {canRedeem ? (
        <section className="shop-balance" aria-label="Mon solde de points">
          <div>
            <span className="shop-balance-tag">Mon solde</span>
            <p className="points-value">
              <strong>{formatPoints(balance)}</strong>
              <span>points</span>
            </p>
            <small>
              Soit environ <b>{formatUsdt(balance / POINTS_PER_USDT)} USDT</b> échangeables
            </small>
          </div>
          <Link className="button button-ghost" href="/compte">
            Voir mon compte <ArrowIcon />
          </Link>
        </section>
      ) : (
        <section className="shop-balance is-locked" aria-label="Accès à la boutique">
          <div>
            <span className="shop-balance-tag">Pas encore de solde</span>
            <p className="shop-locked-text">
              {user
                ? 'Liez votre pseudo Rumble à votre compte pour que les points gagnés dans le chat soient comptabilisés.'
                : 'Connectez-vous avec Discord puis liez votre pseudo Rumble pour commencer à cumuler des points.'}
            </p>
          </div>
          <Link className="button button-primary" href="/compte">
            {user ? 'Lier mon pseudo Rumble' : 'Me connecter'} <ArrowIcon />
          </Link>
        </section>
      )}

      {/* Catalogue */}
      <section className="page-section" aria-labelledby="cards-title">
        <h2 id="cards-title">Cartes cadeaux disponibles</h2>

        <div className="giftcard-grid">
          {GIFT_CARDS.map((card) => {
            const missing = card.points - balance;
            const affordable = canRedeem && missing <= 0;
            const progress = canRedeem
              ? Math.min(100, Math.round((balance / card.points) * 100))
              : 0;

            return (
              <article
                key={card.usdt}
                className={`giftcard ${card.featured ? 'is-featured' : ''} ${
                  affordable ? 'is-affordable' : ''
                }`}
              >
                {card.featured && <span className="giftcard-flag">Le plus demandé</span>}

                <div className="giftcard-amount">
                  <strong>{card.usdt}</strong>
                  <span>USDT</span>
                </div>

                <p className="giftcard-cost">
                  {formatPoints(card.points)} <small>points</small>
                </p>

                {canRedeem && (
                  <div className="giftcard-progress">
                    <div className="giftcard-progress-bar" aria-hidden="true">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <small>
                      {affordable
                        ? '✓ Solde suffisant'
                        : `Il te manque ${formatPoints(missing)} points`}
                    </small>
                  </div>
                )}

                {affordable ? (
                  <a
                    className="button button-primary giftcard-cta"
                    href={links.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DiscordIcon size={15} /> Demander l’échange <ArrowIcon />
                  </a>
                ) : (
                  <span className="giftcard-cta is-disabled" aria-disabled="true">
                    {canRedeem ? 'Solde insuffisant' : 'Connexion requise'}
                  </span>
                )}
              </article>
            );
          })}
        </div>

        <p className="shop-rate-note">
          Taux appliqué : {formatPoints(POINTS_PER_USDT)} points pour 1 USDT. Les paliers sont
          linéaires — épargner ne fait pas baisser le prix, mais rien n’oblige à échanger tout de
          suite.
        </p>
      </section>

      {/* Procédure d'échange */}
      <section className="page-section" aria-labelledby="how-redeem-title">
        <h2 id="how-redeem-title">Comment se passe un échange</h2>
        <div className="hunt-howto">
          <article>
            <div className="howto-header">
              <span className="step-num">01</span>
              <h3>OUVRE UN TICKET</h3>
            </div>
            <p>
              Clique sur « Demander l’échange » : tu arrives sur le Discord. Ouvre un ticket dans le
              salon dédié en indiquant le palier voulu et ton pseudo Rumble.
            </p>
          </article>
          <article>
            <div className="howto-header">
              <span className="step-num">02</span>
              <h3>ON VÉRIFIE LE SOLDE</h3>
            </div>
            <p>
              L’équipe contrôle que le solde correspond bien au palier demandé, puis débite les
              points du compte lié.
            </p>
          </article>
          <article>
            <div className="howto-header">
              <span className="step-num">03</span>
              <h3>TU REÇOIS LE CODE</h3>
            </div>
            <p>
              Le code de la carte cadeau USDT est envoyé en message privé Discord. Compte quelques
              heures à quelques jours selon l’affluence.
            </p>
          </article>
        </div>
      </section>

      {/* Comment gagner des points */}
      <section className="page-section" aria-labelledby="earn-title">
        <h2 id="earn-title">Comment gagner des points</h2>
        <p className="account-card-text shop-earn-intro">
          Les points ne s’achètent pas : ils se gagnent en étant présent et actif sur les lives.
          Voici toutes les sources.
        </p>

        <ul className="earn-list">
          {EARN_METHODS.map((method) => (
            <li key={method.title}>
              <span className="earn-tag">{method.tag}</span>
              <div className="earn-copy">
                <strong>{method.title}</strong>
                <p>{method.text}</p>
              </div>
              <span className="earn-rhythm">{method.rhythm}</span>
            </li>
          ))}
        </ul>

        <div className="compare-cta-row">
          <a
            className="button button-primary"
            href={links.stream}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RumbleIcon size={15} /> Rejoindre le live <ArrowIcon />
          </a>
          <a
            className="button button-ghost"
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Être prévenu des lives <ArrowIcon />
          </a>
        </div>
      </section>

      {/* Conditions */}
      <section className="page-section prose disclosure-box" aria-labelledby="shop-terms-title">
        <h2 id="shop-terms-title">Conditions de la boutique</h2>
        <ul>
          <li>
            Les points sont <strong>gagnés uniquement en participant</strong> aux lives et aux
            animations de la communauté. Ils ne sont ni vendus, ni achetables avec de l’argent.
          </li>
          <li>
            L’échange est réservé aux membres <strong>majeurs (18+)</strong> dont le pseudo Rumble
            est lié à un compte Discord.
          </li>
          <li>
            Les points n’ont pas de valeur monétaire tant qu’ils ne sont pas échangés, ne sont pas
            transférables entre comptes et ne peuvent pas être remboursés.
          </li>
          <li>
            Tout comportement visant à gonfler artificiellement un solde (multi-comptes, bots,
            spam du chat) entraîne l’annulation des points et l’exclusion de la boutique.
          </li>
          <li>
            Le taux et les paliers peuvent évoluer. Les échanges déjà validés ne sont pas
            recalculés.
          </li>
          <li>
            Selon votre pays de résidence, la réception d’une carte cadeau en cryptomonnaie peut
            avoir des conséquences fiscales : c’est à vous de vous en assurer.
          </li>
        </ul>
        <p>
          Rappel : Spin District parle de casino en ligne, activité interdite aux mineurs et à
          risque. Consultez nos <Link href="/jeu-responsable">règles de jeu responsable</Link>.
        </p>
      </section>
    </PageShell>
  );
}
