'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowIcon, DiscordIcon, StakeMark, TelegramIcon } from './BrandIcons';

type NavItem = { label: string; href: string; anchor?: string; tag?: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Casinos', href: '/casinos' },
  { label: 'Hunt Lab', href: '/#bonus-hunt', anchor: 'bonus-hunt', tag: 'HOT' },
  { label: 'Guide', href: '/guide-bonus-hunt' },
  { label: 'Lives', href: '/#live', anchor: 'live' },
  { label: 'Communauté', href: '/#communaute', anchor: 'communaute' },
  { label: 'FAQ', href: '/#faq', anchor: 'faq' },
  { label: 'Mon compte', href: '/compte' },
];

const SPY_SECTIONS = ['offre', 'bonus-hunt', 'live', 'communaute', 'faq'];

export default function SiteHeader({
  discordUrl,
  telegramUrl,
  stakeUrl,
}: {
  discordUrl: string;
  telegramUrl: string;
  stakeUrl: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Header compact dès que l'utilisateur quitte le haut de page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy : surligne la section visible (home uniquement).
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') return;
    const targets = SPY_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.5] }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [isHome]);

  // Menu mobile : verrouille le scroll de fond et ferme sur Échap.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  function isCurrent(item: NavItem) {
    if (item.anchor) return isHome && activeSection === item.anchor;
    return pathname === item.href;
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} role="banner">
      <a className="skip-link" href="#main-content">
        Aller directement au contenu principal ↗
      </a>

      <div className="header-left">
        <Link className="brand" href="/" aria-label="Spin District — Accueil" onClick={close}>
          <div className="brand-logo-wrap">
            <Image src="/avatar.png" alt="" width={48} height={48} priority />
          </div>
          <div className="brand-text">
            <span>
              <strong>SPIN</strong> DISTRICT
            </span>
            <small>LIVES &amp; HUNTS</small>
          </div>
        </Link>
      </div>

      <nav className="desktop-nav" aria-label="Navigation principale">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'nav-link',
              item.tag ? 'highlight-link' : '',
              isCurrent(item) ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={isCurrent(item) ? 'page' : undefined}
          >
            {item.tag && <span className="nav-tag">{item.tag}</span>}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-end">
        <div className="live-status-indicator" title="Suivez nos lives réguliers sur Rumble">
          <span className="live-pulse" />
          <span className="live-label">LIVE &amp; VOD</span>
        </div>

        <a
          className="header-telegram-cta"
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Rejoindre le canal Telegram VIP Spin District (nouvelle fenêtre)"
          title="Rejoindre le canal Telegram VIP Spin District"
        >
          <div className="header-telegram-icon-wrapper">
            <TelegramIcon />
            <span className="telegram-ping" aria-hidden="true" />
          </div>
          <span className="telegram-btn-label">Telegram</span>
          <span className="telegram-badge">VIP</span>
        </a>

        <a
          className="header-stake-cta"
          href={stakeUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label="Ouvrir Stake via le lien partenaire Spin District (nouvelle fenêtre)"
          title="Stake — lien partenaire Spin District"
        >
          <StakeMark size={20} />
          <span className="stake-cta-label">Stake</span>
          <ArrowIcon />
        </a>

        <a
          className="header-cta"
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Rejoindre le Discord Spin District (nouvelle fenêtre)"
        >
          <DiscordIcon size={15} />
          <span>Discord</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="mobile-nav-backdrop" onClick={close}>
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Navigation mobile"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <div className="brand-text">
                <span>
                  <strong>SPIN</strong> DISTRICT
                </span>
              </div>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={close}
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-nav-links">
              <Link href="/casinos" onClick={close}>
                <span>01</span> Casinos partenaires <ArrowIcon />
              </Link>
              <Link href="/#bonus-hunt" onClick={close} className="highlight">
                <span>02</span> Bonus Hunt Lab (Tracker) <ArrowIcon />
              </Link>
              <Link href="/guide-bonus-hunt" onClick={close}>
                <span>03</span> Guide du Bonus Hunt <ArrowIcon />
              </Link>
              <Link href="/#live" onClick={close}>
                <span>04</span> Lives Rumble &amp; Formats <ArrowIcon />
              </Link>
              <Link href="/#communaute" onClick={close}>
                <span>05</span> Communauté <ArrowIcon />
              </Link>
              <Link href="/#faq" onClick={close}>
                <span>06</span> FAQ &amp; Guides <ArrowIcon />
              </Link>
              <Link href="/compte" onClick={close}>
                <span>07</span> Mon compte &amp; points <ArrowIcon />
              </Link>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="highlight-telegram"
              >
                <span className="tg-item-badge">VIP</span>
                <span className="tg-item-text">Canal Telegram Officiel</span>
                <TelegramIcon />
              </a>
            </div>

            <div className="mobile-nav-footer">
              <a
                className="button button-telegram"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramIcon /> Rejoindre Telegram VIP <ArrowIcon />
              </a>
              <a
                className="button button-stake"
                href={stakeUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                <StakeMark size={18} /> Jouer sur Stake <ArrowIcon />
              </a>
              <a
                className="button button-primary"
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DiscordIcon size={15} /> Rejoindre le Discord <ArrowIcon />
              </a>
              <p className="mobile-disclaimer">
                18+ • Liens partenaires • Jouer comporte des risques
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
