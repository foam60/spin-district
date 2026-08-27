/**
 * Moteur de blackjack — logique pure, sans effet de bord.
 *
 * ⚠️ Ce module est exécuté **uniquement côté serveur** (route API). Le
 * navigateur ne reçoit jamais le sabot ni la carte cachée du croupier : sinon
 * n'importe qui pourrait lire la suite du paquet, ou décider de ses propres
 * gains. Tout est recalculé à partir de l'état stocké en base.
 *
 * Règles appliquées :
 *  - 6 jeux de 52 cartes, sabot neuf à chaque manche (pas de comptage)
 *  - le croupier tire jusqu'à 17 et reste sur tous les 17 (S17)
 *  - blackjack payé 3:2, gain simple 1:1, égalité remboursée
 *  - double autorisé sur les deux premières cartes uniquement
 *  - pas de split, pas d'assurance, pas d'abandon
 */

export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/** Carte au format compact : stockée telle quelle en JSON. */
export type Card = { r: Rank; s: Suit };

export type Outcome = 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | 'dealer_bust';

export type RoundStatus = 'player' | 'done';

/** État complet d'une manche. Ne quitte jamais le serveur. */
export type RoundState = {
  v: 1;
  shoe: Card[];
  player: Card[];
  dealer: Card[];
  bet: number;
  doubled: boolean;
  status: RoundStatus;
  outcome?: Outcome;
  /** Points à recréditer au joueur (mise incluse). */
  payout?: number;
};

export const DECKS = 6;
/**
 * Bornes de mise. Le plafond suit le taux de la boutique
 * (POINTS_PER_USDT) ; le plancher est volontairement bas pour qu'un petit
 * solde puisse jouer plusieurs manches.
 */
export const MIN_BET = 100;
export const MAX_BET = 25000;
/** Paliers proposés dans l'interface. */
export const BET_STEPS = [100, 250, 500, 1000, 2500, 10000] as const;

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_IS_RED: Record<Suit, boolean> = { S: false, H: true, D: true, C: false };

/**
 * Mélange de Fisher-Yates alimenté par `crypto.getRandomValues`.
 *
 * `Math.random` serait prévisible : sur un jeu qui engage des points
 * convertibles, la source d'aléa doit être cryptographique.
 */
function shuffle(cards: Card[]): Card[] {
  const shuffled = [...cards];
  const randoms = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randoms);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randoms[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createShoe(decks = DECKS): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < decks; d += 1) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        cards.push({ r, s });
      }
    }
  }
  return shuffle(cards);
}

function cardPoints(rank: Rank): number {
  if (rank === 'A') return 11;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return Number(rank);
}

/** Total d'une main, en dégradant les as de 11 à 1 tant que ça dépasse 21. */
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardPoints(card.r);
    if (card.r === 'A') aces += 1;
  }
  let soft = aces > 0;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
    soft = aces > 0;
  }
  return { total, soft };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards).total > 21;
}

/** S17 : le croupier tire sous 17, y compris sur un 17 souple ? Non — il reste. */
export function dealerShouldHit(cards: Card[]): boolean {
  return handValue(cards).total < 17;
}

function draw(state: RoundState): Card {
  const card = state.shoe.pop();
  if (!card) throw new Error('Sabot vide');
  return card;
}

/** Mise totale engagée (doublée le cas échéant). */
export function totalWager(state: RoundState): number {
  return state.doubled ? state.bet * 2 : state.bet;
}

/**
 * Calcule l'issue et le montant à recréditer.
 *
 * La mise a déjà été débitée à l'ouverture de la manche : `payout` inclut donc
 * la mise. Perte = 0, égalité = mise, gain = 2× mise, blackjack = 2,5× mise.
 */
function resolve(state: RoundState): { outcome: Outcome; payout: number } {
  const wager = totalWager(state);
  const player = handValue(state.player).total;
  const dealer = handValue(state.dealer).total;

  if (isBust(state.player)) return { outcome: 'bust', payout: 0 };

  const playerBj = isBlackjack(state.player);
  const dealerBj = isBlackjack(state.dealer);

  if (playerBj && dealerBj) return { outcome: 'push', payout: wager };
  if (playerBj) return { outcome: 'blackjack', payout: Math.floor(wager * 2.5) };
  if (dealerBj) return { outcome: 'lose', payout: 0 };

  if (isBust(state.dealer)) return { outcome: 'dealer_bust', payout: wager * 2 };
  if (player > dealer) return { outcome: 'win', payout: wager * 2 };
  if (player < dealer) return { outcome: 'lose', payout: 0 };
  return { outcome: 'push', payout: wager };
}

