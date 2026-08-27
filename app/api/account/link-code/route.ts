import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CODE_TTL_SECONDS, generateCode } from '@/app/lib/verification';

export const dynamic = 'force-dynamic';

/**
 * Émet un code de liaison pour l'utilisateur connecté.
 *
 * Le code est généré ici (pas dans le navigateur) et l'expiration est
 * calculée par Postgres : le client ne contrôle ni l'un ni l'autre.
 */
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Connectez-vous avec Discord.' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('issue_link_code', {
    p_code: generateCode(),
    p_ttl_seconds: CODE_TTL_SECONDS,
  });

  if (error) {
    const alreadyLinked = error.message.includes('deja lie');
    return NextResponse.json(
      {
        error: alreadyLinked
          ? 'Votre compte est déjà lié à un pseudo Rumble.'
          : "Impossible de générer un code pour le moment.",
      },
      { status: alreadyLinked ? 409 : 500 }
    );
  }

  return NextResponse.json({ code: data.code, expiresAt: data.expires_at });
}
