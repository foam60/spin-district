/**
 * Catalogue de la boutique de points et sources de gain.
 *
 * ⚠️ Trois valeurs sont à valider côté production :
 *  1. POINTS_PER_USDT — le taux de change points → carte cadeau.
 *  2. BONUS_BUY_RATE — la remise appliquée aux bonus buys (gain aléatoire).
 *  3. EARN_METHODS — doit décrire exactement ce que le bot Rumble attribue
 *     réellement. Toute ligne qui ne correspond pas au bot est une promesse
 *     non tenue affichée aux membres.
 */

/** Nombre de points nécessaires pour 1 USDT de carte cadeau. */
export const POINTS_PER_USDT = 5000;

/**
 * Coefficient appliqué au coût des bonus buys.
 *
 * Un bonus buy rapporte un gain **aléatoire** (parfois inférieur au montant
 * acheté), là où une carte cadeau a une valeur garantie : il serait incohérent
 * de facturer les deux au même prix. 0.8 = 20 % moins cher par dollar.
 */
export const BONUS_BUY_RATE = 0.8;

export type GiftCard = {
  usdt: number;
  points: number;
  /** Mise en avant visuelle (palier conseillé). */
  featured?: boolean;
};

export const GIFT_CARDS: GiftCard[] = [5, 10, 20, 50, 100].map((usdt) => ({
  usdt,
  points: usdt * POINTS_PER_USDT,
  featured: usdt === 20,
}));

export type BonusBuy = {
  slug: string;
  slot: string;
  provider: string;
  /** Montant du bonus buy acheté en live, en dollars. */
  usdt: number;
  /** Coût en points, dérivé de POINTS_PER_USDT et BONUS_BUY_RATE. */
  points: number;
  featured?: boolean;
};

/**
 * Bonus buys achetables en live.
 *
 * ⚠️ À maintenir en accord avec ce qui est réellement disponible sur le casino
 * utilisé pendant le stream : un titre absent du catalogue de l'opérateur ne
 * peut pas être acheté, et la promesse tombe.
 */
const BONUS_BUY_CATALOG: Omit<BonusBuy, 'points'>[] = [
  { slug: 'sweet-bonanza-20', slot: 'Sweet Bonanza', provider: 'Pragmatic Play', usdt: 20, featured: true },
  { slug: 'fruit-party-20', slot: 'Fruit Party', provider: 'Pragmatic Play', usdt: 20 },
  { slug: 'gates-of-olympus-20', slot: 'Gates of Olympus', provider: 'Pragmatic Play', usdt: 20 },
  { slug: 'sugar-rush-20', slot: 'Sugar Rush', provider: 'Pragmatic Play', usdt: 20 },
  { slug: 'le-bandit-20', slot: 'Le Bandit', provider: 'Hacksaw Gaming', usdt: 20 },
  { slug: 'wanted-dead-or-a-wild-25', slot: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', usdt: 25 },
  { slug: 'san-quentin-50', slot: 'San Quentin xWays', provider: 'Nolimit City', usdt: 50 },
  { slug: 'sweet-bonanza-100', slot: 'Sweet Bonanza', provider: 'Pragmatic Play', usdt: 100 },
];

export const BONUS_BUYS: BonusBuy[] = BONUS_BUY_CATALOG.map((item) => ({
  ...item,
  points: Math.round(item.usdt * POINTS_PER_USDT * BONUS_BUY_RATE),
}));

export type EarnMethod = {
  tag: string;
  title: string;
  text: string;
  /** Cadence indicative affichée à droite de la ligne. */
  rhythm: string;
};

export const EARN_METHODS: EarnMethod[] = [
  {
    tag: 'Chat',
    title: 'Être actif dans le chat pendant les lives',
    text: 'Le bot attribue des points automatiquement aux membres qui participent au chat pendant le stream. Plus la session est suivie, plus le total grimpe.',
    rhythm: 'En continu pendant le live',
  },
  {
    tag: '!bonus',
    title: 'Réclamer le bonus horaire',
    text: 'Tapez la commande !bonus dans le chat pour encaisser un paquet de points. Réclamable une fois par heure, uniquement pendant que le bot est actif.',
    rhythm: '1× par heure',
  },
  {
    tag: 'Raffle',
    title: 'Participer aux raffles et tirages du live',
    text: 'Des lots de points sont mis en jeu pendant le stream : il suffit d’être présent dans le chat au moment du tirage pour y entrer.',
    rhythm: 'Plusieurs fois par live',
  },
  {
    tag: 'Challenges',
    title: 'Jouer les wager challenges et concours',
    text: 'Les défis communautaires et les concours annoncés sur Telegram et Discord distribuent des points aux participants et aux gagnants.',
    rhythm: 'Selon le calendrier',
  },
  {
    tag: 'Events',
    title: 'Les événements spéciaux',
    text: 'Giveaways, anniversaires de la chaîne, gros bonus hunts : les points mis en jeu sont annoncés au moment de l’événement.',
    rhythm: 'Ponctuel',
  },
];

/** Formate un nombre de points en français : 20 000. */
export function formatPoints(points: number): string {
  return points.toLocaleString('fr-FR');
}

/** Formate une valeur en USDT à la française : 12,48. */
export function formatUsdt(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
