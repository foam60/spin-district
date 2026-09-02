import Link from 'next/link';
import { LinkCodePanel, SignOutButton } from './AccountPanel';
import { ArrowIcon, DiscordIcon, RumbleIcon } from './BrandIcons';
import { links } from '../lib/site';
import { POINTS_PER_USDT, formatPoints, formatUsdt } from '../lib/shop';

export type AccountLink = { rumble_username: string; linked_at: string | null } | null;
export type AccountPoints = { points: number | null; updated_at: string | null } | null;
export type AccountCode = { code: string; expiresAt: string } | null;

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const STEPS = ['Connexion Discord', 'Liaison Rumble', 'Points & boutique'] as const;

/** Fil de progression du parcours d'activation du compte. */
export function Stepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="account-stepper" aria-label="Progression de l’activation du compte">
      {STEPS.map((label, index) => {
        const state = index < current ? 'is-done' : index === current ? 'is-current' : 'is-todo';
        return (
          <li key={label} className={state} aria-current={index === current ? 'step' : undefined}>
            <span className="step-bullet" aria-hidden="true">
              {index < current ? '✓' : index + 1}
            </span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?';
  return (
    <span className="account-avatar" data-initial={initial} aria-hidden="true">
      {url && (
        /* eslint-disable-next-line @next/next/no-img-element -- avatar Discord distant, servi par leur CDN */
        <img src={url} alt="" width={64} height={64} referrerPolicy="no-referrer" />
      )}
    </span>
  );
}

/** Vue connectée de l'espace membre. */
export default function AccountDashboard({
  pseudo,
  avatarUrl,
  link,
  points,
  activeCode,
}: {
  pseudo: string;
  avatarUrl: string | null;
  link: AccountLink;
  points: AccountPoints;
  activeCode: AccountCode;
}) {
  const balance = points?.points ?? 0;

  return (
    <>
      <section className="account-identity-bar" aria-label="Session en cours">
        <Avatar url={avatarUrl} name={pseudo} />
        <div className="account-identity-copy">
          <span className="account-provider-badge">
            <DiscordIcon size={12} /> Connecté via Discord
          </span>
          <strong>{pseudo}</strong>
          {link ? (
            <small>
              <RumbleIcon size={12} /> Pseudo Rumble lié : <b>{link.rumble_username}</b>
              {link.linked_at && <> · depuis le {dateFormat.format(new Date(link.linked_at))}</>}
            </small>
          ) : (
            <small className="is-pending">Aucun pseudo Rumble lié pour l’instant</small>
          )}
        </div>
        <SignOutButton />
      </section>

      <Stepper current={link ? 2 : 1} />

      <section className="page-section account-grid" aria-label="Mon compte">
        {link ? (
          <>
            <article className="account-card is-points">
              <header className="account-card-head">
                <span className="account-step-tag">Solde</span>
                <h2>Mes points</h2>
              </header>
              <p className="points-value">
                <strong>{formatPoints(balance)}</strong>
                <span>points</span>
              </p>
              {points?.updated_at && (
                <p className="points-updated">
                  Dernière activité : {dateTimeFormat.format(new Date(points.updated_at))}
                </p>
              )}
              <a
                className="button button-primary account-action"
                href={links.stream}
                target="_blank"
                rel="noopener noreferrer"
              >
                <RumbleIcon size={15} /> Rejoindre le live <ArrowIcon />
              </a>
            </article>

            <article className="account-card">
              <header className="account-card-head">
                <span className="account-step-tag">Comment gagner</span>
                <h2>Commandes du chat</h2>
              </header>
              <p className="account-card-text">
                Les points tombent automatiquement quand vous participez au chat pendant les lives.
                Le reste se joue avec trois commandes :
              </p>
              <ul className="command-list">
                <li>
                  <code>!bonus</code>
                  <span>Bonus à réclamer une fois par heure</span>
                </li>
                <li>
                  <code>!points</code>
                  <span>Affiche votre solde dans le chat</span>
                </li>
                <li>
                  <code>!help</code>
                  <span>Rappelle la liste des commandes</span>
                </li>
              </ul>
              <Link className="account-inline-link" href="/boutique">
                Voir toutes les façons de gagner des points <ArrowIcon />
              </Link>
            </article>
          </>
        ) : (
          <>
            <LinkCodePanel initialCode={activeCode} />

            <article className="account-card">
              <header className="account-card-head">
                <span className="account-step-tag">Pourquoi lier</span>
                <h2>Ce que ça débloque</h2>
              </header>
              <p className="account-card-text">
                Sans ce lien, le bot ne sait pas que le pseudo du chat, c’est vous : vos points
                existent mais ne sont rattachés à aucun compte.
              </p>
              <ul className="account-hint-list is-checks">
                <li>Voir votre solde de points ici</li>
                <li>L’échanger contre des cartes cadeaux USDT</li>
                <li>Jouer vos points au blackjack</li>
              </ul>
            </article>
          </>
        )}
      </section>

      {link && (
      <section className="page-section" aria-labelledby="shop-title">
        <article className="account-card is-shop">
          <header className="account-card-head">
            <span className="account-step-tag">Boutique</span>
            <h2 id="shop-title">Échangez vos points</h2>
          </header>
          <p className="account-card-text">
            Vos points s’échangent contre des <strong>cartes cadeaux USDT</strong> de 5 à 100.
            {link && balance > 0 ? (
              <>
                {' '}
                Votre solde actuel vaut environ{' '}
                <strong>{formatUsdt(balance / POINTS_PER_USDT)} USDT</strong>.
              </>
            ) : (
              <> Comptez {formatPoints(POINTS_PER_USDT)} points pour 1 USDT.</>
            )}
          </p>
          <div className="account-soon-links">
            <Link className="button button-primary" href="/boutique">
              Ouvrir la boutique <ArrowIcon />
            </Link>
            <Link className="button button-ghost" href="/bonus-hunt">
              Ouvrir le Hunt Lab <ArrowIcon />
            </Link>
            <Link className="button button-ghost" href="/remboursement-celsius">
              Remboursement Celsius <ArrowIcon />
            </Link>
            <Link className="button button-ghost" href="/jeu-responsable">
              Jeu responsable &amp; 18+ <ArrowIcon />
            </Link>
          </div>
        </article>
      </section>
      )}
    </>
  );
}
