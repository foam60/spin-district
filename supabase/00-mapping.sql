-- =====================================================================
-- Correspondance avec le schéma existant — À EXÉCUTER EN PREMIER
--
-- Ordre d'installation :
--   1. supabase/00-mapping.sql   (ce fichier)
--   2. supabase/blackjack.sql
--   3. supabase/tickets.sql
--
-- Pourquoi ce fichier : les tables `account_links` et `chat_users` ont été
-- créées par le bot Rumble, pas par le site, et le nom de leurs colonnes
-- n'est pas connu ici. Plutôt que de le deviner, ces fonctions le
-- détectent dans information_schema, et TOUT le reste passe par elles.
--
-- Après exécution, lancez  select * from public.sd_mapping_report();
-- pour vérifier ce qui a été détecté.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Détection d'une colonne parmi plusieurs noms possibles
-- ---------------------------------------------------------------------
create or replace function public.sd_detect_column(p_table text, p_candidates text[])
returns text
language sql
stable
security definer
set search_path = public
as $$
  select c.column_name::text
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name::text = p_table
    and c.column_name::text = any (p_candidates)
  -- L'ordre du tableau vaut ordre de préférence.
  order by array_position(p_candidates, c.column_name::text)
  limit 1;
$$;

/** Colonne d'`account_links` qui porte l'identifiant auth de l'utilisateur. */
create or replace function public.sd_link_user_column()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.sd_detect_column(
    'account_links',
    array[
      'user_id', 'auth_user_id', 'supabase_user_id', 'supabase_uid', 'auth_uid', 'auth_id',
      'uid', 'discord_user_id', 'sb_user_id', 'owner_id', 'member_id', 'profile_id',
      'account_id', 'id'
    ]
  );
$$;

/** Colonne d'`account_links` qui porte le pseudo Rumble. */
create or replace function public.sd_link_name_column()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.sd_detect_column(
    'account_links',
    array[
      'rumble_username', 'username', 'rumble_user', 'rumble_name', 'chat_username',
      'rumble_pseudo', 'pseudo', 'login'
    ]
  );
$$;

/** Colonne de `chat_users` qui identifie un spectateur par son pseudo. */
create or replace function public.sd_chat_name_column()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.sd_detect_column(
    'chat_users',
    array['username', 'rumble_username', 'name', 'login', 'display_name']
  );
$$;

/** Colonne de points de `chat_users`. */
create or replace function public.sd_chat_points_column()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.sd_detect_column(
    'chat_users',
    array['points', 'balance', 'point_balance', 'score']
  );
$$;

