import Image from 'next/image';
import Link from 'next/link';
import CasinoCards from './components/CasinoCards';
import ResponsibleBanner from './components/ResponsibleBanner';
import ScrollTopButton from './components/ScrollTopButton';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import { ArrowIcon, DiscordIcon, RumbleIcon, StakeMark, TelegramIcon } from './components/BrandIcons';
import { links, siteUrl } from './lib/site';

/**
 * Donnees structurees propres a la page d'accueil : l'outil (WebApplication)
 * et la FAQ visible ci-dessous. Le reste du graphe (WebSite, Organization,
 * casinos partenaires) est declare dans le layout racine.
 */
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qu’est-ce qu’un Bonus Hunt ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Jouer sur plusieurs machines jusqu’à déclencher les tours gratuits sans les ouvrir, puis tout ouvrir d’affilée pour comparer le multiplicateur moyen au break-even.',
          },
        },
        {
          '@type': 'Question',
          name: 'Le Hunt Lab est-il gratuit, et mes sessions sont-elles gardées ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Gratuit, sans inscription. Tout est enregistré dans le stockage local de votre navigateur : fermez l’onglet, vos sessions sont toujours là. Export CSV et JSON disponibles.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quel casino partenaire choisir ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fieryplay pour le plus gros pack de bienvenue (jusqu’à 2 500 € et 525 tours gratuits), Celsius pour le premier dépôt remboursé, Stake pour la durée (Originals, rakeback), Zeppelin pour ses 100 tours gratuits sur Gates of Olympus.',
          },
        },
        {
          '@type': 'Question',
          name: 'Les liens vers les casinos sont-ils affiliés ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui. Nous pouvons percevoir une commission si vous créez un compte, sans surcoût pour vous. Ces opérateurs n’ont pas d’agrément ANJ en France.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <SiteHeader discordUrl={links.discord} telegramUrl={links.telegram} />

      {/* HERO SECTION */}
      <section className="hero section-shell" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-badge-row">
            <div className="eyebrow">
              <i className="status-dot-pulse" /> Lives Casino • Bonus Hunts • Challenges
            </div>
            <span className="hero-pwa-badge">💾 Sauvegarde 100% Locale</span>
          </div>

          <p className="hero-kicker">Bienvenue dans le district</p>
          <h1 id="hero-title">
            CHAQUE SPIN
            <span className="gradient-text">PEUT TOUT CHANGER</span>
          </h1>

          <p className="hero-intro">
            Lives casino, chasses aux bonus trackées en direct et points à échanger contre de
            l’USDT.
          </p>

          <div className="hero-actions">
            <a
              className="button button-primary"
              href="/bonus-hunt"
              title="Accéder au tracker de Bonus Hunt gratuit"
            >
              Ouvrir le Hunt Lab <ArrowIcon />
            </a>
            <a
              className="button button-stake"
              href={links.stake}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title="Jouer sur Stake via le lien partenaire Spin District"
            >
              <StakeMark size={18} /> Jouer sur Stake <ArrowIcon />
            </a>
            <a
              className="button button-ghost"
              href={links.celsius}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title="Découvrir les offres de bienvenue Celsius Casino"
            >
              Offre Celsius <ArrowIcon />
            </a>
            <a
              className="button button-telegram"
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le canal Telegram VIP Spin District"
            >
              <TelegramIcon /> Telegram <span className="btn-badge">VIP</span> <ArrowIcon />
            </a>
          </div>

          <div className="hero-secondary-links">
            <a href={links.stream} target="_blank" rel="noopener noreferrer">
              <RumbleIcon size={14} /> Chaîne Rumble
            </a>
            <span aria-hidden="true">•</span>
            <Link href="/casinos">Comparatif des casinos</Link>
            <span aria-hidden="true">•</span>
            <Link href="/guide-bonus-hunt">Guide du Bonus Hunt</Link>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">
              <strong>4</strong>
              <span>Casinos partenaires</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>20 €</strong>
              <span>1er dépôt remboursé*</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>100%</strong>
              <span>Gratuit &amp; Sans Compte</span>
            </div>
          </div>

          <p className="affiliate-note">Liens partenaires • 18+ • Jouer comporte des risques</p>
        </div>

        <div className="hero-visual" aria-label="Casinos partenaires de Spin District">
          <div className="visual-glow" />

          <div className="partner-card">
            <div className="partner-topline">
              <span>CASINO PARTENAIRE OFFICIEL</span>
              <span className="status-dot">EN LIGNE ●</span>
            </div>

            <div className="celsius-wordmark">
              <div className="celsius-icon-wrap">
                <Image
                  src="/celsius-icon.webp"
                  alt="Logo Celsius Casino"
                  width={58}
                  height={58}
                  priority
                />
              </div>
              <div>
                <strong>CELSIUS</strong>
                <small>CASINO EXCLUSIF</small>
              </div>
            </div>

            <p>Profitez de l’offre de bienvenue réservée à la communauté Spin District.</p>

            <ul className="partner-features">
              <li>
                <span>01</span>
                <div>
                  <strong>Premier dépôt de 20 € remboursé*</strong>
                  <small>Offre spéciale communauté Spin District</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Jusqu’à 550 % de bonus de bienvenue*</strong>
                  <small>Sur vos premiers dépôts Celsius</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Free spins &amp; cashback VIP*</strong>
                  <small>Tours gratuits et récompenses actives</small>
                </div>
              </li>
            </ul>

            <a
              className="partner-cta-link"
              href={links.celsius}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title="Profiter de l'offre Celsius Casino"
            >
              <span>Accéder à l’offre Celsius</span> <ArrowIcon />
            </a>
          </div>

          {/* Second partenaire : Stake */}
          <a
            className="partner-card-mini"
            href={links.stake}
            target="_blank"
            rel="sponsored noopener noreferrer"
            title="Jouer sur Stake via le lien partenaire Spin District"
          >
            <div className="mini-logo">
              <StakeMark size={38} />
            </div>
            <div className="mini-copy">
              <span className="mini-tag">AUSSI PARTENAIRE</span>
              <strong>Stake</strong>
              <small>Originals, VIP progressif &amp; retraits crypto express</small>
            </div>
            <ArrowIcon />
          </a>

          <div className="visual-stamp">
            <span className="stamp-sd">SD</span>
            <span className="stamp-sub">EST. 2026</span>
          </div>
        </div>
      </section>

      {/* TICKER MARQUEE */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          SPIN DISTRICT <b>✦</b> EN DIRECT SUR RUMBLE <b>✦</b> BONUS HUNT LAB <b>✦</b> STAKE <b>✦</b>{' '}
          CELSIUS CASINO <b>✦</b> CANAL TELEGRAM VIP <b>✦</b> WAGER CHALLENGES <b>✦</b> DISCORD ACTIF{' '}
          <b>✦</b> JEU RESPONSABLE 18+ <b>✦</b> SPIN DISTRICT <b>✦</b> EN DIRECT SUR RUMBLE <b>✦</b>{' '}
          BONUS HUNT LAB <b>✦</b> STAKE <b>✦</b> CELSIUS CASINO <b>✦</b> CANAL TELEGRAM VIP <b>✦</b>{' '}
          WAGER CHALLENGES <b>✦</b> DISCORD ACTIF <b>✦</b> JEU RESPONSABLE 18+ <b>✦</b>
        </div>
      </div>

      {/* SECTION CASINOS PARTENAIRES */}
      <section className="partner-section section-shell" id="offre" aria-labelledby="partner-title">
        <div className="section-heading">
          <div>
            <span className="section-index">01 — PARTENAIRES</span>
            <h2 id="partner-title">
              TES ACCÈS AU
              <br />
              <em>DISTRICT</em>
            </h2>
          </div>
          <p>
            Quatre casinos testés en live. <strong>Fieryplay</strong> pour le plus gros pack,{' '}
            <strong>Zeppelin</strong> pour ses 100 tours gratuits.
          </p>
        </div>

        <CasinoCards compact />

        <a
          className="celsius-offer-banner"
          href={links.celsius}
          target="_blank"
          rel="sponsored noopener noreferrer"
          title="Profiter de l'offre de bienvenue exclusive Celsius Casino"
        >
          <Image
            src="/celsius-550.webp"
            alt="Celsius Casino — bonus de bienvenue jusqu’à 550 % et tours gratuits"
            width={1920}
            height={349}
          />
          <span className="banner-badge">
            <Image src="/celsius-icon.webp" alt="" width={38} height={38} />
            <span>Profiter de l’offre exclusive</span> <ArrowIcon />
          </span>
        </a>

        <div className="section-cta-row">
          <Link className="button button-primary" href="/remboursement-celsius">
            Faire rembourser mon dépôt Celsius <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/casinos">
            Voir le comparatif détaillé Celsius vs Stake <ArrowIcon />
          </Link>
        </div>

        <p className="offer-terms">
          *Offres soumises aux conditions des opérateurs • 18+ • Aucun agrément ANJ •{' '}
          <Link href="/jeu-responsable">conditions et jeu responsable</Link>
        </p>
      </section>

      {/* SECTION HUNT LAB (renvoi vers la page dédiée) */}
      <section className="hunt-section section-shell" id="bonus-hunt" aria-labelledby="hunt-title">
        <div className="section-heading hunt-heading">
          <div>
            <span className="section-index">02 — HUNT LAB</span>
            <h2 id="hunt-title">
              TES CHASSES
              <br />
              <em>RESTENT SAUVEGARDÉES</em>
            </h2>
          </div>
          <div className="hunt-heading-desc">
            <p>
              Notre tracker de chasses aux bonus : gratuit, sans compte, multiplicateur et
              break-even calculés en direct.
            </p>
            <p className="storage-highlight">
              💾 Tout est sauvegardé dans votre navigateur — vos sessions vous attendent à la
              prochaine visite.
            </p>
          </div>
        </div>

        <div className="hunt-teaser">
          <ul className="hunt-teaser-features">
            <li>
              <strong>2 000+</strong>
              <span>machines au catalogue</span>
            </li>
            <li>
              <strong>Break-even</strong>
              <span>fixe et évolutif, en direct</span>
            </li>
            <li>
              <strong>CSV / JSON</strong>
              <span>export et sauvegarde</span>
            </li>
            <li>
              <strong>Mode stream</strong>
              <span>overlay plein écran pour OBS</span>
            </li>
          </ul>

          <div className="hunt-teaser-cta">
            <p>Sessions illimitées, tableau complet, statistiques de la chasse.</p>
            <div className="hunt-teaser-actions">
              <Link className="button button-primary" href="/bonus-hunt">
                Ouvrir le Hunt Lab <ArrowIcon />
              </Link>
              <Link className="button button-ghost" href="/guide-bonus-hunt">
                Lire le guide <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LIVES & FORMATS */}
      <section className="live-section section-shell" id="live" aria-labelledby="live-title">
        <div className="section-heading compact">
          <div>
            <span className="section-index">03 — LE LIVE</span>
            <h2 id="live-title">
              NOS FORMATS
              <br />
              <em>EN DIRECT &amp; REPLAY</em>
            </h2>
          </div>
          <a
            className="text-link"
            href={links.stream}
            target="_blank"
            rel="noopener noreferrer"
            title="Consulter la chaîne Rumble Spin District"
          >
            Voir la chaîne Rumble <ArrowIcon />
          </a>
        </div>

        <div className="content-grid">
          <a
            className="content-card content-card-large"
            href={links.stream}
            target="_blank"
            rel="noopener noreferrer"
            title="Regarder les sessions de Bonus Hunt en direct sur Rumble"
          >
            <Image
              src="/bonus-hunt.webp"
              alt="Bonus Hunt Spin District en direct sur Rumble"
              fill
              sizes="(max-width: 800px) 100vw, 66vw"
            />
            <span className="card-shade" />
            <div className="card-label">
              <i className="status-dot-pulse" /> Bonus Hunt Live
            </div>
            <div className="card-copy">
              <p className="card-kicker">STREAM &amp; OUVERTURE</p>
              <h3>
                LA CHASSE
                <br />
                EST OUVERTE.
              </h3>
              <span className="card-action">
                Regarder le stream sur Rumble <ArrowIcon />
              </span>
            </div>
          </a>

          <a
            className="content-card"
            href={links.stream}
            target="_blank"
            rel="noopener noreferrer"
            title="Participer aux Wager Challenges Spin District"
          >
            <Image
              src="/wager-challenge.webp"
              alt="Wager Challenge communautaire Spin District"
              fill
              sizes="(max-width: 800px) 100vw, 34vw"
            />
            <span className="card-shade" />
            <div className="card-label">
              <i className="status-dot-pulse" /> Wager Challenge
            </div>
            <div className="card-copy small">
              <p className="card-kicker">FORMAT COMMUNAUTÉ</p>
              <h3>
                WAGER
                <br />
                CHALLENGE
              </h3>
              <span className="card-action">
                Participer sur Rumble <ArrowIcon />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* SECTION COMMUNAUTÉ DISCORD & TELEGRAM */}
      <section className="community-section" id="communaute" aria-labelledby="community-title">
        <div className="community-inner section-shell">
          <div className="community-avatar">
            <Image src="/avatar.png" alt="Avatar officiel Spin District" width={150} height={150} />
          </div>

          <div className="community-copy">
            <span className="section-index">04 — COMMUNAUTÉ</span>
            <h2 id="community-title">
              LE LIVE S’ARRÊTE.
              <br />
              <em>PAS LE DISTRICT.</em>
            </h2>
            <p>
              Discord et Telegram VIP : alertes de live, giveaways et partage de hunts.
            </p>
            <div className="community-perks">
              <span>✦ Alertes Lives</span>
              <span>✦ Canal Telegram VIP</span>
              <span>✦ Giveaways</span>
              <span>✦ Partage de Hunts</span>
              <span>✦ Entraide &amp; Conseils</span>
            </div>
          </div>

          <div className="community-actions-group">
            <a
              className="button button-telegram community-telegram-btn"
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le canal Telegram Spin District"
            >
              <TelegramIcon /> Canal Telegram <span className="btn-badge">VIP</span> <ArrowIcon />
            </a>
            <a
              className="button button-primary discord-button"
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le serveur Discord officiel"
            >
              <DiscordIcon size={15} /> Rejoindre le Discord <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="faq-section section-shell" id="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <div>
            <span className="section-index">05 — FAQ &amp; GUIDES</span>
            <h2 id="faq-title">
              TOUT SAVOIR SUR LE
              <br />
              <em>BONUS HUNT &amp; LE DISTRICT</em>
            </h2>
          </div>
          <p>L’essentiel en quatre réponses.</p>
        </div>

        <div className="faq-grid">
          <details className="faq-item">
            <summary className="faq-question">
              <span>Qu’est-ce qu’un Bonus Hunt ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Jouer sur plusieurs machines jusqu’à déclencher les tours gratuits sans les ouvrir,
                puis tout ouvrir d’affilée pour comparer le multiplicateur moyen au break-even.{' '}
                <Link href="/guide-bonus-hunt" className="faq-link">
                  Guide complet ↗
                </Link>
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Le Hunt Lab est-il gratuit, et mes sessions sont-elles gardées ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Gratuit, sans inscription. Tout est enregistré dans le stockage local de votre
                navigateur : fermez l’onglet, vos sessions sont toujours là. Export CSV et JSON
                disponibles.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Quel casino partenaire choisir ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Fieryplay pour le plus gros pack (jusqu’à 2 500 € + 525 tours*), Celsius pour le
                1er dépôt remboursé, Stake pour la durée, Zeppelin pour 100 tours gratuits sur
                Gates of Olympus*.{' '}
                <Link href="/casinos" className="faq-link">
                  Comparatif ↗
                </Link>
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Les liens vers les casinos sont-ils affiliés ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Oui. Nous pouvons percevoir une commission si vous créez un compte,{' '}
                <strong>sans surcoût pour vous</strong>. Ces opérateurs n’ont pas d’agrément ANJ en
                France.{' '}
                <Link href="/jeu-responsable" className="faq-link">
                  Jeu responsable ↗
                </Link>
              </p>
            </div>
          </details>
        </div>
      </section>

      <SiteFooter />
      <ScrollTopButton />
      <ResponsibleBanner />
    </main>
  );
}
