-- =====================================================================
-- Tickets (cartes cadeaux, bonus buys, remboursements Celsius) + admin
--
-- À exécuter dans l'éditeur SQL Supabase. Sans ces objets, les pages
-- s'affichent mais expliquent que le système n'est pas encore installé.
--
-- Prérequis : supabase/00-mapping.sql. Ce fichier ne touche jamais
-- `chat_users` ni `account_links` directement : tout passe par
-- sd_adjust_points() / sd_points_balance() / sd_rumble_username().
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Administrateurs
-- ---------------------------------------------------------------------
-- Whitelist par e-mail : permet d'ajouter un admin sans redéploiement.
create table if not exists public.app_admins (
  email      text primary key,
  label      text,
  created_at timestamptz not null default now()
);

insert into public.app_admins (email, label)
values ('antoine.mousse@gmail.com', 'foamzer')
on conflict (email) do nothing;

alter table public.app_admins enable row level security;
-- Aucune policy : la table n'est lisible que par les fonctions security definer.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

comment on function public.is_admin() is
  'Vrai si l''e-mail du JWT courant figure dans app_admins.';

-- ---------------------------------------------------------------------
-- 2. Table des tickets
-- ---------------------------------------------------------------------
create table if not exists public.tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('giftcard', 'bonusbuy', 'celsius_refund')),
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected', 'paid')),
  -- Points immobilisés par la demande (0 pour un remboursement Celsius).
  points_cost  integer not null default 0 check (points_cost >= 0),
  -- Détail propre au type : montant, slot, pseudo Celsius, chemin de la preuve…
  payload      jsonb not null default '{}'::jsonb,
  admin_note   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references auth.users (id)
);

create index if not exists tickets_status_created
  on public.tickets (status, created_at desc);

create index if not exists tickets_user_created
  on public.tickets (user_id, created_at desc);

-- Un seul ticket en attente par type et par utilisateur : évite qu'un membre
-- empile dix demandes et bloque la file.
create unique index if not exists tickets_one_pending_per_kind
  on public.tickets (user_id, kind)
  where status = 'pending';

alter table public.tickets enable row level security;

-- Lecture : son propre historique, ou tout pour un admin.
drop policy if exists tickets_select on public.tickets;
create policy tickets_select
  on public.tickets
  for select
  using (user_id = auth.uid() or public.is_admin());

-- Aucune policy d'écriture : tout passe par les fonctions ci-dessous.

