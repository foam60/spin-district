import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import { ArrowIcon } from './components/BrandIcons';
import { links } from './lib/site';

export const metadata: Metadata = {
  title: 'Page introuvable (404)',
  description: 'Cette page du district n’existe pas ou a été déplacée.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content">
      <SiteHeader discordUrl={links.discord} telegramUrl={links.telegram} stakeUrl={links.stake} />

      <section className="notfound section-shell" id="top">
        <span className="notfound-code" aria-hidden="true">
          404
        </span>
        <h1>
          CE SPIN N’A RIEN DONNÉ.
          <br />
          <em>LA PAGE EST INTROUVABLE.</em>
        </h1>
        <p>
          L’adresse demandée n’existe pas ou a été déplacée. Voici les accès les plus utiles du
          district :
        </p>

        <div className="notfound-links">
          <Link className="button button-primary" href="/#bonus-hunt">
            Ouvrir le Hunt Lab <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/casinos">
            Casinos partenaires <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/guide-bonus-hunt">
            Guide du Bonus Hunt <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/">
            Retour à l’accueil <ArrowIcon />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
