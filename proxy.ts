import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf les fichiers statiques et les images : inutile de
     * rafraîchir la session pour servir un favicon.
     */
    '/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webmanifest|txt|xml)$).*)',
  ],
};
