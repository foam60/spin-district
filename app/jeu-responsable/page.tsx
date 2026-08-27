import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { links, siteUrl } from '../lib/site';

const title = 'Jeu responsable, 18+ et transparence sur nos liens partenaires';
const description =
  'Règles de jeu responsable de Spin District : interdiction aux mineurs, signaux d’alerte du jeu problématique, outils de limitation, contacts d’aide (Joueurs Info Service, ARJEL/ANJ) et transparence complète sur nos liens d’affiliation.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteUrl}/jeu-responsable` },
  openGraph: { title, description, url: `${siteUrl}/jeu-responsable`, type: 'article' },
};

const warningSignals = [
  'Vous jouez des sommes plus élevées que prévu, ou plus longtemps que prévu.',
  'Vous rejouez pour « récupérer » de l’argent perdu (chasse aux pertes).',
  'Vous empruntez de l’argent ou vendez des biens pour continuer à jouer.',
  'Vous cachez à votre entourage le temps ou l’argent consacré au jeu.',
  'Le jeu empiète sur votre travail, vos études, votre sommeil ou vos relations.',
  'Vous ressentez de l’irritabilité ou de l’anxiété quand vous ne jouez pas.',
];

const guardRails = [
  {
    title: 'Fixez un budget avant de jouer',
    text: 'Un montant décidé à froid, que vous pouvez perdre entièrement sans conséquence sur votre budget. Une fois atteint, la session est terminée.',
  },
  {
    title: 'Fixez une limite de temps',
    text: 'Programmez une alarme. La perte de repère temporel est l’un des premiers signaux du jeu problématique.',
  },
  {
    title: 'Utilisez les outils des opérateurs',
    text: 'Limites de dépôt, de perte et de session, pauses temporaires et auto-exclusion sont disponibles dans les paramètres de compte de la plupart des casinos.',
  },
  {
    title: 'Ne jouez jamais pour vous refaire',
    text: 'Le jeu n’est pas une source de revenus et ne rembourse pas une dette. Chaque tour est indépendant du précédent.',
  },
  {
    title: 'Jamais sous influence',
    text: 'Alcool, fatigue, émotions fortes : ce sont les états où les limites fixées sautent le plus facilement.',
  },
  {
    title: 'Parlez-en',
    text: 'En parler à un proche ou à un professionnel est la mesure la plus efficace. Ce n’est ni un échec ni un tabou.',
  },
];

