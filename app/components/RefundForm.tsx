'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ArrowIcon } from './BrandIcons';
import { PROOF_BUCKET, PROOF_MAX_BYTES, PROOF_TYPES } from '../lib/tickets';

/**
 * Demande de remboursement du premier dépôt Celsius.
 *
 * La capture part **directement** vers Supabase Storage (bucket privé, écriture
 * limitée au dossier `<auth.uid()>/` par RLS) : elle ne transite pas par le
 * serveur Next, ce qui évite la limite de taille de requête du runtime.
 */
export default function RefundForm({
  isAuthenticated,
  defaultEmail,
  hasPending,
}: {
  isAuthenticated: boolean;
  defaultEmail: string;
  hasPending: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bj-locked">
        <p>
          Connectez-vous avec Discord pour envoyer une demande : c’est ce qui nous permet de vous
          répondre et de retrouver votre dossier.
        </p>
        <Link className="button button-primary" href="/compte">
          Me connecter <ArrowIcon />
        </Link>
      </div>
    );
  }

  if (sent || hasPending) {
    return (
      <div className="refund-sent" role="status">
        <span className="refund-sent-icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <h2>Demande enregistrée</h2>
          <p>
            Votre dossier est dans la file de traitement. Vous recevrez la réponse par message privé
            Discord — comptez quelques jours selon le volume. Une seule demande à la fois : si vous
            avez oublié une information, signalez-le sur le Discord.
          </p>
          <Link className="button button-ghost" href="/compte">
            Retour à mon compte <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  function pickFile(selected: File | null) {
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!PROOF_TYPES.includes(selected.type)) {
      setError('Format accepté : PNG, JPEG, WebP ou PDF.');
      return;
    }
    if (selected.size > PROOF_MAX_BYTES) {
      setError('Fichier trop lourd (5 Mo maximum).');
      return;
    }
    setFile(selected);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    let proofPath: string | null = null;

    try {
      if (file) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('Session expirée. Reconnectez-vous.');
          setPending(false);
          return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase().slice(0, 5) ?? 'png';
        const path = `${user.id}/${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(PROOF_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          setError(
            /bucket/i.test(uploadError.message)
              ? 'Stockage des preuves non configuré (voir supabase/tickets.sql).'
              : 'Envoi du fichier impossible. Réessayez.'
          );
          setPending(false);
          return;
        }
        proofPath = path;
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'celsius_refund',
          celsiusUsername: form.get('celsiusUsername'),
          email: form.get('email'),
          amount: form.get('amount'),
          depositDate: form.get('depositDate'),
          note: form.get('note'),
          proofPath,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Erreur inattendue.');
        setPending(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Connexion impossible. Réessayez.');
      setPending(false);
    }
  }

  return (
    <form className="refund-form" onSubmit={submit}>
      <div className="refund-grid">
        <label className="refund-field">
          <span>
            Pseudo Celsius <b aria-hidden="true">*</b>
          </span>
          <input name="celsiusUsername" required maxLength={120} autoComplete="off" />
          <small>Exactement le pseudo du compte Celsius qui a fait le dépôt.</small>
        </label>

        <label className="refund-field">
          <span>
            E-mail du compte Celsius <b aria-hidden="true">*</b>
          </span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            defaultValue={defaultEmail}
            autoComplete="email"
          />
          <small>Utilisé pour vérifier le dépôt auprès du partenaire.</small>
        </label>

        <label className="refund-field">
          <span>Montant du dépôt (€)</span>
          <input name="amount" type="number" min={1} max={100000} step="0.01" inputMode="decimal" />
          <small>L’offre porte sur le premier dépôt, à hauteur de 20 €.</small>
        </label>

        <label className="refund-field">
          <span>Date du dépôt</span>
          <input name="depositDate" type="date" />
          <small>Pour retrouver la transaction plus vite.</small>
        </label>
      </div>

      <label className="refund-field refund-file">
        <span>Capture d’écran du dépôt</span>
        <input
          type="file"
          accept={PROOF_TYPES.join(',')}
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
        />
        <small>
          PNG, JPEG, WebP ou PDF, 5 Mo maximum. Le fichier est stocké dans un espace privé, visible
          uniquement par vous et par l’administration.
        </small>
        {file && (
          <span className="refund-file-name">
            📎 {file.name} ({Math.round(file.size / 1024)} Ko)
          </span>
        )}
      </label>

      <label className="refund-field">
        <span>Précisions (optionnel)</span>
        <textarea name="note" rows={3} maxLength={1000} />
      </label>

      {error && (
        <p className="account-notice is-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="button button-primary refund-submit"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? 'Envoi en cours…' : 'Envoyer ma demande'} <ArrowIcon />
      </button>

      <p className="bj-bet-hint">
        En envoyant ce formulaire, vous acceptez que ces informations soient consultées par
        l’administration de Spin District dans le seul but de vérifier votre dépôt et de traiter le
        remboursement.
      </p>
    </form>
  );
}
