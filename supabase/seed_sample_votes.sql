-- ==============================================================================
-- INJEÇÃO DE VOTOS DE SIMULAÇÃO — DEMOCRACY BOX (OPCIONAL)
-- Use este script se quiser gerar votos de teste para ver as rodadas de
-- eliminação do Instant-Runoff Voting (IRV) na página /resultado.
-- ==============================================================================

do $$
declare
  chapa_record record;
  i int;
  random_code text;
begin
  -- Distribui votos simulados entre as chapas existentes
  for chapa_record in (select id, number from public.chapas order by random()) loop
    -- Gera entre 1 e 5 votos para cada chapa
    for i in 1 .. (1 + floor(random() * 5)::int) loop
      random_code := 'VR-' || 
                     upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
                     upper(substring(md5(random()::text) from 5 for 4)) || '-' ||
                     upper(substring(md5(random()::text) from 9 for 4));

      insert into public.votes (id, chapa_id, code, created_at)
      values (gen_random_uuid(), chapa_record.id, random_code, now() - (random() * interval '2 hours'));
    end loop;
  end loop;
end $$;

-- Confere o total de votos gerados:
select count(*) as "Total de Cédulas Depositadas" from public.votes;