export default function ResponsibleGamingPage() {
  return (
    <PageShell
      eyebrow="JEU RESPONSABLE — 18+"
      title={
        <>
          LE JEU RESTE UN JEU.
          <br />
          <span className="gradient-text">JAMAIS UN REVENU.</span>
        </>
      }
      intro={
        <>
          <p>
            Spin District est un site de divertissement et d’outils pour passionnés de machines à
            sous. Les jeux d’argent sont <strong>strictement interdits aux mineurs</strong> et
            comportent un risque réel de dépendance, d’isolement et de pertes financières.
          </p>
          <p className="page-hero-note">
            Besoin d’aide maintenant ? Joueurs Info Service :{' '}
            <a href="tel:0974751313">
              <strong>09 74 75 13 13</strong>
            </a>{' '}
            — appel non surtaxé, 8h à 2h, 7j/7.
          </p>
        </>
      }
      crumbs={[{ name: 'Jeu responsable', path: '/jeu-responsable' }]}
    >
      <section className="page-section prose alert-box" aria-labelledby="mineurs-title">
        <h2 id="mineurs-title">Interdit aux moins de 18 ans</h2>
        <p>
          L’accès aux jeux d’argent et de hasard est interdit aux mineurs, y compris avec l’accord
          d’un adulte. Les casinos partenaires appliquent une vérification d’identité (KYC) avant tout
          retrait. Si vous êtes mineur, quittez ce site et n’utilisez aucun des liens partenaires
          qu’il contient.
        </p>
        <p>
          Parents : des logiciels de contrôle parental permettent de bloquer l’accès aux sites de jeu
          (Parentalfilter, ContrôleParental de votre FAI, ou le blocage par catégorie de votre
          routeur).
        </p>
      </section>

      <section className="page-section prose" aria-labelledby="signals-title">
        <h2 id="signals-title">Les signaux d’alerte</h2>
        <p>
          Le jeu problématique s’installe progressivement. Si une seule de ces phrases vous
          correspond, il est temps de faire une pause :
        </p>
        <ul className="signal-list">
          {warningSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
        <p>
          Un auto-questionnaire anonyme et validé cliniquement est disponible sur{' '}
          <a href={links.helpline} target="_blank" rel="noopener noreferrer">
            joueurs-info-service.fr ↗
          </a>
          .
        </p>
      </section>

      <section className="page-section prose" aria-labelledby="rules-title">
        <h2 id="rules-title">Nos 6 règles de base</h2>
        <div className="fact-cards">
          {guardRails.map((rail) => (
            <article key={rail.title}>
              <h3>{rail.title}</h3>
              <p>{rail.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section prose" aria-labelledby="help-title">
        <h2 id="help-title">Où trouver de l’aide</h2>
        <ul className="help-list">
          <li>
            <strong>Joueurs Info Service</strong> — <a href="tel:0974751313">09 74 75 13 13</a>{' '}
            (anonyme et gratuit, 8h-2h, 7j/7) et chat en ligne sur{' '}
            <a href={links.helpline} target="_blank" rel="noopener noreferrer">
              joueurs-info-service.fr ↗
            </a>
          </li>
          <li>
            <strong>SOS Joueurs</strong> — accompagnement des joueurs et de leur entourage,
            consultations à distance.
          </li>
          <li>
            <strong>ANJ (Autorité nationale des jeux)</strong> — l’autorité française de régulation :{' '}
            <a href="https://anj.fr" target="_blank" rel="noopener noreferrer">
              anj.fr ↗
            </a>
          </li>
          <li>
            <strong>Votre médecin traitant ou un CSAPA</strong> — les Centres de Soins,
            d’Accompagnement et de Prévention en Addictologie prennent en charge l’addiction au jeu
            gratuitement.
          </li>
        </ul>
      </section>

      <section className="page-section prose disclosure-box" aria-labelledby="affil-title">
        <h2 id="affil-title">Transparence : nos liens sont des liens d’affiliation</h2>
        <p>
          Spin District est financé par l’affiliation. Les liens vers <strong>Stake</strong> et{' '}
          <strong>Celsius Casino</strong> présents sur le site sont des liens partenaires : si vous
          créez un compte via ces liens, nous pouvons percevoir une commission versée par l’opérateur,{' '}
          <strong>sans aucun surcoût pour vous</strong> et sans modification des offres auxquelles
          vous avez droit.
        </p>
        <p>
          Nous ne recommandons que des plateformes que nous utilisons nous-mêmes en live. Cela ne
          constitue ni une garantie de gain, ni un conseil financier, ni une incitation à déposer.
        </p>
        <p>
          <strong>Cadre légal :</strong> en France, le casino en ligne n’est pas ouvert à la licence
          ANJ. Celsius Casino et Stake sont régulés à l’étranger et{' '}
          <strong>ne détiennent pas d’agrément ANJ</strong> : les protections du cadre français ne
          s’appliquent pas à ces plateformes. Renseignez-vous sur la réglementation applicable dans
          votre pays de résidence avant de créer un compte.
        </p>
        <p>
          <strong>Vos données :</strong> le{' '}
          <Link href="/bonus-hunt">Bonus Hunt Lab</Link> fonctionne sans inscription. Vos sessions
          sont stockées uniquement dans le stockage local de votre navigateur, sur votre appareil, et
          ne sont jamais transmises à Spin District ni à un tiers.
        </p>
      </section>
    </PageShell>
  );
}
