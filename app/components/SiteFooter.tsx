import Image from 'next/image';
import Link from 'next/link';
import { links } from '../lib/site';
import { ArrowIcon, DiscordIcon, RumbleIcon, StakeMark, TelegramIcon } from './BrandIcons';

export default function SiteFooter() {
  return (
    <footer className="site-footer section-shell" role="contentinfo">
      <div className="footer-brand">
        <Image src="/avatar.png" alt="" width={44} height={44} />
        <div className="footer-brand-text">
          <span>
            <strong>SPIN</strong> DISTRICT
          </span>
          <small>LIVES • HUNTS • CASINO</small>
        </div>
      </div>

      <div className="footer-legal">
        <p>
          <strong>Jeu responsable &amp; transparence :</strong> Spin District est un site
          indépendant d’information et d’outils pour les passionnés de machines à sous. Les liens
          vers Celsius Casino et Stake sont des <strong>liens d’affiliation</strong> : nous pouvons
          percevoir une commission si vous créez un compte, sans surcoût pour vous et sans influence
          sur nos contenus. Les jeux d’argent sont strictement interdits aux mineurs (18+) et ces
          opérateurs ne détiennent pas d’agrément ANJ en France.
        </p>
        <p className="helpline">
          Besoin d’aide ? Appelez <strong>Joueurs Info Service</strong> au{' '}
          <a href="tel:0974751313">09 74 75 13 13</a> (appel non surtaxé, 8h-2h, 7j/7) ou consultez{' '}
          <a href={links.helpline} target="_blank" rel="noopener noreferrer">
            joueurs-info-service.fr ↗
          </a>
        </p>
      </div>

      <div className="footer-links-block">
        <h2>Navigation</h2>
        <div className="footer-links">
          <Link href="/">Accueil</Link>
          <Link href="/casinos">Casinos partenaires</Link>
          <Link href="/guide-bonus-hunt">Guide du Bonus Hunt</Link>
          <Link href="/#bonus-hunt">Bonus Hunt Lab (tracker)</Link>
          <Link href="/#faq">FAQ &amp; Guides</Link>
          <Link href="/jeu-responsable">Jeu responsable &amp; 18+</Link>
        </div>
      </div>

      <div className="footer-links-block">
        <h2>Communauté &amp; partenaires</h2>
        <div className="footer-links">
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-telegram-link"
            title="Canal Telegram VIP officiel"
          >
            <TelegramIcon /> Canal Telegram VIP <ArrowIcon />
          </a>
          <a href={links.stream} target="_blank" rel="noopener noreferrer" title="Chaîne Rumble">
            <RumbleIcon /> Rumble Live <ArrowIcon />
          </a>
          <a href={links.discord} target="_blank" rel="noopener noreferrer" title="Serveur Discord">
            <DiscordIcon /> Discord officiel <ArrowIcon />
          </a>
          <a
            href={links.stake}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="footer-stake-link"
            title="Stake — lien partenaire"
          >
            <StakeMark size={16} /> Stake <ArrowIcon />
          </a>
          <a
            href={links.celsius}
            target="_blank"
            rel="sponsored noopener noreferrer"
            title="Celsius Casino — lien partenaire"
          >
            Celsius Casino <ArrowIcon />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© 2026 Spin District. Tous droits réservés. 18+ • Liens partenaires.</small>
        <a href="#top" className="back-to-top">
          Haut de page ↑
        </a>
      </div>
    </footer>
  );
}
