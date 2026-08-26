import Image from 'next/image';
import BonusHuntBoard from './components/BonusHuntBoard';
import SiteHeader from './components/SiteHeader';

const affiliateUrl =
  process.env.NEXT_PUBLIC_CELSIUS_AFFILIATE_URL ?? 'https://celsius.games/UOpYoHXSoi';
const discordUrl =
  process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.com/';
const telegramUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_URL ?? 'https://t.me/+rXPQXhTaEKZjMjc0';
const streamUrl =
  process.env.NEXT_PUBLIC_STREAM_URL ?? 'https://rumble.com/c/c-7946190?e9s=src_v1_cbl';

function ArrowIcon() {
  return <span aria-hidden="true" className="icon-arrow">↗</span>;
}

function TelegramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <SiteHeader discordUrl={discordUrl} telegramUrl={telegramUrl} />

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
            avec la communauté. Suivez vos sessions sur le <strong>Hunt Lab</strong> et retrouvez-nous en direct sur Rumble et Telegram.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#bonus-hunt" title="Accéder au tracker de Bonus Hunt gratuit">
              Ouvrir le Hunt Lab <ArrowIcon />
            </a>
            <a
              className="button button-ghost"
              href={affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title="Découvrir les offres de bienvenue Celsius Casino"
            >
              Offre Celsius Casino <ArrowIcon />
            </a>
            <a
              className="button button-telegram"
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le canal Telegram VIP Spin District"
            >
              <TelegramIcon /> Canal Telegram <span className="btn-badge">VIP</span> <ArrowIcon />
            </a>
            <a
              className="button button-rumble"
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Regarder les streams live sur Rumble"
            >
              Chaîne Rumble <ArrowIcon />
            </a>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">
              <strong>550%</strong>
              <span>Bonus Bienvenue*</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>20 €</strong>
              <span>1er Dépôt Remboursé*</span>
            </div>
            <div className="trust-separator" />
            <div className="trust-item">
              <strong>100%</strong>
              <span>Gratuit & Sans Compte</span>
            </div>
          </div>

          <p className="affiliate-note">
            Lien partenaire • 18+ • Jouer comporte des risques • Offre Celsius soumise à conditions
          </p>
        </div>

        <div className="hero-visual" aria-label="Spin District, partenaire Celsius Casino">
          <div className="visual-glow" />
          <div className="partner-card">
            <div className="partner-topline">
              <span>CASINO PARTENAIRE OFFICIEL</span>
              <span className="status-dot">EN LIGNE ●</span>
            </div>

            <div className="celsius-wordmark">
              <div className="celsius-icon-wrap">
                <Image
                  src="/celsius-icon.png"
                  alt="Logo officiel Celsius Casino"
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

            <p>
              Profitez de l’offre de bienvenue réservée à la communauté Spin District.
            </p>

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
                  <strong>Free spins & cashback VIP*</strong>
                  <small>Tours gratuits et récompenses actives</small>
                </div>
              </li>
            </ul>

            <a
              className="partner-cta-link"
              href={affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              title="Profiter de l'offre Celsius Casino"
            >
              <span>Accéder à l’offre Celsius</span> <ArrowIcon />
            </a>
          </div>

          <div className="visual-stamp">
            <span className="stamp-sd">SD</span>
            <span className="stamp-sub">EST. 2026</span>
          </div>
        </div>
      </section>

      {/* TICKER MARQUEE */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          SPIN DISTRICT <b>✦</b> EN DIRECT SUR RUMBLE <b>✦</b> BONUS HUNT LAB <b>✦</b> CANAL TELEGRAM VIP <b>✦</b> WAGER
          CHALLENGES <b>✦</b> DISCORD ACTIF <b>✦</b> JEU RESPONSABLE 18+ <b>✦</b> SPIN DISTRICT <b>✦</b> EN DIRECT SUR RUMBLE <b>✦</b> BONUS HUNT LAB <b>✦</b> CANAL TELEGRAM VIP <b>✦</b> WAGER
          CHALLENGES <b>✦</b> DISCORD ACTIF <b>✦</b> JEU RESPONSABLE 18+ <b>✦</b>
        </div>
      </div>

      {/* SECTION PARTENAIRE CELSIUS */}
      <section className="partner-section section-shell" id="offre" aria-labelledby="partner-title">
        <div className="section-heading">
          <div>
            <span className="section-index">01 — PARTENAIRE</span>
            <h2 id="partner-title">
              TON ACCÈS AU<br />
              <em>DISTRICT CELSIUS</em>
            </h2>
          </div>
          <p>
            Celsius Casino via le lien officiel Spin District : premier dépôt de 20 € remboursé,
            jusqu’à 550 % de bonus et des free spins selon l’offre en cours.* Réservé aux personnes
            majeures (18 ans et plus).
          </p>
        </div>

        <a
          className="celsius-offer-banner"
          href={affiliateUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          title="Profiter de l'offre de bienvenue exclusive Celsius Casino"
        >
          <Image
            src="/celsius-550.png"
            alt="Celsius Casino — bonus de bienvenue jusqu’à 550 % et tours gratuits"
            width={2640}
            height={480}
            priority
          />
          <span className="banner-badge">
            <Image src="/celsius-icon.png" alt="" width={38} height={38} />
            <span>Profiter de l’offre exclusive</span> <ArrowIcon />
          </span>
        </a>

        <div className="benefit-grid">
          <article className="benefit-card">
            <span className="benefit-number">01</span>
            <h3>20 € REMBOURSÉS*</h3>
            <p>
              Votre premier dépôt de 20 € est remboursé selon les conditions de bienvenue du
              partenaire.
            </p>
          </article>

          <article className="benefit-card">
            <span className="benefit-number">02</span>
            <h3>550 % + TOURS GRATUITS*</h3>
            <p>
              Boostez votre bankroll initiale avec le package de bienvenue multi-dépôts et tours
              offerts sur les meilleures slots.
            </p>
          </article>

          <article className="benefit-card benefit-featured">
            <span className="benefit-number">03</span>
            <h3>TELEGRAM & DISCORD</h3>
            <p>
              Annonces de lives instantanées, partages de hunts, giveaways et alertes exclusives pour la communauté.
            </p>
            <div className="benefit-links-row">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="benefit-link telegram-link"
                title="Rejoindre le canal Telegram VIP"
              >
                <TelegramIcon /> Canal Telegram <ArrowIcon />
              </a>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="benefit-link"
                title="Rejoindre le Discord communautaire"
              >
                Discord <ArrowIcon />
              </a>
            </div>
          </article>
        </div>

        <p className="offer-terms">
          *Offre réservée aux personnes majeures (18+), soumise aux conditions générales et règles
          de mise de Celsius Casino. Les bonus ne garantissent aucun gain. Jouer comporte des risques
          d’addiction, d’isolement et de pertes financières.
        </p>
      </section>

      {/* SECTION BONUS HUNT LAB */}
      <section className="hunt-section section-shell" id="bonus-hunt" aria-labelledby="hunt-title">
        <div className="section-heading hunt-heading">
          <div>
            <span className="section-index">02 — BONUS HUNT LAB</span>
            <h2 id="hunt-title">
              TES CHASSES<br />
              <em>RESTENT SAUVEGARDÉES</em>
            </h2>
          </div>
          <div className="hunt-heading-desc">
            <p>
              Créez une session, ajoutez vos machines une à une, notez les mises et renseignez les
              gains lors de l’ouverture.
            </p>
            <p className="storage-highlight">
              💡 <strong>Sauvegarde locale automatique :</strong> Fermez l’onglet, éteignez votre
              ordinateur : toutes vos sessions passées et leurs tableaux restent consultables et
              modifiables lors de votre prochaine visite.
            </p>
          </div>
        </div>

        <BonusHuntBoard />

        <div className="hunt-howto">
          <article>
            <div className="howto-header">
              <span className="step-num">01</span>
              <h3>CRÉEZ VOTRE HUNT</h3>
            </div>
            <p>
              Nommez votre session (ex: Session Samedi) et définissez votre bankroll de départ. Elle
              apparaît instantanément dans votre barre de sessions.
            </p>
          </article>

          <article>
            <div className="howto-header">
              <span className="step-num">02</span>
              <h3>REMPLISSEZ LE TABLEAU</h3>
            </div>
            <p>
              Sélectionnez vos machines dans le catalogue de plus de 2 000 slots ou ajoutez vos
              titres personnalisés avec leur mise.
            </p>
          </article>

          <article>
            <div className="howto-header">
              <span className="step-num">03</span>
              <h3>SUIVEZ VOS GAINS</h3>
            </div>
            <p>
              Saisissez les gains lors de l’ouverture : calcul en direct du multiplicateur, du
              break-even et du profit net. Tout est sauvegardé automatiquement.
            </p>
          </article>
        </div>
      </section>

      {/* SECTION LIVES & FORMATS */}
      <section className="live-section section-shell" id="live" aria-labelledby="live-title">
        <div className="section-heading compact">
          <div>
            <span className="section-index">03 — LE LIVE</span>
            <h2 id="live-title">
              NOS FORMATS<br />
              <em>EN DIRECT & REPLAY</em>
            </h2>
          </div>
          <a className="text-link" href={streamUrl} target="_blank" rel="noopener noreferrer" title="Consulter la chaîne Rumble Spin District">
            Voir la chaîne Rumble <ArrowIcon />
          </a>
        </div>

        <div className="content-grid">
          <a
            className="content-card content-card-large"
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Regarder les sessions de Bonus Hunt en direct sur Rumble"
          >
            <Image
              src="/bonus-hunt.png"
              alt="Bonus Hunt Spin District en direct sur Rumble"
              fill
              sizes="(max-width: 800px) 100vw, 66vw"
            />
            <span className="card-shade" />
            <div className="card-label">
              <i className="status-dot-pulse" /> Bonus Hunt Live
            </div>
            <div className="card-copy">
              <p className="card-kicker">STREAM & OUVERTURE</p>
              <h3>
                LA CHASSE<br />
                EST OUVERTE.
              </h3>
              <span className="card-action">
                Regarder le stream sur Rumble <ArrowIcon />
              </span>
            </div>
          </a>

          <a
            className="content-card"
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Participer aux Wager Challenges Spin District"
          >
            <Image
              src="/wager-challenge.png"
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
                WAGER<br />
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
            <Image src="/avatar.png" alt="Avatar Spin District Officiel" width={150} height={150} />
          </div>

          <div className="community-copy">
            <span className="section-index">04 — COMMUNAUTÉ</span>
            <h2 id="community-title">
              LE LIVE S’ARRÊTE.<br />
              <em>PAS LE DISTRICT.</em>
            </h2>
            <p>
              Rejoignez le Discord et le canal Telegram VIP officiel pour être prévenu en direct des prochains lives,
              échanger sur les machines à sous du moment, participer aux giveaways et recevoir nos alertes exclusives.
            </p>
            <div className="community-perks">
              <span>✦ Alertes Lives</span>
              <span>✦ Canal Telegram VIP</span>
              <span>✦ Giveaways</span>
              <span>✦ Partage de Hunts</span>
              <span>✦ Entraide & Conseils</span>
            </div>
          </div>

          <div className="community-actions-group">
            <a
              className="button button-telegram community-telegram-btn"
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le canal Telegram Spin District"
            >
              <TelegramIcon /> Canal Telegram <span className="btn-badge">VIP</span> <ArrowIcon />
            </a>
            <a
              className="button button-primary discord-button"
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Rejoindre le serveur Discord officiel"
            >
              Rejoindre le Discord <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION FAQ (SEO POWERHOUSE) */}
      <section className="faq-section section-shell" id="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <div>
            <span className="section-index">05 — FAQ & GUIDES</span>
            <h2 id="faq-title">
              TOUT SAVOIR SUR LE<br />
              <em>BONUS HUNT & LE DISTRICT</em>
            </h2>
          </div>
          <p>
            Retrouvez les réponses aux questions les plus fréquentes sur le fonctionnement du Bonus Hunt Lab, nos streams et nos réseaux.
          </p>
        </div>

        <div className="faq-grid">
          <details className="faq-item" open>
            <summary className="faq-question">
              <span>Qu’est-ce qu’un Bonus Hunt au casino ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                Un <strong>Bonus Hunt</strong> (ou chasse aux bonus) est une stratégie populaire de streaming et de jeu de machines à sous.
                Elle consiste à jouer successivement sur différentes machines jusqu’à déclencher les tours gratuits (bonus), sans les ouvrir immédiatement.
                Une fois tous les bonus collectés avec une bankroll définie, tous les bonus sont ouverts d’affilée pour découvrir le multiplicateur moyen et le gain total.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Comment utiliser le tracker de Bonus Hunt Spin District ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                Le <strong>Bonus Hunt Lab</strong> est 100% gratuit et sans inscription. Cliquez sur &quot;Ouvrir le Hunt Lab&quot;, nommez votre session et indiquez votre start balance.
                Ajoutez vos machines parmi le catalogue de plus de 2 000 slots intégrées (Pragmatic Play, Hacksaw, NoLimit City, Play&apos;n GO, etc.), entrez vos mises et notez vos gains lors de l’ouverture. Le tracker calcule en temps réel votre multiplicateur moyen, votre break-even et votre profit net.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Mes sessions et données sont-elles conservées après fermeture du navigateur ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                <strong>Oui !</strong> Le Bonus Hunt Lab enregistre automatiquement chaque modification dans le stockage local persistant (LocalStorage / IndexedDB) de votre navigateur.
                Vos données restent stockées sur votre machine : fermez l’onglet ou redémarrez votre appareil, vous retrouverez toutes vos sessions intactes lors de votre prochaine visite. Vous pouvez également exporter vos données en CSV ou JSON.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Comment rejoindre le canal Telegram VIP Spin District ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                Cliquez sur le bouton <strong>Telegram VIP</strong> dans la barre de navigation en haut du site ou dans la section Communauté.
                Le canal Telegram officiel vous permet d&apos;être alerté immédiatement avant chaque live Rumble, de recevoir les récapitulatifs des hunts et de participer aux animations exclusives.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Quels sont les avantages avec Celsius Casino ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                En vous inscrivant via notre lien partenaire officiel, vous accédez à un <strong>premier dépôt de 20 € remboursé</strong> ainsi qu&apos;à un pack de bienvenue jusqu&apos;à <strong>550 % de bonus</strong> et des tours gratuits réguliers selon les conditions du casino. Offre strictement réservée aux personnes majeures (18+).
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              <span>Quelles sont les règles de Jeu Responsable (18+) ?</span>
              <span className="faq-chevron" aria-hidden="true">↓</span>
            </summary>
            <div className="faq-answer">
              <p>
                Les jeux d’argent sont formellement interdits aux mineurs. Ne considérez jamais le casino comme un moyen de gagner de l’argent ou de rembourser des dettes.
                Fixez-vous des limites strictes de temps et d’argent, et ne jouez que des sommes que vous pouvez vous permettre de perdre. En cas de doute ou de difficulté, contactez <strong>Joueurs Info Service</strong> au <a href="tel:0974751313" className="faq-link">09 74 75 13 13</a>.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer section-shell" role="contentinfo">
        <div className="footer-brand">
          <Image src="/avatar.png" alt="Logo Spin District" width={44} height={44} />
          <div className="footer-brand-text">
            <span><strong>SPIN</strong> DISTRICT</span>
            <small>LIVES • HUNTS • CASINO</small>
          </div>
        </div>

        <div className="footer-legal">
          <p>
            <strong>Jeu Responsable & Avertissement :</strong> Spin District est un site
            indépendant d’information et d’outils pour les passionnés de slots, partenaire de Celsius
            Casino. Les jeux d’argent sont strictement interdits aux mineurs (18+). Jouer comporte
            des risques : endettement, isolement, dépendance. Ne misez jamais d’argent que vous ne
            pouvez pas vous permettre de perdre.
          </p>
          <p className="helpline">
            Besoin d’aide ? Appelez <strong>Joueurs Info Service</strong> au{' '}
            <a href="tel:0974751313">09 74 75 13 13</a> (appel non surtaxé) ou consultez{' '}
            <a href="https://www.joueurs-info-service.fr/" target="_blank" rel="noopener noreferrer">
              joueurs-info-service.fr ↗
            </a>
          </p>
        </div>

        <div className="footer-links-block">
          <h4>Navigation & Liens utiles</h4>
          <div className="footer-links">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="footer-telegram-link" title="Canal Telegram VIP Officiel">
              <TelegramIcon /> Canal Telegram VIP ↗
            </a>
            <a href={streamUrl} target="_blank" rel="noopener noreferrer" title="Chaîne Rumble en direct">Rumble Live ↗</a>
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" title="Serveur Discord Spin District">Discord Officiel ↗</a>
            <a href={affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" title="Partenaire Celsius Casino">Celsius Casino ↗</a>
            <a href="#bonus-hunt" title="Tracker de Bonus Hunt">Bonus Hunt Lab ↗</a>
            <a href="#faq" title="Foire Aux Questions">FAQ & Guides ↗</a>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© 2026 Spin District. Tous droits réservés. 18+.</small>
          <a href="#top" className="back-to-top">Haut de page ↑</a>
        </div>
      </footer>
    </main>
  );
}
