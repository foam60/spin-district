/**
 * Tickets : demandes de cartes cadeaux, réservations de bonus buys et
 * demandes de remboursement de dépôt Celsius.
 *
 * Le contrôle d'accès admin est fait **côté Postgres** (`is_admin()`), jamais
 * sur la base d'un drapeau envoyé par le navigateur.
 */

export type TicketKind = 'giftcard' | 'bonusbuy' | 'celsius_refund';
export type TicketStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export const TICKET_KIND_LABELS: Record<TicketKind, string> = {
  giftcard: 'Carte cadeau USDT',
  bonusbuy: 'Bonus buy en live',
  celsius_refund: 'Remboursement Celsius',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: 'En attente',
  approved: 'Validé',
  rejected: 'Refusé',
  paid: 'Payé',
};

export type TicketPayload = {
  /** giftcard / bonusbuy */
  usdt?: number;
  slot?: string;
  provider?: string;
  slug?: string;
  /** celsius_refund */
  celsius_username?: string;
  email?: string;
  amount?: number;
  deposit_date?: string;
  proof_path?: string;
  note?: string;
};

export type Ticket = {
  id: string;
  kind: TicketKind;
  status: TicketStatus;
  points_cost: number;
  payload: TicketPayload;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  user_email: string | null;
  discord_name: string | null;
  rumble_username: string | null;
  points_balance: number | null;
};

export type Member = {
  user_id: string;
  user_email: string | null;
  discord_name: string | null;
  rumble_username: string | null;
  points_balance: number | null;
  linked_at: string | null;
  created_at: string;
};

/**
 * E-mail de secours de l'administrateur.
 *
 * La source de vérité est la table `app_admins` interrogée par `is_admin()`.
 * Cette constante ne sert qu'au cas où la fonction n'est pas encore installée :
 * elle permet au propriétaire de voir le message d'installation au lieu d'un
 * 404. Elle n'accorde aucun pouvoir : toutes les actions admin sont validées
 * par Postgres.
 */
export const ADMIN_FALLBACK_EMAIL = 'antoine.mousse@gmail.com';

/** Bucket privé des captures de dépôt. */
export const PROOF_BUCKET = 'deposit-proofs';
export const PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PROOF_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

export const SETUP_HINT =
  "Fonction introuvable côté base. Deux causes possibles : les scripts SQL n’ont pas été exécutés (supabase/00-mapping.sql, puis blackjack.sql, puis tickets.sql), ou le cache de schéma PostgREST n’a pas été rechargé — dans ce cas lancez : notify pgrst, 'reload schema';";

export const MAPPING_HINT =
  'Les colonnes de chat_users / account_links n’ont pas été reconnues. Le panneau de diagnostic de /admin indique quel nom ajouter dans supabase/00-mapping.sql.';

/** Messages des exceptions Postgres, traduits pour l'interface. */
const PG_ERRORS: Record<string, { message: string; status: number }> = {
  not_authenticated: { message: 'Session expirée. Reconnectez-vous.', status: 401 },
  not_admin: { message: 'Accès réservé à l’administration.', status: 403 },
  invalid_kind: { message: 'Type de demande invalide.', status: 400 },
  invalid_points: { message: 'Montant invalide.', status: 400 },
  invalid_status: { message: 'Statut invalide.', status: 400 },
  missing_fields: { message: 'Pseudo Celsius et e-mail sont obligatoires.', status: 400 },
  no_points_account: {
    message: 'Aucun portefeuille de points : liez votre pseudo Rumble depuis « Mon compte ».',
    status: 400,
  },
  insufficient_points: { message: 'Solde de points insuffisant.', status: 409 },
  ticket_already_pending: {
    message: 'Vous avez déjà une demande de ce type en attente. Attendez sa réponse.',
    status: 409,
  },
  ticket_not_found: { message: 'Demande introuvable.', status: 404 },
  ticket_already_resolved: { message: 'Cette demande a déjà été traitée.', status: 409 },
  account_links_mapping_unknown: { message: MAPPING_HINT, status: 503 },
  chat_users_mapping_unknown: { message: MAPPING_HINT, status: 503 },
};

export function mapTicketError(error: { message: string; code?: string }): {
  message: string;
  status: number;
} {
  for (const [key, mapped] of Object.entries(PG_ERRORS)) {
    if (error.message.includes(key)) return mapped;
  }
  // Fonction ou table absente du schéma.
  if (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    error.code === '42P01' ||
    /Could not find the function|does not exist/i.test(error.message)
  ) {
    return { message: SETUP_HINT, status: 503 };
  }
  return {
    message: `Erreur côté base de données : ${error.message.slice(0, 200)}`,
    status: 500,
  };
}

const dateTime = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTicketDate(value: string | null): string {
  if (!value) return '—';
  return dateTime.format(new Date(value));
}
