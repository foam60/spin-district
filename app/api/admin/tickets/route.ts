import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PROOF_BUCKET, mapTicketError } from '@/app/lib/tickets';

export const dynamic = 'force-dynamic';

type Body = { action?: unknown; ticketId?: unknown; status?: unknown; note?: unknown; path?: unknown };

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Actions d'administration : résolution d'un ticket et génération d'un lien
 * signé vers une preuve de dépôt.
 *
 * Le contrôle admin est fait par Postgres (`is_admin()` dans les fonctions
 * appelées), pas ici : un appel direct à cette route par un membre lambda
 * est rejeté par la base.
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

  const action = typeof body.action === 'string' ? body.action : '';

  // ---------------------------------------------------- Résolution d'un ticket
  if (action === 'resolve') {
    const ticketId = typeof body.ticketId === 'string' ? body.ticketId : '';
    const status = typeof body.status === 'string' ? body.status : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : null;

    if (!ticketId) return fail('Ticket manquant.');
    if (!['approved', 'rejected', 'paid'].includes(status)) return fail('Statut invalide.');

    const { data, error } = await supabase
      .rpc('admin_resolve_ticket', {
        p_ticket_id: ticketId,
        p_status: status,
        p_note: note,
      })
      .maybeSingle();

    if (error || !data) {
      const mapped = error ? mapTicketError(error) : { message: 'Action impossible.', status: 500 };
      return fail(mapped.message, mapped.status);
    }

    return NextResponse.json({ ticketId, status });
  }

  // ------------------------------------------- Lien signé vers une preuve
  if (action === 'proof') {
    const path = typeof body.path === 'string' ? body.path : '';
    if (!path) return fail('Chemin manquant.');

    // `is_admin()` garde la lecture du bucket via la policy storage : un membre
    // qui appellerait cette route pour le fichier d'un autre reçoit une erreur.
    const { data, error } = await supabase.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(path, 300);

    if (error || !data) {
      return fail('Preuve introuvable ou accès refusé.', 404);
    }

    return NextResponse.json({ url: data.signedUrl });
  }

  return fail('Action inconnue.');
}
