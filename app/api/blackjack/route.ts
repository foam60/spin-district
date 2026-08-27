import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  applyAction,
  normalizeBet,
  openRound,
  toPublicRound,
  type PlayerAction,
  type RoundState,
} from '@/app/lib/blackjack';

export const dynamic = 'force-dynamic';

type Body = { action?: unknown; bet?: unknown };

const MAPPING_HINT =
  'Les colonnes de chat_users / account_links n’ont pas été reconnues. Ouvrez /admin : le panneau de diagnostic indique quel nom ajouter dans supabase/00-mapping.sql.';

/** Messages renvoyés par les fonctions Postgres, traduits pour l'interface. */
const PG_ERRORS: Record<string, string> = {
  not_authenticated: 'Session expirée. Reconnectez-vous.',
  invalid_bet: 'Mise invalide.',
  invalid_payout: 'Gain invalide.',
  no_points_account:
    'Aucun portefeuille de points trouvé : liez votre pseudo Rumble depuis « Mon compte ».',
  round_in_progress: 'Une manche est déjà en cours.',
  insufficient_points: 'Solde insuffisant pour cette mise.',
  round_not_open: 'Cette manche n’est plus ouverte.',
  round_already_settled: 'Cette manche est déjà soldée.',
  // Correspondance de schéma non résolue par supabase/00-mapping.sql.
  account_links_mapping_unknown: MAPPING_HINT,
  chat_users_mapping_unknown: MAPPING_HINT,
};

const SETUP_HINT =
  'Le blackjack n’est pas encore installé côté base de données. Exécutez supabase/00-mapping.sql, puis blackjack.sql, puis tickets.sql.';

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Traduit une erreur Supabase/Postgres en message utilisateur. */
function mapDbError(error: { message: string; code?: string }): { message: string; status: number } {
  for (const [key, message] of Object.entries(PG_ERRORS)) {
    if (error.message.includes(key)) {
      const status = key === 'not_authenticated' ? 401 : key === 'insufficient_points' ? 409 : 400;
      return { message, status };
    }
  }
  // Fonction absente : soit PostgREST ne la trouve pas (PGRST202), soit une
  // fonction appelée en interne manque (42883, ex. sd_adjust_points quand
  // 00-mapping.sql n'a pas été exécuté).
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

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    // Sans ce filet, une exception non prévue remonte en 500 HTML illisible
    // côté client (et dans les logs Vercel).
    return NextResponse.json(
      {
        error: `Erreur serveur : ${error instanceof Error ? error.message.slice(0, 200) : 'inconnue'}`,
      },
      { status: 500 }
    );
  }
}

