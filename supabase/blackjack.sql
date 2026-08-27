-- =====================================================================
-- Blackjack sur points — schéma et fonctions
--
-- À exécuter dans l'éditeur SQL Supabase AVANT d'ouvrir /blackjack :
-- sans ces objets, la page s'affiche mais refuse de distribuer et
-- explique quoi installer.
--
-- ⚠️ UNE SEULE CHOSE À ADAPTER À VOTRE SCHÉMA : la fonction
-- `blackjack_points_row()` ci-dessous, qui doit renvoyer l'identifiant
-- de la ligne `chat_users` appartenant à l'utilisateur connecté. Tout le
-- reste s'appuie dessus.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Résolution du portefeuille de points de l'utilisateur connecté
-- ---------------------------------------------------------------------
-- Hypothèse retenue : `account_links` associe auth.uid() à un pseudo
-- Rumble, et `chat_users` est identifiée par ce même pseudo.
-- Si `chat_users` porte directement une colonne `user_id`, remplacez le
-- corps par :  select id from public.chat_users where user_id = auth.uid();

create or replace function public.blackjack_points_row()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select cu.id
  from public.chat_users cu
  join public.account_links al
    on al.rumble_username = cu.username
  where al.user_id = auth.uid()
  limit 1;
$$;

comment on function public.blackjack_points_row() is
  'Identifiant de la ligne chat_users de l''utilisateur connecté. Unique point de couplage au schéma.';

-- ---------------------------------------------------------------------
-- 2. Table des manches
-- ---------------------------------------------------------------------
create table if not exists public.blackjack_rounds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  bet          integer not null check (bet > 0),
  -- État complet de la manche (sabot compris) : jamais exposé au client.
  state        jsonb not null,
  status       text not null default 'player' check (status in ('player', 'done')),
  outcome      text,
  payout       integer,
  created_at   timestamptz not null default now(),
  settled_at   timestamptz
);

-- Une seule manche ouverte à la fois : empêche d'empiler les parties.
create unique index if not exists blackjack_rounds_one_open
  on public.blackjack_rounds (user_id)
  where settled_at is null;

create index if not exists blackjack_rounds_user_created
  on public.blackjack_rounds (user_id, created_at desc);

alter table public.blackjack_rounds enable row level security;

-- Lecture de son propre historique uniquement. Aucune policy d'écriture :
-- les écritures passent exclusivement par les fonctions ci-dessous.
drop policy if exists blackjack_rounds_select_own on public.blackjack_rounds;
create policy blackjack_rounds_select_own
  on public.blackjack_rounds
  for select
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 3. Ouverture d'une manche : débit atomique de la mise
-- ---------------------------------------------------------------------
create or replace function public.blackjack_open_round(p_bet integer, p_state jsonb)
returns table (round_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     bigint;
  v_balance integer;
  v_round   uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if p_bet is null or p_bet <= 0 then
    raise exception 'invalid_bet';
  end if;

  v_row := public.blackjack_points_row();
  if v_row is null then
    raise exception 'no_points_account';
  end if;

  if exists (
    select 1 from public.blackjack_rounds r
    where r.user_id = auth.uid() and r.settled_at is null
  ) then
    raise exception 'round_in_progress';
  end if;

  -- Débit conditionnel : la clause `points >= p_bet` évite tout solde négatif
  -- même si deux requêtes arrivent en parallèle.
  update public.chat_users
     set points = points - p_bet,
         updated_at = now()
   where id = v_row
     and points >= p_bet
  returning points into v_balance;

  if v_balance is null then
    raise exception 'insufficient_points';
  end if;

  insert into public.blackjack_rounds (user_id, bet, state, status)
  values (auth.uid(), p_bet, p_state, coalesce(p_state->>'status', 'player'))
  returning id into v_round;

  return query select v_round, v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Mise à jour d'une manche en cours (hit sans fin de partie)
-- ---------------------------------------------------------------------
create or replace function public.blackjack_update_round(p_round_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.blackjack_rounds
     set state = p_state
   where id = p_round_id
     and user_id = auth.uid()
     and settled_at is null;

  if not found then
    raise exception 'round_not_open';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Solde d'une manche : crédit du gain, une seule fois
-- ---------------------------------------------------------------------
-- `p_extra_debit` couvre le double : la seconde mise est débitée et le gain
-- crédité dans la MÊME transaction, pour qu'un échec ne puisse pas laisser le
-- joueur débité sans manche soldée.
create or replace function public.blackjack_settle_round(
  p_round_id    uuid,
  p_state       jsonb,
  p_payout      integer,
  p_outcome     text,
  p_extra_debit integer default 0
)
returns table (balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     bigint;
  v_balance integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if p_payout is null or p_payout < 0 then
    raise exception 'invalid_payout';
  end if;
  if p_extra_debit is null or p_extra_debit < 0 then
    raise exception 'invalid_bet';
  end if;

  -- `settled_at is null` rend l'opération idempotente : rejouer la requête
  -- ne crédite pas deux fois.
  update public.blackjack_rounds
     set state      = p_state,
         status     = 'done',
         outcome    = p_outcome,
         payout     = p_payout,
         settled_at = now()
   where id = p_round_id
     and user_id = auth.uid()
     and settled_at is null;

  if not found then
    raise exception 'round_already_settled';
  end if;

  v_row := public.blackjack_points_row();
  if v_row is null then
    raise exception 'no_points_account';
  end if;

  if p_extra_debit > 0 then
    update public.chat_users
       set points = points - p_extra_debit,
           updated_at = now()
     where id = v_row
       and points >= p_extra_debit
    returning points into v_balance;

    if v_balance is null then
      raise exception 'insufficient_points';
    end if;
  end if;

  update public.chat_users
     set points = points + p_payout,
         updated_at = now()
   where id = v_row
  returning points into v_balance;

  return query select v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Droits d'exécution
-- ---------------------------------------------------------------------
revoke all on function public.blackjack_open_round(integer, jsonb) from public;
revoke all on function public.blackjack_update_round(uuid, jsonb) from public;
revoke all on function public.blackjack_settle_round(uuid, jsonb, integer, text, integer) from public;
revoke all on function public.blackjack_points_row() from public;

grant execute on function public.blackjack_open_round(integer, jsonb) to authenticated;
grant execute on function public.blackjack_update_round(uuid, jsonb) to authenticated;
grant execute on function public.blackjack_settle_round(uuid, jsonb, integer, text, integer) to authenticated;
grant execute on function public.blackjack_points_row() to authenticated;
