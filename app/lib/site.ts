export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spin-district.fun'
).replace(/\/$/, '');

export const links = {
  celsius: process.env.NEXT_PUBLIC_CELSIUS_AFFILIATE_URL ?? 'https://celsius.games/UOpYoHXSoi',
  stake: process.env.NEXT_PUBLIC_STAKE_AFFILIATE_URL ?? 'https://stake.bet/?c=RNOcBLU2',
  // L'identifiant d'affiliation est dans le chemin (/l/6a96…), pas dans un
  // paramètre : les macros {sub_id_1} / {click_id} restées littérales ne
  // peuvent donc pas casser l'attribution. Vérifié : redirige vers la landing
  // page avec ref=vp_w269768c393071l24284p2519_ intact.
  fieryplay:
    process.env.NEXT_PUBLIC_FIERYPLAY_AFFILIATE_URL ??
    'https://promo-fieryplay.com/l/6a96a8719ad17ced6a0dae82?sub_id={sub_id_1}&click_id={click_id}',
  zeppelin:
    process.env.NEXT_PUBLIC_ZEPPELIN_AFFILIATE_URL ?? 'https://zplncheck.com/r/GCRG5VCF',
  discord: process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/ytMWdgCPNF',
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? 'https://t.me/+rXPQXhTaEKZjMjc0',
  stream: process.env.NEXT_PUBLIC_STREAM_URL ?? 'https://rumble.com/c/c-7946190?e9s=src_v1_cbl',
  helpline: 'https://www.joueurs-info-service.fr/',
} as const;

export type CasinoSlug = 'celsius' | 'stake' | 'fieryplay' | 'zeppelin';

/** Un palier de dépôt : « à partir de 10 € → 200 % + 100 tours ». */
export type BonusTier = {
  minDeposit: string;
  bonus: string;
  cap: string;
  spins: string;
  slot: string;
  /** Condition particulière (offre limitée dans le temps, etc.). */
  note?: string;
};

export type BonusStep = { label: string; tiers: BonusTier[] };

