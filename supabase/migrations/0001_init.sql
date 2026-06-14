-- Ekié — schéma initial (Phase 5)
-- Modèle léger : les villes/quartiers restent en données de référence côté app ;
-- la BDD gère le DYNAMIQUE = signalements (events) + abonnements, et calcule l'état.

-- ───────────────────────── Tables ─────────────────────────
create table if not exists signalements (
  id          uuid primary key default gen_random_uuid(),
  quartier_id text not null,
  type        text not null check (type in ('coupure','retablissement')),
  device_id   text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_signalements_quartier_date
  on signalements (quartier_id, created_at desc);

create table if not exists abonnements (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null,
  quartier_id text not null,
  push_token  jsonb,
  created_at  timestamptz not null default now(),
  unique (device_id, quartier_id)
);

-- ───────────────────────── RLS ─────────────────────────
alter table signalements enable row level security;
alter table abonnements  enable row level security;

-- lecture publique des signalements (sert au calcul d'état)
drop policy if exists "read signalements" on signalements;
create policy "read signalements" on signalements for select using (true);
-- ⚠️ pas de policy INSERT → l'écriture passe UNIQUEMENT par la RPC signaler() (anti-spam garanti)

-- abonnements : gérés par l'appareil (device-based, pas de login)
drop policy if exists "read abos"   on abonnements;
drop policy if exists "insert abos" on abonnements;
drop policy if exists "delete abos" on abonnements;
create policy "read abos"   on abonnements for select using (true);
create policy "insert abos" on abonnements for insert with check (true);
create policy "delete abos" on abonnements for delete using (true);

-- ───────────────────────── RPC : signaler (anti-spam 30 min) ─────────────────────────
create or replace function signaler(p_quartier text, p_type text, p_device text)
returns json language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  if p_type not in ('coupure','retablissement') then
    return json_build_object('ok', false, 'error', 'type_invalide');
  end if;

  select count(*) into recent from signalements
   where quartier_id = p_quartier
     and device_id   = p_device
     and created_at  > now() - interval '30 minutes';

  if recent > 0 then
    return json_build_object('ok', false, 'error', 'deja_signale');
  end if;

  insert into signalements (quartier_id, type, device_id)
  values (p_quartier, p_type, p_device);

  return json_build_object('ok', true);
end; $$;
grant execute on function signaler(text,text,text) to anon, authenticated;

-- ───────────────────────── RPC : etats (état courant par quartier) ─────────────────────────
-- État = dernier signalement < 6h ; nb = nombre de signalements < 6h. (Règles D5/D6)
create or replace function etats()
returns table (quartier_id text, etat text, depuis timestamptz, nb int)
language sql stable set search_path = public as $$
  with recents as (
    select * from signalements where created_at > now() - interval '6 hours'
  ),
  last as (
    select distinct on (quartier_id) quartier_id, type, created_at
    from recents
    order by quartier_id, created_at desc
  )
  select l.quartier_id,
         case when l.type = 'coupure' then 'coupe' else 'ok' end,
         l.created_at,
         (select count(*) from recents r where r.quartier_id = l.quartier_id)::int
  from last l;
$$;
grant execute on function etats() to anon, authenticated;

-- ───────────────────────── Realtime ─────────────────────────
-- diffuse les nouveaux signalements en direct aux clients abonnés
alter publication supabase_realtime add table signalements;
