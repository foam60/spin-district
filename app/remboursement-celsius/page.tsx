import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import RefundForm from '../components/RefundForm';
import { ArrowIcon } from '../components/BrandIcons';
import { links, siteUrl } from '../lib/site';
import { createClient } from '@/utils/supabase/server';

const title = 'Remboursement du premier dépôt Celsius';
const description =
  'Déposez votre demande de remboursement du premier dépôt Celsius (jusqu’à 20 €) : pseudo Celsius, e-mail, montant et capture du dépôt. Vérification manuelle par l’équipe Spin District. 18+.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/remboursement-celsius` },
  openGraph: { title, description, url: `${siteUrl}/remboursement-celsius`, type: 'website' },
  // Formulaire personnel : pas d'intérêt à l'indexer.
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

const STEPS = [
  {
    title: 'CRÉE TON COMPTE',
    text: 'Inscription sur Celsius via le lien partenaire Spin District, puis premier dépôt. Sans passer par le lien, le remboursement ne peut pas être rattaché.',
  },
  {
    title: 'ENVOIE TA PREUVE',
    text: 'Remplis le formulaire ci-dessous avec ton pseudo Celsius, l’e-mail du compte et une capture du dépôt.',
  },
  {
    title: 'ON VÉRIFIE',
    text: 'L’équipe contrôle le dépôt auprès du partenaire. Tu reçois la réponse en message privé Discord.',
  },
  {
    title: 'TU ES REMBOURSÉ',
    text: 'Le remboursement est envoyé après validation, jusqu’à 20 € selon les conditions de l’offre en cours.',
  },
];

export default async function RefundPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Une demande en attente suffit : on affiche l'accusé plutôt que le formulaire.
  const pending = user
    ? (
        await supabase
          .from('tickets')
          .select('id')
          .eq('kind', 'celsius_refund')
          .eq('status', 'pending')
          .maybeSingle()
      ).data
    : null;

  return (
    <PageShell
      eyebrow="OFFRE PARTENAIRE — CELSIUS"
      title={
        <>
          PREMIER DÉPÔT
          <br />
          <span className="gradient-text">REMBOURSÉ JUSQU’À 20 €</span>
        </>
      }
      intro={
        <>
          <p>
            Vous avez ouvert un compte Celsius via le lien Spin District et fait votre premier
            dépôt ? Déposez votre dossier ici : on vérifie auprès du partenaire, puis le
            remboursement vous est envoyé.
          </p>
          <p className="page-hero-note">
            Offre soumise aux conditions de l’opérateur • Un dossier par personne • 18+ • Celsius ne
            détient pas d’agrément ANJ en France
          </p>
        </>
      }
      crumbs={[{ name: 'Remboursement Celsius', path: '/remboursement-celsius' }]}
    >
      <section className="page-section" aria-labelledby="steps-title">
        <h2 id="steps-title">Comment ça se passe</h2>
        <div className="hunt-howto">
          {STEPS.map((step, index) => (
            <article key={step.title}>
              <div className="howto-header">
                <span className="step-num">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section" aria-labelledby="form-title">
        <h2 id="form-title">Ma demande de remboursement</h2>
        <RefundForm
          isAuthenticated={Boolean(user)}
          defaultEmail={user?.email ?? ''}
          hasPending={Boolean(pending)}
        />
      </section>

      <section className="page-section prose disclosure-box" aria-labelledby="terms-title">
        <h2 id="terms-title">Conditions du remboursement</h2>
        <ul>
          <li>
            Le compte Celsius doit avoir été créé via le{' '}
            <a href={links.celsius} target="_blank" rel="sponsored noopener noreferrer">
              lien partenaire Spin District
            </a>
            . Un compte ouvert autrement ne peut pas être rattaché à notre programme.
          </li>
          <li>
            Le remboursement porte sur le <strong>premier dépôt</strong>, à hauteur de 20 € maximum,
            selon les conditions de l’offre en cours chez l’opérateur.
          </li>
          <li>
            Un seul dossier par personne et par compte. Les demandes en doublon ou avec des
            informations qui ne correspondent pas au dépôt sont refusées.
          </li>
          <li>
            La capture doit montrer clairement le montant, la date et le compte concerné. Les
            fichiers sont stockés dans un espace privé et ne servent qu’à cette vérification.
          </li>
          <li>
            Le délai dépend du volume de demandes et du temps de réponse du partenaire. Vous êtes
            prévenu par message privé Discord dans tous les cas, validation comme refus.
          </li>
        </ul>
        <p>
          Rappel : jouer comporte des risques. Consultez nos{' '}
          <Link href="/jeu-responsable">règles de jeu responsable</Link> avant tout dépôt.
        </p>
        <div className="compare-cta-row">
          <Link className="button button-ghost" href="/casinos">
            Voir l’offre Celsius <ArrowIcon />
          </Link>
          <Link className="button button-ghost" href="/compte">
            Mon compte <ArrowIcon />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