export type Casino = {
  slug: CasinoSlug;
  name: string;
  tagline: string;
  url: string;
  accent: string;
  accentSoft: string;
  surface: string;
  highlight: string;
  /** Chemin d'un logo dans /public, ou 'mark' pour le monogramme dessiné. */
  logo: string | 'mark';
  /** Champs optionnels : laissés vides quand l'information n'est pas vérifiée. */
  currencies?: string;
  payout?: string;
  vibe?: string;
  perks: { title: string; detail: string }[];
  strengths: string[];
  watchouts: string[];
  /** Détail du pack de bienvenue, affiché replié sur /casinos. */
  welcomePackage?: { total: string; steps: BonusStep[] };
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
    logo: '/celsius-icon.webp',
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
    logo: 'mark',
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
  {
    slug: 'fieryplay',
    name: 'Fieryplay',
    tagline: 'Le plus gros pack de bienvenue du district',
    url: links.fieryplay,
    accent: '#ed2224',
    accentSoft: 'rgba(237, 34, 36, 0.16)',
    surface: 'linear-gradient(150deg, #2a1211 0%, #140909 100%)',
    highlight: 'Jusqu’à 2 500 € + 525 tours gratuits de bonus de bienvenue*',
    logo: '/fieryplay-logo.svg',
    vibe: 'Pack sur 5 dépôts, dès 10 €',
    perks: [
      {
        title: '200 % jusqu’à 500 € + 100 tours au 1er dépôt*',
        detail: 'Palier le plus haut, réservé à la première heure après inscription.',
      },
      {
        title: 'Pack réparti sur 5 dépôts',
        detail: 'Jusqu’à 2 500 € de bonus et 525 tours gratuits au total.',
      },
      {
        title: 'Dépôt minimum de 10 €',
        detail: 'Les paliers 20 € et 50 € augmentent le bonus et les tours.',
      },
    ],
    strengths: [
      'Le plafond de bonus de bienvenue le plus élevé du site (2 500 €)',
      'Chaque dépôt combine un bonus en pourcentage et des tours gratuits',
      'Accessible dès 10 € de dépôt, sur cinq dépôts',
    ],
    watchouts: [
      'Le palier 200 % n’est valable que la première heure après l’inscription',
      'Bonus plafonné à 500 € par dépôt : les 2 500 € supposent les cinq dépôts',
      'Conditions de mise (wager) non communiquées : à lire sur le site avant de réclamer',
      'Site indisponible dans certains pays : vérifiez l’accès avant de déposer',
      'Opérateur hors licence ANJ : la réglementation française ne s’applique pas',
    ],
    welcomePackage: {
      total: 'Jusqu’à 2 500 € de bonus et 525 tours gratuits au total (5 × 500 € max)',
      steps: [
        {
          label: '1er dépôt',
          tiers: [
            {
              minDeposit: 'dès 10 €',
              bonus: '200 %',
              cap: '500 € max',
              spins: '100 tours',
              slot: 'Crown Coins',
              note: 'Offre limitée : première heure après inscription',
            },
            {
              minDeposit: 'dès 10 €',
              bonus: '150 %',
              cap: '500 € max',
              spins: '50 tours',
              slot: 'Crown Coins',
              note: 'Au-delà de la première heure',
            },
          ],
        },
        {
          label: '2e dépôt',
          tiers: [
            { minDeposit: 'dès 10 €', bonus: '100 %', cap: '500 € max', spins: '100 tours', slot: 'Fortune Bags' },
            { minDeposit: 'dès 20 €', bonus: '125 %', cap: '500 € max', spins: '125 tours', slot: 'Fortune Bags' },
            { minDeposit: 'dès 50 €', bonus: '150 %', cap: '500 € max', spins: '150 tours', slot: 'Fortune Bags' },
          ],
        },
        {
          label: '3e dépôt',
          tiers: [
            { minDeposit: 'dès 10 €', bonus: '125 %', cap: '500 € max', spins: '50 tours', slot: 'Big Bass Splash' },
            { minDeposit: 'dès 20 €', bonus: '150 %', cap: '500 € max', spins: '75 tours', slot: 'Big Bass Splash' },
            { minDeposit: 'dès 50 €', bonus: '175 %', cap: '500 € max', spins: '100 tours', slot: 'Big Bass Splash' },
          ],
        },
        {
          label: '4e dépôt',
          tiers: [
            { minDeposit: 'dès 10 €', bonus: '125 %', cap: '500 € max', spins: '50 tours', slot: 'Blazing Crown Deluxe' },
            { minDeposit: 'dès 20 €', bonus: '150 %', cap: '500 € max', spins: '75 tours', slot: 'Blazing Crown Deluxe' },
            { minDeposit: 'dès 50 €', bonus: '175 %', cap: '500 € max', spins: '100 tours', slot: 'Blazing Crown Deluxe' },
          ],
        },
        {
          label: '5e dépôt',
          tiers: [
            { minDeposit: 'dès 10 €', bonus: '150 %', cap: '500 € max', spins: '25 tours', slot: 'Joker Stoker' },
            { minDeposit: 'dès 20 €', bonus: '175 %', cap: '500 € max', spins: '50 tours', slot: 'Joker Stoker' },
            { minDeposit: 'dès 50 €', bonus: '200 %', cap: '500 € max', spins: '75 tours', slot: 'Joker Stoker' },
          ],
        },
      ],
    },
  },
  {
    slug: 'zeppelin',
    name: 'Zeppelin',
    tagline: '100 tours gratuits sur Gates of Olympus',
    url: links.zeppelin,
    accent: '#f304c2',
    accentSoft: 'rgba(243, 4, 194, 0.16)',
    surface: 'linear-gradient(150deg, #2a1030 0%, #14071a 100%)',
    highlight: '100 tours gratuits sur Gates of Olympus au premier dépôt*',
    logo: '/zeppelin-logo.svg',
    vibe: 'Animations quotidiennes (roue, check-in)',
    perks: [
      {
        title: '100 tours gratuits sur Gates of Olympus*',
        detail: 'Offerts au premier dépôt via le lien Spin District.',
      },
      {
        title: 'Roue de fortune et check-in quotidien',
        detail: 'Des récompenses à récupérer chaque jour, sans dépôt.',
      },
      {
        title: 'Slots, crash et casino live',
        detail: 'Catalogue mixte avec des jeux Originals maison.',
      },
    ],
    strengths: [
      'Offre de bienvenue simple et lisible : 100 tours, une slot connue',
      'Animations récurrentes (roue quotidienne, check-in) sans dépôt',
      'Interface en français, jeux crash et Originals inclus',
    ],
    watchouts: [
      'Offre plus petite qu’un package multi-dépôts',
      'Conditions de mise des tours gratuits à vérifier sur le site',
      'Opérateur hors licence ANJ : la réglementation française ne s’applique pas',
    ],
  },
];

export const casinoBySlug = (slug: CasinoSlug) => casinos.find((casino) => casino.slug === slug)!;
