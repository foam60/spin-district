import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Client Supabase côté serveur (Server Components, Route Handlers).
 *
 * Utilise la clé publishable : toutes les requêtes passent donc par RLS, avec
 * la session de l'utilisateur connecté. Aucune clé secrète n'est employée ici.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Appelé depuis un Server Component : le middleware se charge de
          // rafraîchir la session, on peut ignorer.
        }
      },
    },
  });
}
