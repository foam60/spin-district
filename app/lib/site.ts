export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spin-district.fun'
).replace(/\/$/, '');

export const links = {
  celsius: process.env.NEXT_PUBLIC_CELSIUS_AFFILIATE_URL ?? 'https://celsius.games/UOpYoHXSoi',
  stake: process.env.NEXT_PUBLIC_STAKE_AFFILIATE_URL ?? 'https://stake.bet/?c=RNOcBLU2',
  discord: process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/6jBHFqxUCy',
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? 'https://t.me/+rXPQXhTaEKZjMjc0',
  stream: process.env.NEXT_PUBLIC_STREAM_URL ?? 'https://rumble.com/c/c-7946190?e9s=src_v1_cbl',
  helpline: 'https://www.joueurs-info-service.fr/',
} as const;

export type Casino = {
  slug: 'celsius' | 'stake';
  name: string;
  tagline: string;
  url: string;
  accent: string;
  accentSoft: string;
  surface: string;
  highlight: string;
  currencies: string;
  payout: string;
  vibe: string;
  perks: { title: string; detail: string }[];
  strengths: string[];
  watchouts: string[];
};

export const casinos: Casino[] = [
  {
    slug: 'celsius',
    name: 'Celsius Casino',
    tagline: 'Casino partenaire officiel du district',
    url: links.celsius,
    accent: '#a8ff00',
    accentSoft: 'rgba(168, 255, 0, 0.14)',
    surface: 'linear-gradient(150deg, #0d1710 0%, #060a07 100%)',
    highlight: 'Jusqu’à 550 % de bonus + 1er dépôt de 20 € remboursé*',
    currencies: 'Crypto & cartes bancaires',
    payout: 'Retraits crypto rapides',
    vibe: 'Bonus de bienvenue le plus généreux',
    perks: [
      { title: 'Premier dépôt de 20 € remboursé*', detail: 'Offre négociée pour la communauté Spin District.' },
      { title: 'Jusqu’à 550 % de bonus de bienvenue*', detail: 'Package multi-dépôts sur vos premières recharges.' },
      { title: 'Free spins & cashback VIP*', detail: 'Tours offerts et récompenses régulières côté fidélité.' },
    ],
    strengths: [
      'Package de bienvenue très agressif (jusqu’à 550 %)',
      'Catalogue complet Pragmatic, Hacksaw, Nolimit City, Play’n GO',
      'Offre spécifiquement négociée pour la communauté',
    ],
    watchouts: [
      'Conditions de mise (wager) à lire avant de réclamer le bonus',
      'Opérateur hors licence ANJ : la réglementation française ne s’applique pas',
    ],
  },
  {
    slug: 'stake',
    name: 'Stake',
    tagline: 'Le géant mondial du casino crypto',
    url: links.stake,
    accent: '#1475e1',
    accentSoft: 'rgba(20, 117, 225, 0.16)',
    surface: 'linear-gradient(150deg, #132c40 0%, #0a1620 100%)',
    highlight: 'Originals maison, VIP progressif et retraits crypto instantanés',
    currencies: '20+ cryptos (BTC, ETH, LTC, SOL…)',
    payout: 'Retraits crypto quasi instantanés',
    vibe: 'La référence des streamers casino',
    perks: [
      { title: 'Stake Originals exclusifs', detail: 'Plinko, Mines, Limbo, Crash : les jeux maison vus en live.' },
      { title: 'Programme VIP progressif', detail: 'Rakeback, bonus hebdomadaires et paliers de fidélité.' },
      { title: 'Retraits crypto express', detail: 'Dépôts et retraits en crypto traités en quelques minutes.' },
    ],
    strengths: [
      'Plateforme la plus utilisée par les streamers casino au monde',
      'Rakeback et bonus récurrents plutôt qu’un simple bonus d’entrée',
      'Support 24/7 et interface ultra rapide sur mobile',
    ],
    watchouts: [
      'Bonus de bienvenue moins spectaculaire qu’un package multi-dépôts',
      'Opérateur hors licence ANJ : la réglementation française ne s’applique pas',
    ],
  },
];

export const casinoBySlug = (slug: Casino['slug']) =>
  casinos.find((casino) => casino.slug === slug)!;
