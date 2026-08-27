/**
 * Catalogue de la boutique de points et sources de gain.
 *
 * ⚠️ Deux valeurs sont à valider côté production :
 *  1. POINTS_PER_USDT — le taux de change points → carte cadeau.
 *  2. EARN_METHODS — doit décrire exactement ce que le bot Rumble attribue
 *     réellement. Toute ligne qui ne correspond pas au bot est une promesse
 *     non tenue affichée aux membres.
 */

/** Nombre de points nécessaires pour 1 USDT de carte cadeau. */
export const POINTS_PER_USDT = 1000;

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
