import Image from 'next/image';
import type { CSSProperties } from 'react';
import { casinos, type Casino } from '../lib/site';
import { ArrowIcon, StakeMark } from './BrandIcons';

function CasinoLogo({ casino }: { casino: Casino }) {
  if (casino.logo === 'mark') return <StakeMark size={44} />;
  // Un logo portant le nom écrit s’affiche à hauteur fixe plutôt que dans un
  // carré, sinon il est écrasé. `logoWidth` donne son ratio réel, qui va de
  // 2:1 à près de 6:1 selon la marque.
  const isWordmark = casino.logoKind === 'wordmark';
  return (
    <Image
      src={casino.logo}
      alt=""
      width={isWordmark ? (casino.logoWidth ?? 132) : 44}
      height={44}
      className={isWordmark ? 'casino-wordmark' : undefined}
      style={isWordmark ? undefined : { borderRadius: 10 }}
    />
  );
}

export function CasinoCard({
  casino,
  detailed = false,
  compact = false,
}: {
  casino: Casino;
  detailed?: boolean;
  /** Accueil : version resserrée, le détail vit sur /casinos. */
  compact?: boolean;
}) {
  const perks = compact ? casino.perks.slice(0, 2) : casino.perks;
  const style = {
    '--casino-accent': casino.accent,
    '--casino-accent-soft': casino.accentSoft,
    '--casino-surface': casino.surface,
  } as CSSProperties;

  return (
    <article className={`casino-card casino-${casino.slug}`} style={style}>
      <div className="casino-card-head">
        <div className="casino-identity">
          <CasinoLogo casino={casino} />
          <div>
            <h3 className={casino.logoKind === 'wordmark' ? 'sr-only' : undefined}>{casino.name}</h3>
            <small>{casino.tagline}</small>
          </div>
        </div>
        <span className="casino-live-tag">
          <i className="status-dot" /> EN LIGNE
        </span>
      </div>

      <p className="casino-highlight">{casino.highlight}</p>

      {!compact && (casino.currencies || casino.payout || casino.vibe) && (
        <dl className="casino-facts">
          {casino.currencies && (
            <div>
              <dt>Paiements</dt>
              <dd>{casino.currencies}</dd>
            </div>
          )}
          {casino.payout && (
            <div>
              <dt>Retraits</dt>
              <dd>{casino.payout}</dd>
            </div>
          )}
          {casino.vibe && (
            <div>
              <dt>Le + du casino</dt>
              <dd>{casino.vibe}</dd>
            </div>
          )}
        </dl>
      )}

      <ul className="casino-perks">
        {perks.map((perk, index) => (
          <li key={perk.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{perk.title}</strong>
              {!compact && <small>{perk.detail}</small>}
            </div>
          </li>
        ))}
      </ul>

      {detailed && (
        <div className="casino-pros-cons">
          <div>
            <h4>Points forts</h4>
            <ul className="pros">
              {casino.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>À garder en tête</h4>
            <ul className="cons">
              {casino.watchouts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <a
        className="casino-cta"
        href={casino.url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        title={`Ouvrir ${casino.name} via le lien partenaire Spin District`}
      >
        <span>Accéder à {casino.name}</span> <ArrowIcon />
      </a>
      <p className="casino-disclaimer">
        Lien partenaire • 18+ • Offre soumise aux conditions de l’opérateur
      </p>
    </article>
  );
}

export default function CasinoCards({
  detailed = false,
  compact = false,
}: {
  detailed?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="casino-grid">
      {casinos.map((casino) => (
        <CasinoCard key={casino.slug} casino={casino} detailed={detailed} compact={compact} />
      ))}
    </div>
  );
}
