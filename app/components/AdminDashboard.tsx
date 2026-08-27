'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  TICKET_KIND_LABELS,
  TICKET_STATUS_LABELS,
  formatTicketDate,
  type Member,
  type Ticket,
  type TicketStatus,
} from '../lib/tickets';
import { formatPoints } from '../lib/shop';

type Tab = 'pending' | 'all' | 'members';

const ACTIONS: { status: TicketStatus; label: string; className: string }[] = [
  { status: 'approved', label: 'Valider', className: 'is-approve' },
  { status: 'paid', label: 'Marquer payé', className: 'is-paid' },
  { status: 'rejected', label: 'Refuser', className: 'is-reject' },
];

/** Détail lisible du contenu d'un ticket selon son type. */
function TicketDetail({ ticket }: { ticket: Ticket }) {
  const p = ticket.payload;

  if (ticket.kind === 'giftcard') {
    return (
      <p className="admin-detail">
        Carte cadeau <strong>{p.usdt} USDT</strong>
      </p>
    );
  }

  if (ticket.kind === 'bonusbuy') {
    return (
      <p className="admin-detail">
        <strong>
          {p.slot} — {p.usdt} $
        </strong>
        <span>{p.provider}</span>
      </p>
    );
  }

  return (
    <div className="admin-detail">
      <p>
        Celsius : <strong>{p.celsius_username}</strong>
      </p>
      <p>
        E-mail : <strong>{p.email}</strong>
      </p>
      <p>
        Dépôt : <strong>{p.amount ? `${p.amount} €` : '—'}</strong>
        {p.deposit_date ? ` · ${p.deposit_date}` : ''}
      </p>
      {p.note && <p className="admin-detail-note">« {p.note} »</p>}
    </div>
  );
}

export default function AdminDashboard({
  tickets,
  members,
  counts,
}: {
  tickets: Ticket[];
  members: Member[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pending = tickets.filter((ticket) => ticket.status === 'pending');
  const visible = tab === 'pending' ? pending : tickets;
  const totalPending = pending.length;

  async function resolve(ticket: Ticket, status: TicketStatus) {
    setBusy(ticket.id);
    setError(null);
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          ticketId: ticket.id,
          status,
          note: notes[ticket.id] ?? null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Erreur inattendue.');
        return;
      }
      router.refresh();
    } catch {
      setError('Connexion impossible. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function openProof(path: string) {
    setError(null);
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'proof', path }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? 'Preuve introuvable.');
        return;
      }
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Connexion impossible. Réessayez.');
    }
  }

  return (
    <div className="admin-shell">
      {/* Compteurs de notification */}
      <div className="admin-counters">
        <article className={totalPending > 0 ? 'is-alert' : ''}>
          <span>À traiter</span>
          <strong>{totalPending}</strong>
        </article>
        {(['giftcard', 'bonusbuy', 'celsius_refund'] as const).map((kind) => (
          <article key={kind}>
            <span>{TICKET_KIND_LABELS[kind]}</span>
            <strong>{counts[kind] ?? 0}</strong>
          </article>
        ))}
        <article>
          <span>Membres</span>
          <strong>{members.length}</strong>
        </article>
      </div>

      <div className="admin-tabs" role="tablist">
        {(
          [
            ['pending', `File d’attente (${totalPending})`],
            ['all', `Tous les tickets (${tickets.length})`],
            ['members', `Utilisateurs (${members.length})`],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'is-active' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="account-notice is-error account-notice-top" role="alert">
          {error}
        </p>
      )}

      {tab === 'members' ? (
        <div className="compare-table-wrap">
          <table className="compare-table admin-table">
            <caption className="sr-only">Liste des membres inscrits</caption>
            <thead>
              <tr>
                <th scope="col">Discord</th>
                <th scope="col">E-mail</th>
                <th scope="col">Pseudo Rumble</th>
                <th scope="col">Points</th>
                <th scope="col">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.user_id}>
                  <th scope="row">{member.discord_name ?? '—'}</th>
                  <td>{member.user_email ?? '—'}</td>
                  <td>
                    {member.rumble_username ? (
                      member.rumble_username
                    ) : (
                      <span className="admin-muted">non lié</span>
                    )}
                  </td>
                  <td>
                    {member.points_balance !== null ? formatPoints(member.points_balance) : '—'}
                  </td>
                  <td>{formatTicketDate(member.created_at)}</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5}>Aucun membre pour l’instant.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="admin-tickets">
          {visible.map((ticket) => (
            <li key={ticket.id} className={`admin-ticket is-${ticket.status}`}>
              <header>
                <span className={`admin-kind is-${ticket.kind}`}>
                  {TICKET_KIND_LABELS[ticket.kind]}
                </span>
                <span className={`admin-status is-${ticket.status}`}>
                  {TICKET_STATUS_LABELS[ticket.status]}
                </span>
                <span className="admin-date">{formatTicketDate(ticket.created_at)}</span>
              </header>

              <div className="admin-ticket-body">
                <div className="admin-member">
                  <strong>{ticket.discord_name ?? ticket.user_email ?? 'Membre'}</strong>
                  <small>{ticket.user_email}</small>
                  <small>
                    Rumble : {ticket.rumble_username ?? '—'} · Solde :{' '}
                    {ticket.points_balance !== null ? formatPoints(ticket.points_balance) : '—'}
                  </small>
                  {ticket.points_cost > 0 && (
                    <span className="admin-cost">
                      −{formatPoints(ticket.points_cost)} points immobilisés
                    </span>
                  )}
                </div>

                <div className="admin-payload">
                  <TicketDetail ticket={ticket} />
                  {ticket.payload.proof_path && (
                    <button
                      type="button"
                      className="admin-proof-btn"
                      onClick={() => openProof(ticket.payload.proof_path!)}
                    >
                      🖼 Voir la preuve de dépôt
                    </button>
                  )}
                  {ticket.admin_note && (
                    <p className="admin-detail-note">Note : {ticket.admin_note}</p>
                  )}
                </div>
              </div>

              {ticket.status === 'pending' ? (
                <div className="admin-actions">
                  <input
                    type="text"
                    placeholder="Note interne (optionnel)"
                    value={notes[ticket.id] ?? ''}
                    onChange={(event) =>
                      setNotes((previous) => ({ ...previous, [ticket.id]: event.target.value }))
                    }
                    maxLength={1000}
                  />
                  {ACTIONS.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      className={`admin-action ${action.className}`}
                      onClick={() => resolve(ticket, action.status)}
                      disabled={busy === ticket.id}
                    >
                      {busy === ticket.id ? '…' : action.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="admin-actions">
                  <span className="admin-muted">
                    Traité le {formatTicketDate(ticket.resolved_at)}
                  </span>
                  {ticket.status === 'approved' && (
                    <button
                      type="button"
                      className="admin-action is-paid"
                      onClick={() => resolve(ticket, 'paid')}
                      disabled={busy === ticket.id}
                    >
                      Marquer payé
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}

          {visible.length === 0 && (
            <li className="admin-empty">
              {tab === 'pending' ? 'Aucune demande en attente. 🎉' : 'Aucun ticket enregistré.'}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
