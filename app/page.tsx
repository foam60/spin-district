import Image from 'next/image';

const affiliateUrl =
  process.env.NEXT_PUBLIC_CELSIUS_AFFILIATE_URL ?? 'https://celsiuscasino.com/';
const discordUrl =
  process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.com/';
const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL ?? '#live';

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
          <div className="live-chip"><span /> Nouveau partenaire</div>
          <div className="partner-card">
            <div className="partner-topline">
              <span>CASINO PARTENAIRE</span><span className="status-dot">EN LIGNE</span>
            </div>
            <div className="celsius-wordmark"><span className="celsius-mark">C</span><strong>CELSIUS</strong></div>
            <p>Accède à la plateforme via le lien officiel de Spin District.</p>
            <ul>
              <li><span>01</span> Inscription via le lien partenaire</li>
              <li><span>02</span> Consulte l’offre disponible</li>
              <li><span>03</span> Rejoins les sessions de la communauté</li>
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
          <p>
            Découvre Celsius Casino depuis notre lien partenaire. Les offres
            actives, critères d’éligibilité et conditions de mise sont toujours
            affichés directement sur le site du casino.
          </p>
        </div>
        <div className="benefit-grid">
          <article><span className="benefit-number">01</span><h3>UN LIEN DIRECT</h3><p>Un accès simple au partenaire officiel de la chaîne, sans détour.</p></article>
          <article><span className="benefit-number">02</span><h3>DES SESSIONS LIVE</h3><p>Suis les bonus hunts, les challenges et les temps forts en direct.</p></article>
          <article className="benefit-featured">
            <span className="benefit-number">03</span><h3>UNE COMMUNAUTÉ</h3>
            <p>Partage l’expérience avec le District sur Discord avant et après les lives.</p>
            <a href={discordUrl} target="_blank" rel="noreferrer">Rejoindre Discord <ArrowIcon /></a>
          </article>
        </div>
      </section>

      <section className="live-section section-shell" id="live">
        <div className="section-heading compact">
          <div><span className="section-index">02 — LE LIVE</span><h2>DERNIERS<br /><em>FORMATS</em></h2></div>
          <a className="text-link" href={streamUrl}>Voir la chaîne <ArrowIcon /></a>
        </div>
        <div className="content-grid">
          <a className="content-card content-card-large" href={streamUrl}>
            <Image src="/bonus-hunt.png" alt="Bonus Hunt Spin District, départ à 1 500 euros" fill sizes="(max-width: 800px) 100vw, 66vw" />
            <span className="card-shade" /><div className="card-label"><i /> Bonus Hunt</div>
            <div className="card-copy"><p>DERNIÈRE SESSION</p><h3>LA CHASSE<br />EST OUVERTE.</h3><span>Regarder maintenant <ArrowIcon /></span></div>
          </a>
          <a className="content-card" href={streamUrl}>
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
            <span className="section-index">03 — COMMUNAUTÉ</span><h2>LE LIVE S’ARRÊTE.<br /><em>PAS LE DISTRICT.</em></h2>
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
