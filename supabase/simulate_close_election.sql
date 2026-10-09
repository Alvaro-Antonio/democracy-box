-- ==============================================================================
-- SIMULAÇÃO DE ENCERRAMENTO DA ELEIÇÃO — DEMOCRACY BOX
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. ENCERRAR A ELEIÇÃO (Desativa a urna e libera a apuração pública em /resultado)
update public.election_settings
set 
  is_open = false,
  opened_at = coalesce(opened_at, now() - interval '1 hour'),
  closed_at = now()
where id = 1;

-- 2. VERIFICAR O STATUS ATUAL DA ELEIÇÃO
select 
  id,
  is_open as "Aberta?",
  opened_at as "Aberta em",
  closed_at as "Encerrada em",
  case
    when closed_at is not null then 'CLOSED (Apuração Disponível)'
    when is_open = true then 'OPEN (Votação em Andamento)'
    else 'DRAFT (Não Aberta)'
  end as "Status da Eleição"
from public.election_settings
where id = 1;

-- 3. VERIFICAR TOTAL DE VOTOS COMPUTADOS POR CHAPA
select 
  c.number as "Chapa #",
  count(v.id) as "Total de Votos"
from public.chapas c
left join public.votes v on v.chapa_id = c.id
group by c.id, c.number
order by c.number asc;

-- ==============================================================================
-- COMANDOS AUXILIARES ÚTEIS (Execute se necessário):
-- ==============================================================================

-- PARA REABRIR A ELEIÇÃO PARA NOVOS TESTES DE VOTAÇÃO:
-- update public.election_settings
-- set is_open = true, opened_at = now(), closed_at = null
-- where id = 1;

-- PARA RESETAR A ELEIÇÃO PARA O ESTADO INICIAL (RASCUNHO / DRAFT):
-- update public.election_settings
-- set is_open = false, opened_at = null, closed_at = null
-- where id = 1;
