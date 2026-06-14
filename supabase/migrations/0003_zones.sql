-- Zones partagées : stocke les coordonnées des quartiers (surtout géocodés)
-- pour que TOUTE zone signalée soit visible par TOUS les utilisateurs.
create table if not exists zones (
  id         text primary key,
  nom        text,
  ville      text,
  lat        float8,
  lng        float8,
  created_at timestamptz default now()
);
alter table zones enable row level security;
drop policy if exists "read zones" on zones;
create policy "read zones" on zones for select using (true);

-- upsert d'une zone (appelé quand on choisit/signale une zone)
create or replace function register_zone(p_id text, p_nom text, p_ville text, p_lat float8, p_lng float8)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into zones (id, nom, ville, lat, lng)
  values (p_id, p_nom, p_ville, p_lat, p_lng)
  on conflict (id) do update
    set nom = excluded.nom, ville = excluded.ville, lat = excluded.lat, lng = excluded.lng;
end; $$;
grant execute on function register_zone(text, text, text, float8, float8) to anon, authenticated;

-- etats() renvoie désormais aussi nom + coordonnées (jointure zones)
drop function if exists etats();
create or replace function etats()
returns table (quartier_id text, etat text, depuis timestamptz, nb int, nom text, lat float8, lng float8)
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
         (select count(*) from recents r
           where r.quartier_id = l.quartier_id and r.type = l.type)::int,
         z.nom, z.lat, z.lng
  from last l
  left join zones z on z.id = l.quartier_id;
$$;
grant execute on function etats() to anon, authenticated;
