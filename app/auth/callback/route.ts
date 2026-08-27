import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/** Retour d'OAuth Discord : échange le code contre une session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error');

  // Derrière un proxy (Cloudflare/Vercel), `origin` peut pointer sur l'hôte
  // interne : on se fie à l'en-tête transmis quand il existe.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const base = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  if (oauthError) {
    return NextResponse.redirect(`${base}/compte?error=oauth`);
  }

  if (!code) {
    return NextResponse.redirect(`${base}/compte?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${base}/compte?error=exchange`);
  }

  return NextResponse.redirect(`${base}/compte`);
}
