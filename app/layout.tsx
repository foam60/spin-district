import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://spin-district.sandra-mousse-sm.chatgpt.site';

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
    'Spin District : Lives casino immersifs sur Rumble, tracker de bonus hunts 100% gratuit avec sauvegarde automatique locale, catalogue 2000+ slots, canal Telegram officiel et communauté Discord active. 18+.',
  keywords: [
    'Spin District',
    'Bonus Hunt',
    'Bonus Hunt Tracker',
    'Tracker Bonus Hunt gratuit',
    'Calculateur Bonus Hunt',
    'Tracker Casino en ligne',
    'Slots Tracker',
    'Celsius Casino',
    'Bonus Celsius Casino',
    'Machines à sous',
    'Live Casino Rumble',
    'Stream Casino France',
    'Discord Casino Spin District',
    'Telegram Casino',
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
  alternates: {
    canonical: siteUrl,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/avatar.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/avatar.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Spin District — Chaque spin peut tout changer | Lives & Bonus Hunt Lab',
    description:
      'Lives casino immersifs sur Rumble, tracker de bonus hunts avec sauvegarde locale automatique dans votre navigateur, challenges inédits et canal Telegram exclusif.',
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
        'Lives casino sur Rumble, tracker de bonus hunts sauvegardé en local, canal Telegram VIP et communauté Discord.',
      publisher: {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Spin District',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/avatar.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://t.me/+rXPQXhTaEKZjMjc0',
          'https://rumble.com/c/c-7946190?e9s=src_v1_cbl',
          'https://discord.com/',
        ],
      },
      inLanguage: 'fr-FR',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Spin District',
      url: siteUrl,
      logo: `${siteUrl}/avatar.png`,
      description:
        'Communauté de streaming casino, créateurs du Bonus Hunt Lab et animations interactives.',
      sameAs: [
        'https://t.me/+rXPQXhTaEKZjMjc0',
        'https://rumble.com/c/c-7946190?e9s=src_v1_cbl',
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Spin District Bonus Hunt Lab',
      url: `${siteUrl}/#bonus-hunt`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
      description:
        'Outil gratuit de suivi et de gestion de Bonus Hunts de casino : calcul en temps réel du multiplicateur, du break-even, stats détaillées et sauvegarde locale automatique.',
      featureList: [
        'Catalogue de +2 000 machines à sous (Pragmatic, Hacksaw, NoLimit, Play’n GO)',
        'Calcul en direct du multiplicateur moyen',
        'Calcul automatique du point d’équilibre (Break-Even)',
        'Sauvegarde locale automatique (LocalStorage / IndexedDB)',
        'Export CSV et JSON des sessions',
        'Mode plein écran pour le streaming',
      ],
    },
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
            text: 'Oui ! Le tracker enregistre automatiquement toutes vos sessions dans le stockage local de votre navigateur. Vos données restent strictement privées sur votre appareil et ne sont jamais transmises à des serveurs tiers.',
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
          name: "Quelle est l'offre exclusive Celsius Casino ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Via le lien partenaire Spin District, profitez d'un premier dépôt de 20 € remboursé, jusqu'à 550 % de bonus de bienvenue et de tours gratuits selon les conditions du casino. Offre réservée aux personnes majeures (18+).",
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Partenaire Celsius',
          item: `${siteUrl}#offre`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Bonus Hunt Lab Tracker',
          item: `${siteUrl}#bonus-hunt`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Lives & Formats',
          item: `${siteUrl}#live`,
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'Communauté Telegram & Discord',
          item: `${siteUrl}#communaute`,
        },
        {
          '@type': 'ListItem',
          position: 6,
          name: 'FAQ Bonus Hunt',
          item: `${siteUrl}#faq`,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
