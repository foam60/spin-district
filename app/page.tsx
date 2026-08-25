import Image from 'next/image';
import BonusHuntBoard from './components/BonusHuntBoard';

const affiliateUrl =
  process.env.NEXT_PUBLIC_CELSIUS_AFFILIATE_URL ?? 'https://celsius.games/UOpYoHXSoi';
const discordUrl =
  process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.com/';
const streamUrl =
  process.env.NEXT_PUBLIC_STREAM_URL ?? 'https://rumble.com/c/c-7946190?e9s=src_v1_cbl';

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Spin District — accueil">
          <Image src="/avatar.png" alt="" width={52} height={52} priority />
          <span><strong>SPIN</strong> DISTRICT</span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#offre">Le partenaire</a>
          <a href="#bonus-hunt">Bonus Hunt</a>
          <a href="#live">Les lives</a>
          <a href="#communaute">Communauté</a>
        </nav>
        <a className="header-cta" href={discordUrl} target="_blank" rel="noreferrer">
          Discord <ArrowIcon />
        </a>
      </header>

      <section className="hero section-shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><i /> Live • Slots • Bonus hunts</div>
          <p className="hero-kicker">Bienvenue dans le district</p>
          <h1>CHAQUE SPIN<span>PEUT TOUT CHANGER</span></h1>
          <p className="hero-intro">
            Des sessions casino en direct, des bonus hunts et des challenges
            partagés avec une communauté qui vit chaque spin à fond.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={affiliateUrl} target="_blank" rel="sponsored noreferrer">
              Découvrir Celsius <ArrowIcon />
            </a>
            <a className="button button-ghost" href="#live">Voir les derniers lives ↓</a>
          </div>
          <p className="affiliate-note">Lien partenaire • 18+ • Offre soumise aux conditions de Celsius Casino</p>
        </div>

        <div className="hero-visual" aria-label="Spin District, partenaire Celsius Casino">
          <div className="visual-glow" />
          <div className="partner-card">
            <div className="partner-topline">
              <span>CASINO PARTENAIRE</span><span className="status-dot">EN LIGNE</span>
            </div>
            <div className="celsius-wordmark">
              <Image src="/celsius-icon.png" alt="Logo Celsius Casino" width={58} height={58} />
              <strong>CELSIUS<small>CASINO</small></strong>
            </div>
            <p>Profite de l’offre de bienvenue via le lien officiel de Spin District.</p>
            <ul>
              <li><span>01</span> Premier dépôt de 20 € remboursé*</li>
              <li><span>02</span> Jusqu’à 550 % de bonus de bienvenue*</li>
              <li><span>03</span> Free spins offerts selon l’offre active*</li>
            </ul>
            <a href={affiliateUrl} target="_blank" rel="sponsored noreferrer">Accéder au casino <ArrowIcon /></a>
          </div>
          <div className="visual-stamp">SD<span>EST. 2026</span></div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div>SPIN DISTRICT <b>✦</b> EN DIRECT <b>✦</b> BONUS HUNTS <b>✦</b> CHALLENGES <b>✦</b> JEU RESPONSABLE <b>✦</b> SPIN DISTRICT <b>✦</b> EN DIRECT <b>✦</b> BONUS HUNTS <b>✦</b> CHALLENGES <b>✦</b> JEU RESPONSABLE <b>✦</b></div>
      </div>

      <section className="partner-section section-shell" id="offre">
        <div className="section-heading">
          <div><span className="section-index">01 — PARTENAIRE</span><h2>TON ACCÈS AU<br /><em>DISTRICT</em></h2></div>
          <p>Découvre Celsius Casino depuis le lien Spin District : premier dépôt de 20 € remboursé, jusqu’à 550 % de bonus et des free spins offerts selon l’offre active.*</p>
        </div>
        <a className="celsius-offer-banner" href={affiliateUrl} target="_blank" rel="sponsored noreferrer">
          <Image src="/celsius-550.png" alt="Celsius Casino — bonus de bienvenue jusqu’à 550 %" width={2640} height={480} />
          <span><Image src="/celsius-icon.png" alt="" width={44} height={44} /> Profiter de l’offre <ArrowIcon /></span>
        </a>
        <div className="benefit-grid">
          <article><span className="benefit-number">01</span><h3>20 € REMBOURSÉS*</h3><p>Ton premier dépôt de 20 € est remboursé via l’offre Spin District.</p></article>
          <article><span className="benefit-number">02</span><h3>550 % + FREE SPINS*</h3><p>Un bonus de bienvenue renforcé et des tours gratuits selon les conditions actives.</p></article>
          <article className="benefit-featured">
            <span className="benefit-number">03</span><h3>UNE COMMUNAUTÉ</h3>
            <p>Partage l’expérience avec le District sur Discord avant et après les lives.</p>
            <a href={discordUrl} target="_blank" rel="noreferrer">Rejoindre Discord <ArrowIcon /></a>
          </article>
        </div>
        <p className="offer-terms">*Offre réservée aux personnes majeures, soumise à éligibilité et aux conditions, limites et exigences de mise affichées par Celsius Casino. Les bonus ne garantissent aucun gain.</p>
      </section>

      <section className="hunt-section section-shell" id="bonus-hunt">
        <div className="section-heading hunt-heading">
          <div>
            <span className="section-index">02 — BONUS HUNT LAB</span>
            <h2>CONSTRUIS<br /><em>LA PROCHAINE CHASSE</em></h2>
          </div>
          <p>
            Explore les dernières sorties, filtre les studios et compose une
            sélection pour le prochain live. Le catalogue se met à jour via une
            API spécialisée et conserve une sélection Celsius si le flux est indisponible.
          </p>
        </div>
        <BonusHuntBoard />
        <div className="hunt-howto">
          <article><span>01</span><h3>REPÈRE</h3><p>Filtre les nouveautés par studio et compare les données disponibles.</p></article>
          <article><span>02</span><h3>COMPOSE</h3><p>Ajoute tes machines favorites à la sélection du prochain Bonus Hunt.</p></article>
          <article><span>03</span><h3>SUIS LE LIVE</h3><p>Retrouve la chasse complète et son ouverture sur la chaîne Rumble.</p></article>
        </div>
      </section>

      <section className="live-section section-shell" id="live">
        <div className="section-heading compact">
          <div><span className="section-index">03 — LE LIVE</span><h2>DERNIERS<br /><em>FORMATS</em></h2></div>
          <a className="text-link" href={streamUrl} target="_blank" rel="noreferrer">Voir la chaîne Rumble <ArrowIcon /></a>
        </div>
        <div className="content-grid">
          <a className="content-card content-card-large" href={streamUrl} target="_blank" rel="noreferrer">
            <Image src="/bonus-hunt.png" alt="Bonus Hunt Spin District, départ à 1 500 euros" fill sizes="(max-width: 800px) 100vw, 66vw" />
            <span className="card-shade" /><div className="card-label"><i /> Bonus Hunt</div>
            <div className="card-copy"><p>DERNIÈRE SESSION</p><h3>LA CHASSE<br />EST OUVERTE.</h3><span>Regarder maintenant <ArrowIcon /></span></div>
          </a>
          <a className="content-card" href={streamUrl} target="_blank" rel="noreferrer">
            <Image src="/wager-challenge.png" alt="Wager Challenge Spin District" fill sizes="(max-width: 800px) 100vw, 34vw" />
            <span className="card-shade" /><div className="card-label"><i /> Challenge</div>
            <div className="card-copy small"><p>FORMAT COMMUNAUTÉ</p><h3>WAGER<br />CHALLENGE</h3><span>Découvrir <ArrowIcon /></span></div>
          </a>
        </div>
      </section>

      <section className="community-section" id="communaute">
        <div className="community-inner section-shell">
          <div className="community-avatar"><Image src="/avatar.png" alt="Logo Spin District" width={150} height={150} /></div>
          <div className="community-copy">
            <span className="section-index">04 — COMMUNAUTÉ</span><h2>LE LIVE S’ARRÊTE.<br /><em>PAS LE DISTRICT.</em></h2>
            <p>Rejoins Discord pour connaître les prochains lives, discuter des sessions et ne manquer aucun challenge.</p>
          </div>
          <a className="button button-primary discord-button" href={discordUrl} target="_blank" rel="noreferrer">Rejoindre Discord <ArrowIcon /></a>
        </div>
      </section>

      <footer className="section-shell">
        <div className="footer-brand"><Image src="/avatar.png" alt="" width={42} height={42} /><span><strong>SPIN</strong> DISTRICT</span></div>
        <p>Site indépendant et partenaire. Le jeu comporte des risques : endettement, isolement, dépendance. Jouez avec modération. Interdit aux moins de 18 ans.</p>
        <div className="footer-links">
          <a href="https://www.joueurs-info-service.fr/" target="_blank" rel="noreferrer">Joueurs Info Service</a>
          <a href={discordUrl} target="_blank" rel="noreferrer">Discord</a>
        </div>
        <small>© 2026 Spin District. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