-- ---------------------------------------------------------------------
-- 3. Création d'un ticket avec immobilisation des points
-- ---------------------------------------------------------------------
create or replace function public.create_points_ticket(
  p_kind    text,
  p_points  integer,
  p_payload jsonb
)
returns table (ticket_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_ticket  uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if p_kind not in ('giftcard', 'bonusbuy') then
    raise exception 'invalid_kind';
  end if;
  if p_points is null or p_points <= 0 then
    raise exception 'invalid_points';
  end if;

  if exists (
    select 1 from public.tickets t
    where t.user_id = auth.uid() and t.kind = p_kind and t.status = 'pending'
  ) then
    raise exception 'ticket_already_pending';
  end if;

  -- Les points sont retirés dès la demande : sans ça, le même solde pourrait
  -- financer plusieurs tickets en attente.
  v_balance := public.sd_adjust_points(auth.uid(), -p_points);

  insert into public.tickets (user_id, kind, points_cost, payload)
  values (auth.uid(), p_kind, p_points, coalesce(p_payload, '{}'::jsonb))
  returning id into v_ticket;

  return query select v_ticket, v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Création d'une demande de remboursement Celsius (sans points)
-- ---------------------------------------------------------------------
create or replace function public.create_refund_ticket(p_payload jsonb)
returns table (ticket_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if coalesce(p_payload ->> 'celsius_username', '') = ''
     or coalesce(p_payload ->> 'email', '') = '' then
    raise exception 'missing_fields';
  end if;

  if exists (
    select 1 from public.tickets t
    where t.user_id = auth.uid()
      and t.kind = 'celsius_refund'
      and t.status = 'pending'
  ) then
    raise exception 'ticket_already_pending';
  end if;

  insert into public.tickets (user_id, kind, points_cost, payload)
  values (auth.uid(), 'celsius_refund', 0, p_payload)
  returning id into v_ticket;

  return query select v_ticket;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Résolution par un admin
-- ---------------------------------------------------------------------
-- Un refus rend les points immobilisés ; une validation les consomme.
create or replace function public.admin_resolve_ticket(
  p_ticket_id uuid,
  p_status    text,
  p_note      text default null
)
returns table (ticket_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.tickets;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_status not in ('approved', 'rejected', 'paid') then
    raise exception 'invalid_status';
  end if;

  select * into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  if v_ticket.id is null then
    raise exception 'ticket_not_found';
  end if;
  if v_ticket.status <> 'pending' and p_status <> 'paid' then
    raise exception 'ticket_already_resolved';
  end if;

  -- Restitution des points sur refus, une seule fois. Un membre qui aurait
  -- entre-temps délié son pseudo ne doit pas bloquer le traitement du ticket.
  if p_status = 'rejected' and v_ticket.points_cost > 0 and v_ticket.status = 'pending' then
    begin
      perform public.sd_adjust_points(v_ticket.user_id, v_ticket.points_cost);
    exception when others then
      null;
    end;
  end if;

  update public.tickets
     set status      = p_status,
         admin_note  = coalesce(p_note, admin_note),
         updated_at  = now(),
         resolved_at = now(),
         resolved_by = auth.uid()
   where id = p_ticket_id;

  return query select p_ticket_id, p_status;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Vue admin : tickets enrichis du pseudo et du solde
-- ---------------------------------------------------------------------
create or replace function public.admin_list_tickets(p_status text default null)
returns table (
  id              uuid,
  kind            text,
  status          text,
  points_cost     integer,
  payload         jsonb,
  admin_note      text,
  created_at      timestamptz,
  resolved_at     timestamptz,
  user_email      text,
  discord_name    text,
  rumble_username text,
  points_balance  integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id,
    t.kind,
    t.status,
    t.points_cost,
    t.payload,
    t.admin_note,
    t.created_at,
    t.resolved_at,
    u.email::text,
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name'
    ) as discord_name,
    public.sd_rumble_username(t.user_id),
    public.sd_points_balance(t.user_id)
  from public.tickets t
  join auth.users u on u.id = t.user_id
  where public.is_admin()
    and (p_status is null or t.status = p_status)
  order by t.created_at desc
  limit 400;
$$;

-- Compteurs pour le badge de notification.
create or replace function public.admin_ticket_counts()
returns table (kind text, pending integer)
language sql
stable
security definer
set search_path = public
as $$
  select t.kind, count(*)::integer
  from public.tickets t
  where public.is_admin() and t.status = 'pending'
  group by t.kind;
$$;

-- Liste des membres, pour l'onglet « Utilisateurs ».
create or replace function public.admin_list_members()
returns table (
  user_id         uuid,
  user_email      text,
  discord_name    text,
  rumble_username text,
  points_balance  integer,
  linked_at       timestamptz,
  created_at      timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name'
    ) as discord_name,
    public.sd_rumble_username(u.id),
    public.sd_points_balance(u.id),
    null::timestamptz as linked_at,
    u.created_at
  from auth.users u
  where public.is_admin()
  order by u.created_at desc
  limit 500;
$$;

-- ---------------------------------------------------------------------
-- 7. Stockage des preuves de dépôt
-- ---------------------------------------------------------------------
-- Bucket privé : une capture de dépôt contient des données personnelles.
insert into storage.buckets (id, name, public)
values ('deposit-proofs', 'deposit-proofs', false)
on conflict (id) do nothing;

-- Chaque membre écrit uniquement dans son dossier `<auth.uid()>/…`.
drop policy if exists deposit_proofs_insert_own on storage.objects;
create policy deposit_proofs_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'deposit-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists deposit_proofs_select_own_or_admin on storage.objects;
create policy deposit_proofs_select_own_or_admin
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'deposit-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------
-- 8. Droits d'exécution
-- ---------------------------------------------------------------------
revoke all on function public.is_admin() from public;
revoke all on function public.create_points_ticket(text, integer, jsonb) from public;
revoke all on function public.create_refund_ticket(jsonb) from public;
revoke all on function public.admin_resolve_ticket(uuid, text, text) from public;
revoke all on function public.admin_list_tickets(text) from public;
revoke all on function public.admin_ticket_counts() from public;
revoke all on function public.admin_list_members() from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.create_points_ticket(text, integer, jsonb) to authenticated;
grant execute on function public.create_refund_ticket(jsonb) to authenticated;
grant execute on function public.admin_resolve_ticket(uuid, text, text) to authenticated;
grant execute on function public.admin_list_tickets(text) to authenticated;
grant execute on function public.admin_ticket_counts() to authenticated;
grant execute on function public.admin_list_members() to authenticated;
