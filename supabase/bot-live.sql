-- =====================================================================
--  Spin District — interrupteur du bot Rumble (durcissement)
-- =====================================================================
-- À exécuter APRÈS supabase/tickets.sql (qui crée `app_admins` et
-- `is_admin()`), et APRÈS le script d'ajout de `bot_config` livré avec le
-- bot. Ce fichier est idempotent : on peut le relancer sans risque.
--
-- CE QU'IL CORRIGE
-- Le script du bot se termine par :
--     grant execute on function public.set_bot_live(boolean) to authenticated;
-- sans aucun contrôle dans le corps de la fonction. N'importe quel membre
-- connecté au site pouvait donc couper le bot en pleine émission avec un
-- seul appel REST. Ici, l'écriture est réservée à la whitelist
-- `app_admins`.
--
-- IL LÈVE AUSSI UN BLOCAGE : `get_bot_live()` n'était accordée qu'à
-- `service_role`, donc la console d'administration ne pouvait pas lire
-- l'état pour afficher la position de l'interrupteur.
--
-- Le nom des fonctions et celui du paramètre (`p_is_live`) sont conservés
-- tels quels : le bot n'a rien à changer.
--
-- Le bot se connecte directement à Postgres via SUPABASE_DB_URL : il n'a
-- pas de JWT, garde donc le droit d'écrire, et n'est pas soumis au RLS
-- puisqu'il est propriétaire des tables.

-- ---------------------------------------------------------------------
-- 1. Table de configuration
-- ---------------------------------------------------------------------
-- Déjà créée par le script du bot (`id bigint generated always as
-- identity`). Le `if not exists` ne sert qu'à une installation à neuf ;
-- il ne modifie pas une table existante.
create table if not exists public.bot_config (
  id         bigint generated always as identity primary key,
  is_live    boolean     not null default false,
  updated_at timestamptz not null default now()
);

-- Trace de l'auteur du dernier basculement : utile pour savoir qui a
-- laissé le bot allumé. Colonne ajoutée seulement si elle manque.
alter table public.bot_config add column if not exists updated_by uuid;

-- Une seule ligne suffit ; on la crée si la table est vide.
insert into public.bot_config (is_live)
select false
where not exists (select 1 from public.bot_config);

comment on table public.bot_config is
  'Interrupteur du bot Rumble. Écriture via set_bot_live() uniquement.';

-- ---------------------------------------------------------------------
-- 2. RLS : lecture pour les membres, aucune policy d'écriture
-- ---------------------------------------------------------------------
alter table public.bot_config enable row level security;

drop policy if exists bot_config_read on public.bot_config;
create policy bot_config_read
  on public.bot_config
  for select
  to authenticated
  using (true);

-- Volontairement aucune policy d'écriture : tout passe par set_bot_live(),
-- qui est `security definer` et contrôle l'autorité lui-même.

-- ---------------------------------------------------------------------
-- 3. Lecture — le bot interroge cette fonction toutes les 10 s
-- ---------------------------------------------------------------------
-- `where id = 1` renvoyait NULL si la ligne portait un autre identifiant
-- (une identité repart de 2 après une suppression). `order by id limit 1`
-- avec `coalesce` garantit un booléen, et « coupé » comme valeur de repli.
create or replace function public.get_bot_live()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select c.is_live from public.bot_config c order by c.id limit 1), false);
$$;

comment on function public.get_bot_live() is
  'Le bot doit-il être actif ? Faux si la table est vide.';

-- ---------------------------------------------------------------------
-- 4. Écriture — réservée aux administrateurs
-- ---------------------------------------------------------------------
create or replace function public.set_bot_live(p_is_live boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  -- `auth.uid()` est nul quand l'appel vient d'une connexion Postgres
  -- directe (le bot sur Railway, ou l'éditeur SQL de Supabase) : cette
  -- voie reste ouverte. Un appel par l'API REST porte toujours un JWT,
  -- donc un membre non administrateur est rejeté ici. Le rôle `anon` n'a
  -- de toute façon pas le droit d'exécution (section 6).
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Basculer le bot est réservé aux administrateurs.'
      using errcode = '42501';
  end if;

  -- Sans clause `where` : la table est un singleton, et l'ancienne version
  -- ne mettait à jour que la ligne `id = 1`.
  update public.bot_config
     set is_live    = p_is_live,
         updated_at = now(),
         updated_by = auth.uid();

  if not found then
    insert into public.bot_config (is_live, updated_at, updated_by)
    values (p_is_live, now(), auth.uid());
  end if;

  return p_is_live;
end;
$$;

comment on function public.set_bot_live(boolean) is
  'Active ou coupe le bot. Refuse tout appel authentifié hors app_admins.';

-- ---------------------------------------------------------------------
-- 5. État détaillé pour la console d'administration
-- ---------------------------------------------------------------------
create or replace function public.bot_live_status()
returns table (is_live boolean, updated_at timestamptz, updated_by_email text)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(c.is_live, false),
    c.updated_at,
    u.email::text
  from public.bot_config c
  left join auth.users u on u.id = c.updated_by
  order by c.id
  limit 1;
$$;

comment on function public.bot_live_status() is
  'État de l''interrupteur, sa date, et l''administrateur qui l''a modifié.';

-- ---------------------------------------------------------------------
-- 6. Droits d'exécution
-- ---------------------------------------------------------------------
revoke all on function public.get_bot_live() from public;
revoke all on function public.set_bot_live(boolean) from public;
revoke all on function public.bot_live_status() from public;

grant select on table public.bot_config to authenticated;

-- `authenticated` est nécessaire : c'est le rôle du navigateur de
-- l'administrateur. Le garde-fou est dans le corps de set_bot_live(),
-- pas dans ce grant.
grant execute on function public.get_bot_live() to authenticated, service_role;
grant execute on function public.set_bot_live(boolean) to authenticated, service_role;
grant execute on function public.bot_live_status() to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Rechargement du cache de schéma PostgREST
-- ---------------------------------------------------------------------
-- Sans ce NOTIFY, les fonctions restent invisibles pour l'API REST et les
-- appels échouent en « Could not find the function ».
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- Vérification
-- ---------------------------------------------------------------------
-- select * from public.bot_live_status();   -- état courant
-- select public.set_bot_live(true);         -- allumer
-- select public.set_bot_live(false);        -- couper
--
-- Contrôle du verrou : la requête ci-dessous ne doit lister que
-- `authenticated` et `service_role`, jamais `anon` ni `PUBLIC`.
-- select grantee, privilege_type
--   from information_schema.routine_privileges
--  where routine_name = 'set_bot_live';
