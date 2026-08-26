'use client';

import Image from 'next/image';
import { useState } from 'react';

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
      className="telegram-icon-svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function SiteHeader({
  discordUrl,
  telegramUrl = 'https://t.me/+rXPQXhTaEKZjMjc0',
}: {
  discordUrl: string;
  telegramUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="site-header" role="banner">
      <a className="skip-link" href="#bonus-hunt">
        Aller directement au Bonus Hunt Lab ↗
      </a>

      <div className="header-left">
        <a className="brand" href="#top" aria-label="Spin District — Retour en haut de page" onClick={close}>
          <div className="brand-logo-wrap">
            <Image src="/avatar.png" alt="Spin District Logo Officiel" width={48} height={48} priority />
          </div>
          <div className="brand-text">
            <span><strong>SPIN</strong> DISTRICT</span>
            <small>LIVES & HUNTS</small>
          </div>
        </a>
      </div>

      <nav className="desktop-nav" aria-label="Navigation principale">
        <a href="#offre" className="nav-link">Partenaire</a>
        <a href="#bonus-hunt" className="nav-link highlight-link">
          <span className="nav-tag">HOT</span>
          Hunt Lab
        </a>
        <a href="#live" className="nav-link">Lives & Formats</a>
        <a href="#communaute" className="nav-link">Communauté</a>
        <a href="#faq" className="nav-link">FAQ</a>
      </nav>

      <div className="header-end">
        <div className="live-status-indicator" title="Suivez nos lives réguliers sur Rumble">
          <span className="live-pulse" />
          <span className="live-label">LIVE & VOD</span>
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
          className="header-cta"
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Rejoindre le Discord Spin District (nouvelle fenêtre)"
        >
          <span>Discord</span> <ArrowIcon />
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <div className="brand-text">
                <span><strong>SPIN</strong> DISTRICT</span>
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
              <a href="#offre" onClick={close}>
                <span>01</span> Partenaire Celsius Casino <ArrowIcon />
              </a>
              <a href="#bonus-hunt" onClick={close} className="highlight">
                <span>02</span> Bonus Hunt Lab (Tracker) <ArrowIcon />
              </a>
              <a href="#live" onClick={close}>
                <span>03</span> Lives Rumble & Formats <ArrowIcon />
              </a>
              <a href="#communaute" onClick={close}>
                <span>04</span> Communauté Discord <ArrowIcon />
              </a>
              <a href="#faq" onClick={close}>
                <span>05</span> FAQ & Guides <ArrowIcon />
              </a>
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
                className="button button-primary"
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rejoindre le Discord <ArrowIcon />
              </a>
              <p className="mobile-disclaimer">18+ • Jouer comporte des risques</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