-- ---------------------------------------------------------------------
-- 2. Résolution du pseudo Rumble lié à un compte
-- ---------------------------------------------------------------------
create or replace function public.sd_rumble_username(p_user uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_col text := public.sd_link_user_column();
  v_name_col text := public.sd_link_name_column();
  v_name     text;
begin
  if p_user is null then
    return null;
  end if;
  if v_user_col is null or v_name_col is null then
    raise exception 'account_links_mapping_unknown';
  end if;

  -- %I échappe l'identifiant : les noms viennent d'information_schema, mais
  -- on ne concatène jamais de texte brut dans une requête.
  execute format(
    'select %I::text from public.account_links where %I = $1 limit 1',
    v_name_col, v_user_col
  )
  into v_name
  using p_user;

  return v_name;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Lecture du solde de points
-- ---------------------------------------------------------------------
create or replace function public.sd_points_balance(p_user uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_name       text := public.sd_rumble_username(p_user);
  v_name_col   text := public.sd_chat_name_column();
  v_points_col text := public.sd_chat_points_column();
  v_balance    integer;
begin
  if v_name is null then
    return null;
  end if;
  if v_name_col is null or v_points_col is null then
    raise exception 'chat_users_mapping_unknown';
  end if;

  execute format(
    'select %I::integer from public.chat_users where %I = $1 limit 1',
    v_points_col, v_name_col
  )
  into v_balance
  using v_name;

  return v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Débit / crédit de points — point d'écriture UNIQUE
-- ---------------------------------------------------------------------
-- Toutes les fonctionnalités (blackjack, tickets) passent par ici : c'est la
-- seule fonction qui touche `chat_users`, et la seule à connaître le schéma.
--
-- p_delta négatif = débit. Le débit est conditionné à un solde suffisant dans
-- la clause WHERE : impossible de passer en négatif, même en concurrence.
create or replace function public.sd_adjust_points(p_user uuid, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name       text := public.sd_rumble_username(p_user);
  v_name_col   text := public.sd_chat_name_column();
  v_points_col text := public.sd_chat_points_column();
  v_has_upd    boolean;
  v_balance    integer;
  v_sql        text;
begin
  if v_name is null then
    raise exception 'no_points_account';
  end if;
  if v_name_col is null or v_points_col is null then
    raise exception 'chat_users_mapping_unknown';
  end if;

  -- `updated_at` n'existe pas forcément sur la table du bot.
  v_has_upd := public.sd_detect_column('chat_users', array['updated_at']) is not null;

  if p_delta < 0 then
    v_sql := format(
      'update public.chat_users set %I = %I + $1 %s where %I = $2 and %I >= $3 returning %I::integer',
      v_points_col, v_points_col,
      case when v_has_upd then ', updated_at = now()' else '' end,
      v_name_col, v_points_col, v_points_col
    );
    execute v_sql into v_balance using p_delta, v_name, -p_delta;

    if v_balance is null then
      raise exception 'insufficient_points';
    end if;
  else
    v_sql := format(
      'update public.chat_users set %I = %I + $1 %s where %I = $2 returning %I::integer',
      v_points_col, v_points_col,
      case when v_has_upd then ', updated_at = now()' else '' end,
      v_name_col, v_points_col
    );
    execute v_sql into v_balance using p_delta, v_name;

    if v_balance is null then
      raise exception 'no_points_account';
    end if;
  end if;

  return v_balance;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Diagnostic
-- ---------------------------------------------------------------------
create or replace function public.sd_mapping_report()
returns table (element text, detected text, status text)
language sql
stable
security definer
set search_path = public
as $$
  select 'account_links -> utilisateur'::text,
         coalesce(public.sd_link_user_column(), '-')::text,
         (case when public.sd_link_user_column() is null then 'A CORRIGER' else 'OK' end)::text
  union all
  select 'account_links -> pseudo Rumble'::text,
         coalesce(public.sd_link_name_column(), '-')::text,
         (case when public.sd_link_name_column() is null then 'A CORRIGER' else 'OK' end)::text
  union all
  select 'chat_users -> pseudo'::text,
         coalesce(public.sd_chat_name_column(), '-')::text,
         (case when public.sd_chat_name_column() is null then 'A CORRIGER' else 'OK' end)::text
  union all
  select 'chat_users -> points'::text,
         coalesce(public.sd_chat_points_column(), '-')::text,
         (case when public.sd_chat_points_column() is null then 'A CORRIGER' else 'OK' end)::text;
$$;

-- Si une ligne indique « A CORRIGER », listez les colonnes réelles avec :
--   select table_name, column_name, data_type
--   from information_schema.columns
--   where table_schema = 'public' and table_name in ('account_links', 'chat_users')
--   order by table_name, ordinal_position;
-- puis ajoutez le nom manquant au tableau de candidats de la fonction concernée.

-- ---------------------------------------------------------------------
-- 6. Variantes tolérantes (pour les écrans d'administration)
-- ---------------------------------------------------------------------
-- Une correspondance de colonne introuvable ne doit pas vider une liste
-- entière : ces variantes renvoient NULL au lieu de lever une exception.
create or replace function public.sd_rumble_username_safe(p_user uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return public.sd_rumble_username(p_user);
exception when others then
  return null;
end;
$$;

create or replace function public.sd_points_balance_safe(p_user uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return public.sd_points_balance(p_user);
exception when others then
  return null;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Auto-test — répond à « pourquoi ma liste est vide ? »
-- ---------------------------------------------------------------------
create or replace function public.sd_count_safe(p_schema text, p_table text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  execute format('select count(*)::integer from %I.%I', p_schema, p_table) into v_count;
  return v_count::text;
exception when others then
  return 'inaccessible (' || SQLERRM || ')';
end;
$$;

create or replace function public.sd_selftest()
returns table (element text, value text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_admin text;
  v_name  text;
begin
  begin
    v_admin := public.is_admin()::text;
  exception when others then
    v_admin := 'erreur : ' || SQLERRM;
  end;

  v_name := public.sd_rumble_username_safe(auth.uid());

  return query
  select 'is_admin()'::text, coalesce(v_admin, 'null')::text
  union all
  select 'e-mail du JWT'::text, coalesce(auth.jwt() ->> 'email', '(aucun)')::text
  union all
  select 'account_links -> colonne utilisateur'::text,
         coalesce(public.sd_link_user_column(), 'INTROUVABLE')::text
  union all
  select 'account_links -> colonne pseudo'::text,
         coalesce(public.sd_link_name_column(), 'INTROUVABLE')::text
  union all
  select 'chat_users -> colonne pseudo'::text,
         coalesce(public.sd_chat_name_column(), 'INTROUVABLE')::text
  union all
  select 'chat_users -> colonne points'::text,
         coalesce(public.sd_chat_points_column(), 'INTROUVABLE')::text
  union all
  select 'lignes auth.users'::text, public.sd_count_safe('auth', 'users')
  union all
  select 'lignes account_links'::text, public.sd_count_safe('public', 'account_links')
  union all
  select 'lignes chat_users'::text, public.sd_count_safe('public', 'chat_users')
  union all
  select 'lignes tickets'::text, public.sd_count_safe('public', 'tickets')
  union all
  select 'mon pseudo Rumble résolu'::text, coalesce(v_name, 'non résolu')::text
  union all
  select 'mon solde de points'::text,
         coalesce(public.sd_points_balance_safe(auth.uid())::text, 'non résolu')::text;
end;
$$;

-- Colonnes réellement présentes, pour compléter les listes de candidats.
create or replace function public.sd_columns_report()
returns table (table_name text, columns text)
language sql
stable
security definer
set search_path = public
as $$
  select c.table_name::text, string_agg(c.column_name::text, ', ' order by c.ordinal_position)
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name::text in ('account_links', 'chat_users')
  group by c.table_name::text;
$$;

-- ---------------------------------------------------------------------
-- 6. Droits
-- ---------------------------------------------------------------------
revoke all on function public.sd_detect_column(text, text[]) from public;
revoke all on function public.sd_link_user_column() from public;
revoke all on function public.sd_link_name_column() from public;
revoke all on function public.sd_chat_name_column() from public;
revoke all on function public.sd_chat_points_column() from public;
revoke all on function public.sd_rumble_username(uuid) from public;
revoke all on function public.sd_points_balance(uuid) from public;
revoke all on function public.sd_adjust_points(uuid, integer) from public;
revoke all on function public.sd_mapping_report() from public;

revoke all on function public.sd_rumble_username_safe(uuid) from public;
revoke all on function public.sd_points_balance_safe(uuid) from public;
revoke all on function public.sd_count_safe(text, text) from public;
revoke all on function public.sd_selftest() from public;
revoke all on function public.sd_columns_report() from public;

grant execute on function public.sd_rumble_username(uuid) to authenticated;
grant execute on function public.sd_points_balance(uuid) to authenticated;
grant execute on function public.sd_mapping_report() to authenticated;
grant execute on function public.sd_rumble_username_safe(uuid) to authenticated;
grant execute on function public.sd_points_balance_safe(uuid) to authenticated;
grant execute on function public.sd_selftest() to authenticated;
grant execute on function public.sd_columns_report() to authenticated;
-- sd_adjust_points n'est jamais appelée depuis l'application : uniquement
-- depuis les fonctions security definer du blackjack et des tickets.
