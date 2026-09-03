import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type Body = { live?: unknown };

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Bascule l'interrupteur du bot Rumble.
 *
 * L'autorité est dans Postgres : `set_bot_live()` refuse tout appel
 * authentifié qui ne figure pas dans `app_admins`. Un membre qui
 * appellerait cette route directement reçoit une erreur de la base, pas du
 * code ci-dessous.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fail('Non authentifié.', 401);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail('Requête illisible.');
  }

  if (typeof body.live !== 'boolean') return fail('État manquant.');

  const { error } = await supabase.rpc('set_bot_live', { p_is_live: body.live });

  if (error) {
    // 42501 = insufficient_privilege, levé par la fonction elle-même.
    if (error.code === '42501') return fail('Action réservée aux administrateurs.', 403);
    // PGRST202 / 42883 : la fonction n'existe pas encore côté base.
    if (error.code === 'PGRST202' || error.code === '42883') {
      return fail('Exécutez supabase/bot-live.sql dans Supabase, puis réessayez.', 501);
    }
    return fail(error.message, 500);
  }

  return NextResponse.json({ live: body.live });
}
