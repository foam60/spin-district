import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { ArrowIcon, DiscordIcon, RumbleIcon } from '../components/BrandIcons';
import { links, siteUrl } from '../lib/site';
import {
  BONUS_BUYS,
  EARN_METHODS,
  GIFT_CARDS,
  POINTS_PER_USDT,
  formatPoints,
  formatUsdt,
} from '../lib/shop';
import { createClient } from '@/utils/supabase/server';

const title = 'Boutique — cartes cadeaux USDT et bonus buys en live';
const description =
  'Échangez les points gagnés pendant les lives Spin District contre des cartes cadeaux USDT de 5 à 100, ou faites acheter un bonus buy en direct (Sweet Bonanza, Fruit Party, Gates of Olympus…) dont le gain vous est envoyé. 18+.';

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

  /** État d'un article : abordable, hors budget, ou connexion requise. */
  function itemState(cost: number) {
    const missing = cost - balance;
    return {
      affordable: canRedeem && missing <= 0,
      missing,
      progress: canRedeem ? Math.min(100, Math.round((balance / cost) * 100)) : 0,
    };
  }

  return (
    <PageShell
      eyebrow="BOUTIQUE — DÉPENSER SES POINTS"
      title={
        <>
          TES POINTS
          <br />
          <span className="gradient-text">EN USDT OU EN BONUS</span>
        </>
      }
      intro={
        <>
          <p>
            Deux façons de dépenser les points cumulés pendant les lives : des{' '}
            <strong>cartes cadeaux USDT</strong> de 5 à 100, ou un{' '}
            <strong>bonus buy acheté en direct</strong> sur la slot de votre choix — et c’est vous
            qui encaissez le gain. Les points se gagnent uniquement en participant :{' '}
            <strong>aucun point n’est achetable avec de l’argent</strong>.
          </p>
          <p className="page-hero-note">
            Taux actuel : {formatPoints(POINTS_PER_USDT)} points = 1 USDT • Réservé aux membres
            majeurs (18+) • Échanges traités manuellement par l’équipe
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

      <nav className="shop-jump" aria-label="Sections de la boutique">
        <a href="#cartes-cadeaux">Cartes cadeaux USDT</a>
        <a href="#bonus-buys">Bonus buys en live</a>
        <a href="#gagner">Gagner des points</a>
      </nav>

      {/* ------------------------------ CARTES CADEAUX --------------------- */}
      <section className="page-section" id="cartes-cadeaux" aria-labelledby="cards-title">
        <h2 id="cards-title">Cartes cadeaux USDT</h2>
        <p className="account-card-text shop-earn-intro">
          Valeur garantie, envoyée en message privé Discord après vérification du solde.
        </p>

        <div className="giftcard-grid">
          {GIFT_CARDS.map((card) => {
            const { affordable, missing, progress } = itemState(card.points);

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

      {/* ------------------------------ BONUS BUYS ------------------------- */}
      <section className="page-section" id="bonus-buys" aria-labelledby="bonus-title">
        <h2 id="bonus-title">Bonus buys en live</h2>
        <p className="account-card-text shop-earn-intro">
          Vous choisissez la slot, on achète le bonus en direct sur le stream, et{' '}
          <strong>l’intégralité du gain du bonus vous est envoyée en USDT</strong>. Moins cher au
          dollar qu’une carte cadeau, parce que le résultat est aléatoire : un bonus peut rapporter
          gros comme retomber sous le montant acheté.
        </p>

        <div className="bonusbuy-grid">
          {BONUS_BUYS.map((item) => {
            const { affordable, missing, progress } = itemState(item.points);

            return (
              <article
                key={item.slug}
                className={`bonusbuy ${item.featured ? 'is-featured' : ''} ${
                  affordable ? 'is-affordable' : ''
                }`}
              >
                <header className="bonusbuy-head">
                  <span className="bonusbuy-provider">{item.provider}</span>
                  <h3>{item.slot}</h3>
                </header>

                <div className="bonusbuy-amount">
                  <span>Bonus acheté</span>
                  <strong>{item.usdt} $</strong>
                </div>

                <p className="bonusbuy-cost">
                  {formatPoints(item.points)} <small>points</small>
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
                    <DiscordIcon size={15} /> Réserver le bonus <ArrowIcon />
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

        <h3 className="shop-subheading">Comment se passe un bonus buy</h3>
        <div className="hunt-howto">
          <article>
            <div className="howto-header">
              <span className="step-num">01</span>
              <h3>TU RÉSERVES</h3>
            </div>
            <p>
              Ouvre un ticket Discord avec la slot, le montant et ton pseudo Rumble. Les points sont
              débités à la validation de la réservation.
            </p>
          </article>
          <article>
            <div className="howto-header">
              <span className="step-num">02</span>
              <h3>ON L’ACHÈTE EN LIVE</h3>
            </div>
            <p>
              Le bonus est acheté pendant le prochain stream, ton pseudo annoncé à l’antenne. Tu peux
              suivre l’ouverture en direct sur la chaîne.
            </p>
          </article>
          <article>
            <div className="howto-header">
              <span className="step-num">03</span>
              <h3>LE GAIN TE REVIENT</h3>
            </div>
            <p>
              Le montant gagné par le bonus t’est envoyé en USDT après le live, capture d’écran du
              résultat à l’appui.
            </p>
          </article>
        </div>

        <div className="compare-cta-row">
          <a
            className="button button-ghost"
            href={links.stream}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RumbleIcon size={15} /> Voir la chaîne Rumble <ArrowIcon />
          </a>
          <a
            className="button button-ghost"
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Être prévenu du prochain live <ArrowIcon />
          </a>
        </div>
      </section>

      {/* ------------------------------ ÉCHANGE ---------------------------- */}
      <section className="page-section" aria-labelledby="how-redeem-title">
        <h2 id="how-redeem-title">Comment se passe un échange de carte</h2>
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

      {/* ------------------------------ GAGNER ----------------------------- */}
      <section className="page-section" id="gagner" aria-labelledby="earn-title">
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
          <Link className="button button-ghost" href="/blackjack">
            Jouer ses points au blackjack <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ------------------------------ CONDITIONS ------------------------- */}
      <section className="page-section prose disclosure-box" aria-labelledby="shop-terms-title">
        <h2 id="shop-terms-title">Conditions de la boutique</h2>
        <ul>
          <li>
            Les points sont <strong>gagnés uniquement en participant</strong> aux lives et aux
            animations de la communauté. Ils ne sont ni vendus, ni achetables avec de l’argent.
          </li>
          <li>
            Les échanges sont réservés aux membres <strong>majeurs (18+)</strong> dont le pseudo
            Rumble est lié à un compte Discord.
          </li>
          <li>
            Les points n’ont pas de valeur monétaire tant qu’ils ne sont pas échangés, ne sont pas
            transférables entre comptes et ne peuvent pas être remboursés.
          </li>
          <li>
            Tout comportement visant à gonfler artificiellement un solde (multi-comptes, bots, spam
            du chat) entraîne l’annulation des points et l’exclusion de la boutique.
          </li>
          <li>
            Le taux et les paliers peuvent évoluer. Les échanges déjà validés ne sont pas
            recalculés.
          </li>
          <li>
            Selon votre pays de résidence, la réception d’USDT peut avoir des conséquences fiscales :
            c’est à vous de vous en assurer.
          </li>
        </ul>

        <h3 className="shop-subheading">Spécifique aux bonus buys</h3>
        <ul>
          <li>
            Un bonus buy est acheté <strong>pendant un live</strong>. Sans stream planifié, la
            réservation reste en file d’attente et les points ne sont débités qu’à sa validation.
          </li>
          <li>
            Le gain versé est <strong>celui affiché à la fin du bonus</strong>, capture d’écran
            fournie. Un bonus qui retombe sous le montant acheté ne donne droit à aucune
            compensation et les points ne sont pas restitués.
          </li>
          <li>
            Si la slot demandée n’est pas disponible sur le casino utilisé ce soir-là, vous choisissez
            un autre titre du même montant, ou la réservation est annulée et les points restitués.
          </li>
          <li>
            Une réservation par membre et par live tant que la file d’attente n’est pas écoulée, pour
            que tout le monde puisse passer.
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
