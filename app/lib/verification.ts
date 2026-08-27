/**
 * Génération des codes de liaison compte site <-> chat Rumble.
 *
 * IMPORTANT : ce format doit rester identique à celui attendu par le bot
 * (rumble-bot/verification.py). Toute divergence casse `!verify`.
 */

/** Sans 0/O ni 1/I : le code est relu à l'écran puis retapé à la main. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const CODE_PREFIX = 'SD';

/** Durée de validité d'un code, en secondes. */
export const CODE_TTL_SECONDS = Number(process.env.VERIFY_CODE_TTL ?? 600);

/**
 * Génère un code imprévisible du type `SD-4F2K9M`.
 *
 * `crypto.getRandomValues` et non `Math.random` : un code devinable
 * permettrait de revendiquer le compte d'un autre.
 *
 * L'alphabet fait 32 caractères et 256 est un multiple de 32, donc le modulo
 * ne introduit aucun biais.
 */
export function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);

  let body = '';
  for (const byte of bytes) {
    body += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return `${CODE_PREFIX}-${body}`;
}

/** Secondes restantes avant expiration (0 si déjà expiré). */
export function secondsUntil(expiresAt: string): number {
  const remaining = (new Date(expiresAt).getTime() - Date.now()) / 1000;
  return remaining > 0 ? Math.floor(remaining) : 0;
}

/** Formate une durée courte en français : « 9 min 42 s ». */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'expiré';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  return `${minutes} min ${String(rest).padStart(2, '0')} s`;
}
