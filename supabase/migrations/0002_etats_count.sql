-- Fix du compteur : nb = nombre de signalements qui CONFIRMENT l'état actuel
-- (même type que le dernier signalement), pas le total coupures+rétablissements.
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
         (select count(*) from recents r
           where r.quartier_id = l.quartier_id and r.type = l.type)::int
  from last l;
$$;
grant execute on function etats() to anon, authenticated;