function finish(state: RoundState): RoundState {
  const { outcome, payout } = resolve(state);
  return { ...state, status: 'done', outcome, payout };
}

/** Le croupier joue sa main jusqu'au bout, puis on solde. */
function playDealer(state: RoundState): RoundState {
  const next: RoundState = { ...state, shoe: [...state.shoe], dealer: [...state.dealer] };
  while (dealerShouldHit(next.dealer)) {
    next.dealer.push(draw(next));
  }
  return finish(next);
}

/** Ouvre une manche : deux cartes chacun, blackjack immédiat soldé aussitôt. */
export function openRound(bet: number): RoundState {
  const state: RoundState = {
    v: 1,
    shoe: createShoe(),
    player: [],
    dealer: [],
    bet,
    doubled: false,
    status: 'player',
  };

  state.player.push(draw(state));
  state.dealer.push(draw(state));
  state.player.push(draw(state));
  state.dealer.push(draw(state));

  // Un blackjack de part ou d'autre termine la manche immédiatement.
  if (isBlackjack(state.player) || isBlackjack(state.dealer)) {
    return finish(state);
  }
  return state;
}

export type PlayerAction = 'hit' | 'stand' | 'double';

export function canDouble(state: RoundState): boolean {
  return state.status === 'player' && state.player.length === 2 && !state.doubled;
}

/** Applique une action du joueur. Lève si l'action est illégale. */
export function applyAction(state: RoundState, action: PlayerAction): RoundState {
  if (state.status !== 'player') throw new Error('Manche déjà terminée');

  if (action === 'stand') {
    return playDealer(state);
  }

  if (action === 'hit') {
    const next: RoundState = { ...state, shoe: [...state.shoe], player: [...state.player] };
    next.player.push(draw(next));
    if (isBust(next.player)) return finish(next);
    return next;
  }

  if (action === 'double') {
    if (!canDouble(state)) throw new Error('Double impossible à ce stade');
    const next: RoundState = {
      ...state,
      shoe: [...state.shoe],
      player: [...state.player],
      doubled: true,
    };
    next.player.push(draw(next));
    if (isBust(next.player)) return finish(next);
    // Après un double, le joueur ne touche plus à sa main.
    return playDealer(next);
  }

  throw new Error('Action inconnue');
}

/** Vue transmise au navigateur : la carte cachée du croupier est retirée. */
export type PublicRound = {
  roundId: string;
  bet: number;
  doubled: boolean;
  status: RoundStatus;
  outcome: Outcome | null;
  payout: number | null;
  player: Card[];
  playerTotal: number;
  playerSoft: boolean;
  dealer: Card[];
  dealerTotal: number | null;
  hiddenDealerCards: number;
  canDouble: boolean;
  balance: number;
};

export function toPublicRound(
  roundId: string,
  state: RoundState,
  balance: number
): PublicRound {
  const inProgress = state.status === 'player';
  const player = handValue(state.player);
  const visibleDealer = inProgress ? state.dealer.slice(0, 1) : state.dealer;

  return {
    roundId,
    bet: state.bet,
    doubled: state.doubled,
    status: state.status,
    outcome: state.outcome ?? null,
    payout: state.payout ?? null,
    player: state.player,
    playerTotal: player.total,
    playerSoft: player.soft,
    dealer: visibleDealer,
    dealerTotal: inProgress ? null : handValue(state.dealer).total,
    hiddenDealerCards: inProgress ? state.dealer.length - 1 : 0,
    canDouble: canDouble(state),
    balance,
  };
}

/** Valide et normalise une mise reçue du navigateur. */
export function normalizeBet(value: unknown, balance: number): number {
  const bet = Math.floor(Number(value));
  if (!Number.isFinite(bet)) throw new Error('Mise invalide');
  if (bet < MIN_BET) throw new Error(`Mise minimum : ${MIN_BET} points`);
  if (bet > MAX_BET) throw new Error(`Mise maximum : ${MAX_BET} points`);
  if (bet > balance) throw new Error('Solde insuffisant pour cette mise');
  return bet;
}

export const OUTCOME_LABELS: Record<Outcome, string> = {
  blackjack: 'Blackjack !',
  win: 'Gagné',
  dealer_bust: 'Croupier saute',
  push: 'Égalité',
  lose: 'Perdu',
  bust: 'Vous sautez',
};