async function handle(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail('Connectez-vous avec Discord pour jouer.', 401);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail('Requête illisible.');
  }

  const action = String(body.action ?? '');

  // Solde courant : sert de garde-fou avant chaque mise et d'affichage.
  const { data: pointsRow } = await supabase.from('chat_users').select('points').maybeSingle();
  const balance = pointsRow?.points ?? 0;
  let balanceAfterRecovery = balance;

  // Manche éventuellement en cours (RLS limite déjà à l'utilisateur courant).
  const { data: openRow, error: openError } = await supabase
    .from('blackjack_rounds')
    .select('id, state')
    .is('settled_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openError) {
    // Table absente : on le dit clairement plutôt que de renvoyer une 500 muette.
    if (openError.code === '42P01' || /blackjack_rounds/i.test(openError.message)) {
      return fail(SETUP_HINT, 503);
    }
    return fail('Impossible de lire la manche en cours.', 500);
  }

  const current = openRow ? { id: openRow.id as string, state: openRow.state as RoundState } : null;

  // --- Reprise d'état (chargement de la page, retour d'onglet) -------------
  if (action === 'state') {
    return NextResponse.json({
      round: current ? toPublicRound(current.id, current.state, balance) : null,
      balance,
    });
  }

  // --- Nouvelle manche ----------------------------------------------------
  if (action === 'deal') {
    if (current && current.state.status === 'player') {
      // On ne redistribue pas par-dessus une manche ouverte : on la renvoie.
      return NextResponse.json({ round: toPublicRound(current.id, current.state, balance) });
    }

    // Manche terminée mais restée non soldée (règlement interrompu) : on la
    // solde d'abord, sinon `blackjack_open_round` refuserait indéfiniment de
    // distribuer et le joueur serait bloqué.
    if (current && current.state.status === 'done') {
      const recovered = await settle(supabase, current.id, current.state);
      if ('error' in recovered) return fail(recovered.error, recovered.status);
      balanceAfterRecovery = recovered.balance;
    }

    let bet: number;
    try {
      bet = normalizeBet(body.bet, balanceAfterRecovery);
    } catch (error) {
      return fail(error instanceof Error ? error.message : 'Mise invalide.');
    }

    const state = openRound(bet);

    const { data: opened, error: dealError } = await supabase
      .rpc('blackjack_open_round', { p_bet: bet, p_state: state })
      .maybeSingle();

    if (dealError || !opened) {
      const mapped = dealError
        ? mapDbError(dealError)
        : { message: 'Distribution impossible.', status: 500 };
      return fail(mapped.message, mapped.status);
    }

    const roundId = (opened as { round_id: string }).round_id;
    let newBalance = (opened as { balance: number }).balance;

    // Blackjack immédiat : la manche est déjà terminée, on solde tout de suite.
    if (state.status === 'done') {
      const settled = await settle(supabase, roundId, state);
      if ('error' in settled) return fail(settled.error, settled.status);
      newBalance = settled.balance;
    }

    return NextResponse.json({ round: toPublicRound(roundId, state, newBalance) });
  }

  // --- Actions de jeu -----------------------------------------------------
  if (action === 'hit' || action === 'stand' || action === 'double') {
    if (!current || current.state.status !== 'player') {
      return fail('Aucune manche en cours. Distribuez pour commencer.', 409);
    }

    let next: RoundState;
    try {
      next = applyAction(current.state, action as PlayerAction);
    } catch (error) {
      return fail(error instanceof Error ? error.message : 'Action impossible.');
    }

    // Un double engage une seconde fois la mise. Elle est débitée dans la même
    // transaction que le règlement (voir blackjack_settle_round).
    const extraDebit = action === 'double' ? current.state.bet : 0;
    if (extraDebit > balance) {
      return fail('Solde insuffisant pour doubler.', 409);
    }

    if (next.status === 'done') {
      const settled = await settle(supabase, current.id, next, extraDebit);
      if ('error' in settled) return fail(settled.error, settled.status);
      return NextResponse.json({ round: toPublicRound(current.id, next, settled.balance) });
    }

    const { error: updateError } = await supabase.rpc('blackjack_update_round', {
      p_round_id: current.id,
      p_state: next,
    });
    if (updateError) {
      const mapped = mapDbError(updateError);
      return fail(mapped.message, mapped.status);
    }

    return NextResponse.json({ round: toPublicRound(current.id, next, balance) });
  }

  return fail('Action inconnue.');
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Solde la manche et renvoie le nouveau solde de points. */
async function settle(
  supabase: SupabaseServerClient,
  roundId: string,
  state: RoundState,
  extraDebit = 0
): Promise<{ balance: number } | { error: string; status: number }> {
  const { data, error } = await supabase
    .rpc('blackjack_settle_round', {
      p_round_id: roundId,
      p_state: state,
      p_payout: state.payout ?? 0,
      p_outcome: state.outcome ?? null,
      p_extra_debit: extraDebit,
    })
    .maybeSingle();

  if (error || !data) {
    const mapped = error ? mapDbError(error) : { message: 'Règlement impossible.', status: 500 };
    return { error: mapped.message, status: mapped.status };
  }
  return { balance: (data as { balance: number }).balance };
}
