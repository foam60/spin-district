import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/** Déconnexion. En POST uniquement : un GET serait déclenchable par un lien tiers. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const base = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  return NextResponse.redirect(`${base}/compte`, { status: 303 });
}
