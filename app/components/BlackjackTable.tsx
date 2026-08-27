'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowIcon } from './BrandIcons';
import {
  BET_STEPS,
  MAX_BET,
  MIN_BET,
  OUTCOME_LABELS,
  SUIT_IS_RED,
  SUIT_SYMBOL,
  type Card,
  type PublicRound,
} from '../lib/blackjack';
import { formatPoints } from '../lib/shop';

type ApiResponse = { round?: PublicRound; balance?: number; error?: string };

/** Une carte face visible. */
function PlayingCard({ card, index }: { card: Card; index: number }) {
  return (
    <span
      className={`bj-card ${SUIT_IS_RED[card.s] ? 'is-red' : ''}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <span className="bj-card-rank">{card.r}</span>
      <span className="bj-card-suit" aria-hidden="true">
        {SUIT_SYMBOL[card.s]}
      </span>
      <span className="sr-only">
        {card.r} de {card.s === 'S' ? 'pique' : card.s === 'H' ? 'cœur' : card.s === 'D' ? 'carreau' : 'trèfle'}
      </span>
    </span>
  );
}

/** Carte retournée (carte cachée du croupier). */
function FaceDownCard({ index }: { index: number }) {
  return (
    <span className="bj-card is-hidden" style={{ animationDelay: `${index * 90}ms` }}>
      <span className="sr-only">Carte cachée</span>
    </span>
  );
}

function Hand({
  label,
  cards,
  total,
  soft,
  hidden = 0,
  badge,
}: {
  label: string;
  cards: Card[];
  total: number | null;
  soft?: boolean;
  hidden?: number;
  badge?: string;
}) {
  return (
    <div className="bj-hand">
      <div className="bj-hand-head">
        <span className="bj-hand-label">{label}</span>
        {total !== null && (
          <span className="bj-hand-total">
            {total}
            {soft && total <= 21 ? ' (souple)' : ''}
          </span>
        )}
        {badge && <span className="bj-hand-badge">{badge}</span>}
      </div>
      <div className="bj-cards">
        {cards.map((card, index) => (
          <PlayingCard key={`${card.r}${card.s}${index}`} card={card} index={index} />
        ))}
        {Array.from({ length: hidden }, (_, index) => (
          <FaceDownCard key={`hidden-${index}`} index={cards.length + index} />
        ))}
        {cards.length === 0 && hidden === 0 && <span className="bj-card is-empty" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default function BlackjackTable({
  initialBalance,
  canPlay,
  isAuthenticated,
}: {
  initialBalance: number;
  canPlay: boolean;
  isAuthenticated: boolean;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(() => Math.max(MIN_BET, Math.min(BET_STEPS[1], initialBalance)));
  const [round, setRound] = useState<PublicRound | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState({ hands: 0, net: 0 });

  const call = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    setPending(action);
    setError(null);
    try {
      const response = await fetch('/api/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        setError(data.error ?? 'Erreur inattendue.');
        return null;
      }
      if (typeof data.balance === 'number') setBalance(data.balance);
      if (data.round) {
        setRound(data.round);
        setBalance(data.round.balance);
      } else if (data.round === null) {
        setRound(null);
      }
      return data;
    } catch {
      setError('Connexion impossible. Réessayez.');
      return null;
    } finally {
      setPending(null);
    }
  }, []);

  // Reprise d'une manche laissée en cours (rechargement, changement d'onglet).
  // La requête est faite ici plutôt que via `call` pour qu'aucun setState ne
  // soit déclenché de façon synchrone dans le corps de l'effet.
  useEffect(() => {
    if (!canPlay) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/blackjack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'state' }),
        });
        const data = (await response.json()) as ApiResponse;
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? 'Erreur inattendue.');
          return;
        }
        if (data.round) {
          setRound(data.round);
          setBalance(data.round.balance);
        } else if (typeof data.balance === 'number') {
          setBalance(data.balance);
        }
      } catch {
        if (!cancelled) setError('Connexion impossible. Réessayez.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canPlay]);

  const finished = round?.status === 'done';

  async function play(action: 'hit' | 'stand' | 'double') {
    const before = round;
    const result = await call(action);
    // Comptabilité de session : mise engagée vs points recrédités.
    if (result?.round?.status === 'done' && before) {
      const wagered = action === 'double' ? before.bet * 2 : before.bet;
      setSession((previous) => ({
        hands: previous.hands + 1,
        net: previous.net + ((result.round?.payout ?? 0) - wagered),
      }));
    }
  }

  async function deal() {
    const result = await call('deal', { bet });
    if (result?.round?.status === 'done') {
      setSession((previous) => ({
        hands: previous.hands + 1,
        net: previous.net + ((result.round?.payout ?? 0) - bet),
      }));
    }
  }

  if (!canPlay) {
    return (
      <div className="bj-locked">
        <p>
          {isAuthenticated
            ? 'Liez votre pseudo Rumble depuis « Mon compte » : c’est ce lien qui rattache vos points à votre compte.'
            : 'Connectez-vous avec Discord et liez votre pseudo Rumble pour jouer avec vos points.'}
        </p>
        <Link className="button button-primary" href="/compte">
          {isAuthenticated ? 'Lier mon pseudo Rumble' : 'Me connecter'} <ArrowIcon />
        </Link>
      </div>
    );
  }

  const inHand = round?.status === 'player';
  const busy = pending !== null;
  const maxBet = Math.min(MAX_BET, balance);

  return (
    <div className="bj-table">
      <div className="bj-topbar">
        <div className="bj-balance">
          <span>Solde</span>
          <strong>{formatPoints(balance)}</strong>
        </div>
        <div className="bj-session">
          <span>Session</span>
          <strong className={session.net > 0 ? 'is-up' : session.net < 0 ? 'is-down' : ''}>
            {session.net > 0 ? '+' : ''}
            {formatPoints(session.net)}
          </strong>
          <small>
            {session.hands} manche{session.hands > 1 ? 's' : ''}
          </small>
        </div>
      </div>

      <div className="bj-felt">
        <Hand
          label="Croupier"
          cards={round?.dealer ?? []}
          total={round?.dealerTotal ?? null}
          hidden={round?.hiddenDealerCards ?? 0}
        />

        {round && (
          <div className={`bj-result ${finished ? `is-${round.outcome}` : 'is-playing'}`}>
            {finished ? (
              <>
                <strong>{OUTCOME_LABELS[round.outcome ?? 'lose']}</strong>
                <span>
                  {round.payout && round.payout > 0
                    ? `+${formatPoints(round.payout)} points recrédités`
                    : `−${formatPoints(round.doubled ? round.bet * 2 : round.bet)} points`}
                </span>
              </>
            ) : (
              <>
                <strong>À vous de jouer</strong>
                <span>
                  Mise engagée : {formatPoints(round.doubled ? round.bet * 2 : round.bet)} points
                </span>
              </>
            )}
          </div>
        )}

        <Hand
          label="Votre main"
          cards={round?.player ?? []}
          total={round ? round.playerTotal : null}
          soft={round?.playerSoft}
          badge={round?.doubled ? 'Doublé' : undefined}
        />
      </div>

      {error && (
        <p className="account-notice is-error" role="alert">
          {error}
        </p>
      )}

      {inHand ? (
        <div className="bj-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => play('hit')}
            disabled={busy}
          >
            {pending === 'hit' ? '…' : 'Tirer'}
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => play('stand')}
            disabled={busy}
          >
            {pending === 'stand' ? '…' : 'Rester'}
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => play('double')}
            disabled={busy || !round?.canDouble || balance < (round?.bet ?? 0)}
            title={
              round?.canDouble
                ? 'Doubler la mise et recevoir une seule carte'
                : 'Le double n’est possible que sur les deux premières cartes'
            }
          >
            {pending === 'double' ? '…' : 'Doubler'}
          </button>
        </div>
      ) : (
        <div className="bj-betting">
          <div className="bj-bet-row">
            <span className="bj-bet-label">Mise</span>
            <div className="bj-chips">
              {BET_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={`bj-chip ${bet === step ? 'is-active' : ''}`}
                  onClick={() => setBet(step)}
                  disabled={busy || step > maxBet}
                >
                  {formatPoints(step)}
                </button>
              ))}
              <button
                type="button"
                className="bj-chip is-max"
                onClick={() => setBet(Math.max(MIN_BET, maxBet))}
                disabled={busy || maxBet < MIN_BET}
              >
                Max
              </button>
            </div>
          </div>

          <label className="bj-bet-input">
            <span className="sr-only">Mise personnalisée en points</span>
            <input
              type="number"
              min={MIN_BET}
              max={maxBet}
              step={10}
              value={bet}
              onChange={(event) => setBet(Math.floor(Number(event.target.value) || 0))}
              disabled={busy}
            />
            <span>points</span>
          </label>

          <button
            type="button"
            className="button button-primary bj-deal"
            onClick={deal}
            disabled={busy || bet < MIN_BET || bet > maxBet}
          >
            {pending === 'deal' ? 'Distribution…' : finished ? 'Rejouer' : 'Distribuer'}{' '}
            <ArrowIcon />
          </button>

          <p className="bj-bet-hint">
            Mise entre {formatPoints(MIN_BET)} et {formatPoints(MAX_BET)} points. La mise est
            débitée à la distribution, les gains recrédités au règlement.
          </p>
        </div>
      )}
    </div>
  );
}
