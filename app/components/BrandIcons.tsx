/**
 * Icônes et logos partenaires partagés par le header, la home et les pages casinos.
 *
 * Note logo Stake : le wordmark ci-dessous est reconstruit en SVG (police du site,
 * couleurs officielles #1475E1 / #0F212E). Pour utiliser l'asset officiel fourni
 * par le programme d'affiliation, remplacez le contenu de <StakeMark /> par une
 * balise <Image src="/stake-logo.svg" … /> déposée dans /public.
 */

export function ArrowIcon() {
  return (
    <span aria-hidden="true" className="icon-arrow">
      ↗
    </span>
  );
}

export function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="telegram-icon-svg"
      style={{ flexShrink: 0 }}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function DiscordIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

export function RumbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.6 5.2 7 4.1c.6.35.6 1.05 0 1.4l-7 4.1c-.6.35-1.4-.05-1.4-.7V7.9c0-.65.8-1.05 1.4-.7z" />
    </svg>
  );
}

/** Monogramme Stake (tuile arrondie + S géométrique aux couleurs de la marque). */
export function StakeMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="32" height="32" rx="8" fill="#0f212e" />
      <path
        d="M21.5 9.5H13a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7h-8.5"
        stroke="#1475e1"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Logo Stake complet : monogramme + wordmark. */
export function StakeLogo({
  size = 22,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className="stake-logo" role="img" aria-label="Stake">
      <StakeMark size={size} />
      {showWordmark && (
        <span className="stake-wordmark" style={{ fontSize: size * 0.86 }} aria-hidden="true">
          Stake
        </span>
      )}
    </span>
  );
}

/** Logo Celsius (texte, aligné sur le style du wordmark Stake). */
export function CelsiusLogo({ size = 22 }: { size?: number }) {
  return (
    <span className="celsius-logo" role="img" aria-label="Celsius Casino">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="8" fill="#0a140a" />
        <path
          d="M22 11a7 7 0 1 0 0 10"
          stroke="#a8ff00"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="celsius-wordmark-text" style={{ fontSize: size * 0.86 }} aria-hidden="true">
        Celsius
      </span>
    </span>
  );
}
