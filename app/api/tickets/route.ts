import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BONUS_BUYS, GIFT_CARDS } from '@/app/lib/shop';
import { PROOF_BUCKET, mapTicketError } from '@/app/lib/tickets';

export const dynamic = 'force-dynamic';

type Body = {
  kind?: unknown;
  usdt?: unknown;
  slug?: unknown;
  celsiusUsername?: unknown;
  email?: unknown;
  amount?: unknown;
  depositDate?: unknown;
  note?: unknown;
  proofPath?: unknown;
};

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function text(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail('Connectez-vous avec Discord pour envoyer une demande.', 401);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail('Requête illisible.');
  }

  const kind = text(body.kind, 32);

  // ---------------------------------------------------------------- Carte cadeau
  if (kind === 'giftcard') {
    // Le montant est validé contre le catalogue serveur : impossible de
    // demander une carte de 100 USDT au prix d'une carte de 5.
    const card = GIFT_CARDS.find((item) => item.usdt === Number(body.usdt));
    if (!card) return fail('Palier de carte cadeau inconnu.');

    const { data, error } = await supabase
      .rpc('create_points_ticket', {
        p_kind: 'giftcard',
        p_points: card.points,
        p_payload: { usdt: card.usdt },
      })
      .maybeSingle();

    if (error || !data) {
      const mapped = error ? mapTicketError(error) : { message: 'Demande impossible.', status: 500 };
      return fail(mapped.message, mapped.status);
    }

    return NextResponse.json({
      ticketId: (data as { ticket_id: string }).ticket_id,
      balance: (data as { balance: number }).balance,
    });
  }

  // ------------------------------------------------------------------ Bonus buy
  if (kind === 'bonusbuy') {
    const item = BONUS_BUYS.find((entry) => entry.slug === text(body.slug, 64));
    if (!item) return fail('Bonus buy inconnu.');

    const { data, error } = await supabase
      .rpc('create_points_ticket', {
        p_kind: 'bonusbuy',
        p_points: item.points,
        p_payload: {
          slug: item.slug,
          slot: item.slot,
          provider: item.provider,
          usdt: item.usdt,
        },
      })
      .maybeSingle();

    if (error || !data) {
      const mapped = error ? mapTicketError(error) : { message: 'Réservation impossible.', status: 500 };
      return fail(mapped.message, mapped.status);
    }

    return NextResponse.json({
      ticketId: (data as { ticket_id: string }).ticket_id,
      balance: (data as { balance: number }).balance,
    });
  }

  // --------------------------------------------------- Remboursement Celsius
  if (kind === 'celsius_refund') {
    const celsiusUsername = text(body.celsiusUsername, 120);
    const email = text(body.email, 200);
    const proofPath = text(body.proofPath, 400);

    if (!celsiusUsername || !email) {
      return fail('Pseudo Celsius et e-mail sont obligatoires.');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return fail('Adresse e-mail invalide.');
    }
    // La preuve doit appartenir au dossier de l'utilisateur : sans ce contrôle,
    // un ticket pourrait pointer vers le fichier de quelqu'un d'autre.
    if (proofPath && !proofPath.startsWith(`${user.id}/`)) {
      return fail('Fichier de preuve invalide.');
    }

    const amount = Number(body.amount);

    const { data, error } = await supabase
      .rpc('create_refund_ticket', {
        p_payload: {
          celsius_username: celsiusUsername,
          email,
          amount: Number.isFinite(amount) && amount > 0 ? Math.min(amount, 100000) : null,
          deposit_date: text(body.depositDate, 32) || null,
          note: text(body.note, 1000) || null,
          proof_path: proofPath || null,
          bucket: PROOF_BUCKET,
        },
      })
      .maybeSingle();

    if (error || !data) {
      const mapped = error ? mapTicketError(error) : { message: 'Demande impossible.', status: 500 };
      return fail(mapped.message, mapped.status);
    }

    return NextResponse.json({ ticketId: (data as { ticket_id: string }).ticket_id });
  }

  return fail('Type de demande inconnu.');
}
