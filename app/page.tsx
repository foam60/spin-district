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
          name: "Qu'est-ce qu'un Bonus Hunt au casino ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Un Bonus Hunt (ou chasse aux bonus) consiste à jouer sur plusieurs machines à sous jusqu'à déclencher les tours gratuits (bonus), sans les ouvrir immédiatement. Une fois tous les bonus collectés avec une bankroll définie, le joueur ouvre tous les bonus d'affilée pour calculer le multiplicateur moyen et le gain total.",
          },
        },
        {
          '@type': 'Question',
          name: 'Comment fonctionne le tracker Bonus Hunt Lab de Spin District ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Le Bonus Hunt Lab est un outil 100% gratuit et sans inscription. Créez une session, sélectionnez vos slots parmi plus de 2 000 machines ou ajoutez vos titres personnalisés, indiquez la mise, puis notez les gains lors du payout. L'outil calcule automatiquement votre multiplicateur moyen, votre point d'équilibre (break-even) et vos bénéfices.",
          },
        },
        {
          '@type': 'Question',
          name: 'Mes données de sessions sont-elles conservées en sécurité ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui. Le tracker enregistre automatiquement toutes vos sessions dans le stockage local de votre navigateur (localStorage). Vos données restent strictement privées sur votre appareil et ne sont jamais transmises à des serveurs tiers. Un export CSV ou JSON permet de les archiver.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quels sont les casinos partenaires de Spin District ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Spin District travaille avec deux casinos : Stake, la plateforme la plus utilisée par les streamers casino (Originals maison, rakeback, programme VIP progressif et retraits crypto quasi instantanés) et Celsius Casino, qui propose le package de bienvenue le plus généreux (premier dépôt de 20 € remboursé et jusqu’à 550 % de bonus). Les deux liens sont des liens d’affiliation et ces opérateurs ne détiennent pas d’agrément ANJ en France.',
          },
        },
        {
          '@type': 'Question',
          name: 'Comment rejoindre le canal Telegram officiel Spin District ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Vous pouvez rejoindre le canal Telegram officiel via le bouton Telegram dans la barre de navigation ou via les liens dédiés du site pour recevoir les alertes de live, les annonces exclusives et les giveaways de la communauté.',
          },
        },
        {
          '@type': 'Question',
          name: 'Les liens vers les casinos sont-ils des liens d’affiliation ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui. Les liens vers Stake et Celsius Casino sont des liens partenaires : Spin District peut percevoir une commission si vous créez un compte, sans surcoût pour vous. Ce financement permet de maintenir le tracker gratuit et les animations de la communauté.',
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
            Lives casino immersifs, chasses aux bonus trackées en temps réel et challenges réguliers
            avec la communauté. Suivez vos sessions sur le <strong>Hunt Lab</strong> et retrouvez-nous
            en direct sur Rumble et Telegram.
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
              <strong>2</strong>
              <span>Casinos partenaires</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>550%</strong>
              <span>Bonus Bienvenue*</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>100%</strong>
              <span>Gratuit &amp; Sans Compte</span>
            </div>
          </div>

          <p className="affiliate-note">
            Liens partenaires • 18+ • Jouer comporte des risques • Offres soumises à conditions
          </p>
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
              TES DEUX ACCÈS AU
              <br />
              <em>DISTRICT</em>
            </h2>
          </div>
          <p>
            Deux casinos, deux philosophies : <strong>Celsius</strong> pour le bonus de bienvenue le
            plus généreux, <strong>Stake</strong> pour les Originals et un VIP qui tourne toute
            l’année. Les deux sont accessibles via nos liens partenaires officiels, réservés aux
            personnes majeures (18+).
          </p>
        </div>

        <CasinoCards />

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

        <div className="benefit-grid">
          <article className="benefit-card">
            <span className="benefit-number">01</span>
            <h3>20 € REMBOURSÉS*</h3>
            <p>
              Chez Celsius, votre premier dépôt de 20 € est remboursé selon les conditions de
              bienvenue du partenaire.
            </p>
          </article>

          <article className="benefit-card">
            <span className="benefit-number">02</span>
            <h3>RAKEBACK &amp; VIP STAKE</h3>
            <p>
              Chez Stake, la valeur se construit dans la durée : rakeback, bonus hebdomadaires et
              paliers VIP progressifs plutôt qu’un simple bonus d’entrée.
            </p>
          </article>

          <article className="benefit-card benefit-featured">
            <span className="benefit-number">03</span>
            <h3>TELEGRAM &amp; DISCORD</h3>
            <p>
              Annonces de lives instantanées, partages de hunts, giveaways et alertes exclusives pour
              la communauté.
            </p>
            <div className="benefit-links-row">
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="benefit-link telegram-link"
                title="Rejoindre le canal Telegram VIP"
              >
                <TelegramIcon /> Canal Telegram <ArrowIcon />
              </a>
              <a
                href={links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="benefit-link"
                title="Rejoindre le Discord communautaire"
              >
                <DiscordIcon /> Discord <ArrowIcon />
              </a>
            </div>
          </article>
        </div>

        <div className="section-cta-row">
          <Link className="button button-ghost" href="/casinos">
            Voir le comparatif détaillé Celsius vs Stake <ArrowIcon />
          </Link>
        </div>

        <p className="offer-terms">
          *Offres réservées aux personnes majeures (18+), soumises aux conditions générales et aux
          règles de mise de chaque opérateur. Les bonus ne garantissent aucun gain. Celsius Casino et
          Stake ne détiennent pas d’agrément ANJ en France. Jouer comporte des risques d’addiction,
          d’isolement et de pertes financières.
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
              Le <strong>Bonus Hunt Lab</strong> est notre tracker de chasses aux bonus : gratuit,
              sans inscription, avec le calcul en direct du multiplicateur moyen et du break-even.
            </p>
            <p className="storage-highlight">
              💡 <strong>Sauvegarde locale automatique :</strong> fermez l’onglet, éteignez votre
              ordinateur : toutes vos sessions restent consultables et modifiables lors de votre
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
            <p>
              Ouvrez le Hunt Lab dans son espace dédié : sessions illimitées, tableau complet et
              statistiques de la chasse.
            </p>
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
              Rejoignez le Discord et le canal Telegram VIP officiel pour être prévenu en direct des
              prochains lives, échanger sur les machines à sous du moment, participer aux giveaways et
              recevoir nos alertes exclusives.
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
          <p>
            Retrouvez les réponses aux questions les plus fréquentes sur le fonctionnement du Bonus
            Hunt Lab, nos streams, nos casinos partenaires et nos réseaux.
          </p>
        </div>

        <div className="faq-grid">
          <details className="faq-item" open>
            <summary className="faq-question">
              <span>Qu’est-ce qu’un Bonus Hunt au casino ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Un <strong>Bonus Hunt</strong> (ou chasse aux bonus) est une stratégie populaire de
                streaming et de jeu de machines à sous. Elle consiste à jouer successivement sur
                différentes machines jusqu’à déclencher les tours gratuits (bonus), sans les ouvrir
                immédiatement. Une fois tous les bonus collectés avec une bankroll définie, tous les
                bonus sont ouverts d’affilée pour découvrir le multiplicateur moyen et le gain total.{' '}
                <Link href="/guide-bonus-hunt" className="faq-link">
                  Lire le guide complet ↗
                </Link>
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Comment utiliser le tracker de Bonus Hunt Spin District ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Le <strong>Bonus Hunt Lab</strong> est 100% gratuit et sans inscription. Cliquez sur
                &quot;Ouvrir le Hunt Lab&quot;, nommez votre session et indiquez votre start balance.
                Ajoutez vos machines parmi le catalogue de plus de 2 000 slots intégrées (Pragmatic
                Play, Hacksaw, Nolimit City, Play&apos;n GO, etc.), entrez vos mises et notez vos gains
                lors de l’ouverture. Le tracker calcule en temps réel votre multiplicateur moyen,
                votre break-even et votre profit net.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Mes sessions sont-elles conservées après fermeture du navigateur ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                <strong>Oui !</strong> Le Bonus Hunt Lab enregistre automatiquement chaque
                modification dans le stockage local de votre navigateur (localStorage). Vos données
                restent sur votre appareil et ne sont jamais envoyées à un serveur : fermez l’onglet
                ou redémarrez votre ordinateur, vous retrouverez toutes vos sessions intactes. Vous
                pouvez également exporter vos hunts en <strong>CSV</strong> ou en{' '}
                <strong>JSON</strong> pour les archiver ou les transférer sur un autre appareil.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Comment rejoindre le canal Telegram VIP Spin District ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Cliquez sur le bouton <strong>Telegram VIP</strong> dans la barre de navigation en
                haut du site ou dans la section Communauté. Le canal Telegram officiel vous permet
                d&apos;être alerté immédiatement avant chaque live Rumble, de recevoir les
                récapitulatifs des hunts et de participer aux animations exclusives.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Celsius ou Stake : quel casino partenaire choisir ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                <strong>Celsius Casino</strong> mise sur le bonus d’entrée : premier dépôt de 20 €
                remboursé et jusqu’à 550 % de bonus de bienvenue*. <strong>Stake</strong> mise sur la
                durée : Originals maison (Plinko, Mines, Limbo), rakeback, bonus hebdomadaires et
                retraits crypto quasi instantanés. Beaucoup de membres utilisent Celsius pour démarrer
                et Stake pour jouer sur le long terme.{' '}
                <Link href="/casinos" className="faq-link">
                  Voir le comparatif détaillé ↗
                </Link>
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Les liens vers les casinos sont-ils des liens d’affiliation ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Oui, en toute transparence : les liens vers <strong>Stake</strong> et{' '}
                <strong>Celsius Casino</strong> sont des liens partenaires. Si vous créez un compte
                via ces liens, Spin District peut percevoir une commission de l’opérateur —{' '}
                <strong>sans aucun surcoût pour vous</strong>. Cela finance le site, le tracker
                gratuit et les giveaways. Ces opérateurs ne détiennent pas d’agrément ANJ en France.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Quelles sont les règles de Jeu Responsable (18+) ?</span>
              <span className="faq-chevron" aria-hidden="true">
                ↓
              </span>
            </summary>
            <div className="faq-answer">
              <p>
                Les jeux d’argent sont formellement interdits aux mineurs. Ne considérez jamais le
                casino comme un moyen de gagner de l’argent ou de rembourser des dettes. Fixez-vous
                des limites strictes de temps et d’argent, et ne jouez que des sommes que vous pouvez
                vous permettre de perdre. En cas de doute, contactez{' '}
                <strong>Joueurs Info Service</strong> au{' '}
                <a href="tel:0974751313" className="faq-link">
                  09 74 75 13 13
                </a>
                .{' '}
                <Link href="/jeu-responsable" className="faq-link">
                  Nos règles de jeu responsable ↗
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
