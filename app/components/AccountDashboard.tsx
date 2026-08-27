import Link from 'next/link';
import { LinkCodePanel, SignOutButton } from './AccountPanel';
import { ArrowIcon, DiscordIcon, RumbleIcon } from './BrandIcons';
import { links } from '../lib/site';

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
                <strong>{(points?.points ?? 0).toLocaleString('fr-FR')}</strong>
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
            </article>
          </>
        ) : (
          <>
            <LinkCodePanel initialCode={activeCode} />

            <article className="account-card">
              <header className="account-card-head">
                <span className="account-step-tag">Aide</span>
                <h2>Comment ça marche</h2>
              </header>
              <ol className="account-howto">
                <li>Générez votre code ci-contre.</li>
                <li>
                  Ouvrez le{' '}
                  <a href={links.stream} target="_blank" rel="noopener noreferrer">
                    live Rumble ↗
                  </a>{' '}
                  et connectez-vous avec le pseudo à lier.
                </li>
                <li>
                  Collez la commande <code>!verify …</code> dans le chat.
                </li>
                <li>Rechargez cette page : votre solde apparaît.</li>
              </ol>
              <p className="account-card-text">
                Le code n’est valable que quelques minutes et ne fonctionne qu’une fois — c’est ce
                qui empêche quelqu’un d’autre de revendiquer votre pseudo.
              </p>
            </article>
          </>
        )}
      </section>

      <section className="page-section" aria-labelledby="shop-title">
        <article className="account-card is-soon">
          <header className="account-card-head">
            <span className="account-step-tag">Prochainement</span>
            <h2 id="shop-title">
              <span className="soon-lock" aria-hidden="true">
                🔒
              </span>{' '}
              Boutique virtuelle
            </h2>
          </header>
          <p className="account-card-text">
            Vos points serviront à débloquer des avantages communautaires : rôles Discord, choix de
            slots en live, participation aux tirages. Rien d’achetable avec de l’argent réel, rien de
            convertible : uniquement du virtuel.
          </p>
          <div className="account-soon-links">
            <Link className="button button-ghost" href="/#bonus-hunt">
              Ouvrir le Hunt Lab <ArrowIcon />
            </Link>
            <Link className="button button-ghost" href="/jeu-responsable">
              Jeu responsable &amp; 18+ <ArrowIcon />
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
