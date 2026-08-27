-- =====================================================================
-- Blackjack sur points — schéma et fonctions
--
-- Prérequis : supabase/00-mapping.sql doit avoir été exécuté avant.
-- Ce fichier ne touche plus jamais `chat_users` ni `account_links`
-- directement : tout passe par sd_adjust_points() / sd_points_balance(),
-- qui connaissent le schéma réel du bot.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table des manches
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
-- 2. Ouverture d'une manche : débit atomique de la mise
-- ---------------------------------------------------------------------
create or replace function public.blackjack_open_round(p_bet integer, p_state jsonb)
returns table (round_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_round   uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if p_bet is null or p_bet <= 0 then
    raise exception 'invalid_bet';
  end if;

  if exists (
    select 1 from public.blackjack_rounds r
    where r.user_id = auth.uid() and r.settled_at is null
  ) then
    raise exception 'round_in_progress';
  end if;

  -- Lève `no_points_account` ou `insufficient_points` le cas échéant.
  v_balance := public.sd_adjust_points(auth.uid(), -p_bet);

  insert into public.blackjack_rounds (user_id, bet, state, status)
  values (auth.uid(), p_bet, p_state, coalesce(p_state->>'status', 'player'))
  returning id into v_round;

  return query select v_round, v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Mise à jour d'une manche en cours (hit sans fin de partie)
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
-- 4. Solde d'une manche : crédit du gain, une seule fois
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

  if p_extra_debit > 0 then
    v_balance := public.sd_adjust_points(auth.uid(), -p_extra_debit);
  end if;

  if p_payout > 0 then
    v_balance := public.sd_adjust_points(auth.uid(), p_payout);
  else
    v_balance := coalesce(v_balance, public.sd_points_balance(auth.uid()), 0);
  end if;

  return query select v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Droits d'exécution
-- ---------------------------------------------------------------------
revoke all on function public.blackjack_open_round(integer, jsonb) from public;
revoke all on function public.blackjack_update_round(uuid, jsonb) from public;
revoke all on function public.blackjack_settle_round(uuid, jsonb, integer, text, integer) from public;

grant execute on function public.blackjack_open_round(integer, jsonb) to authenticated;
grant execute on function public.blackjack_update_round(uuid, jsonb) to authenticated;
grant execute on function public.blackjack_settle_round(uuid, jsonb, integer, text, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Rechargement du cache de schéma PostgREST
-- ---------------------------------------------------------------------
-- Sans ce NOTIFY, les fonctions créées ci-dessus restent invisibles pour
-- l'API REST : les appels échouent en « Could not find the function ».
notify pgrst, 'reload schema';
