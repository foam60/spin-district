import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { casinos, links, siteUrl } from './lib/site';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const viewport: Viewport = {
  themeColor: '#050806',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Spin District — Lives Casino, Tracker Bonus Hunt Lab & Communauté VIP',
    template: '%s | Spin District',
  },
  description:
    'Spin District : lives casino immersifs sur Rumble, tracker de bonus hunts 100 % gratuit avec sauvegarde automatique locale, catalogue 2000+ slots, casinos partenaires Stake et Celsius, canal Telegram officiel et communauté Discord. 18+.',
  keywords: [
    'Spin District',
    'Bonus Hunt',
    'Bonus Hunt Tracker',
    'Tracker Bonus Hunt gratuit',
    'Calculateur Bonus Hunt',
    'Break even bonus hunt',
    'Tracker Casino en ligne',
    'Slots Tracker',
    'Stake',
    'Stake casino',
    'Lien partenaire Stake',
    'Celsius Casino',
    'Bonus Celsius Casino',
    'Machines à sous',
    'Live Casino Rumble',
    'Stream Casino France',
    'Discord Casino Spin District',
    'Canal Telegram Spin District',
    'Wager Challenge',
    'Gestion bankroll casino',
    'RTP slots',
  ],
  authors: [{ name: 'Spin District', url: siteUrl }],
  creator: 'Spin District',
  publisher: 'Spin District',
  applicationName: 'Spin District Hunt Lab',
  category: 'Entertainment & Gaming',
  alternates: { canonical: siteUrl },
  manifest: '/site.webmanifest',
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.svg',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Spin District — Chaque spin peut tout changer | Lives & Bonus Hunt Lab',
    description:
      'Lives casino immersifs sur Rumble, tracker de bonus hunts avec sauvegarde locale automatique, casinos partenaires Stake et Celsius, challenges inédits et canal Telegram exclusif.',
    url: siteUrl,
    siteName: 'Spin District',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Spin District — Chaque spin peut tout changer',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spin District — Lives Casino, Tracker Bonus Hunt & Communauté',
    description:
      'Suivez les lives casino en direct, trackez vos bonus hunts sans inscription avec sauvegarde locale et rejoignez le canal Telegram VIP.',
    images: ['/og.png'],
    creator: '@SpinDistrict',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Spin District',
      alternateName: ['SpinDistrict', 'Spin District Casino'],
      description:
        'Lives casino sur Rumble, tracker de bonus hunts sauvegardé en local, casinos partenaires Stake et Celsius, canal Telegram VIP et communauté Discord.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'fr-FR',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Spin District',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        'Communauté de streaming casino, créateurs du Bonus Hunt Lab et animations interactives.',
      sameAs: [links.telegram, links.stream, links.discord],
    },
    ...casinos.map((casino) => ({
      '@type': 'Organization',
      '@id': `${siteUrl}/#${casino.slug}`,
      name: casino.name,
      url: casino.url,
      description: casino.highlight,
    })),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`dark ${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
