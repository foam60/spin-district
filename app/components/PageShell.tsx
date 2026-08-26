import Link from 'next/link';
import type { ReactNode } from 'react';
import ResponsibleBanner from './ResponsibleBanner';
import ScrollTopButton from './ScrollTopButton';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { links, siteUrl } from '../lib/site';

export type Crumb = { name: string; path: string };

/** Fil d'ariane visible + JSON-LD BreadcrumbList (rich result Google). */
function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Accueil', path: '/' }, ...crumbs].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="breadcrumbs" aria-label="Fil d’ariane">
        <Link href="/">Accueil</Link>
        {crumbs.map((crumb, index) => (
          <span key={crumb.path}>
            <span aria-hidden="true" className="crumb-sep">
              /
            </span>
            {index === crumbs.length - 1 ? (
              <span aria-current="page">{crumb.name}</span>
            ) : (
              <Link href={crumb.path}>{crumb.name}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export default function PageShell({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  crumbs: Crumb[];
  children: ReactNode;
}) {
  return (
    <main id="main-content">
      <SiteHeader discordUrl={links.discord} telegramUrl={links.telegram} stakeUrl={links.stake} />

      <div className="page-shell section-shell" id="top">
        <Breadcrumbs crumbs={crumbs} />

        <header className="page-hero">
          <span className="section-index">{eyebrow}</span>
          <h1>{title}</h1>
          <div className="page-hero-intro">{intro}</div>
        </header>

        {children}
      </div>

      <SiteFooter />
      <ScrollTopButton />
      <ResponsibleBanner />
    </main>
  );
}
