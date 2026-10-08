-- Schema de inicialização do Democracy Box (Supabase / Postgres)
-- Extensões necessárias
create extension if not exists "pgcrypto";

-- 1. Tabela: candidates
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- 2. Tabela: chapas
create table if not exists public.chapas (
  id uuid primary key default gen_random_uuid(),
  number int unique not null,
  candidate_ids jsonb not null,
  created_at timestamptz not null default now()
);

-- 3. Tabela: election_settings (linha única)
create table if not exists public.election_settings (
  id int primary key check (id = 1),
  is_open boolean not null default false,
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Garante existência da linha padrão (estado draft inicial)
insert into public.election_settings (id, is_open, opened_at, closed_at)
values (1, false, null, null)
on conflict (id) do nothing;

-- 4. Tabela: votes (sem voter_id para garantir sigilo absoluto)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  chapa_id uuid not null references public.chapas(id) on delete restrict,
  code text unique not null,
  created_at timestamptz not null default now()
);

-- 5. Tabela: voter_receipts (registra APENAS que o eleitor já votou, sem ligar ao voto)
create table if not exists public.voter_receipts (
  voter_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Triggers de integridade para candidatos e chapas
create or replace function public.check_candidates_integrity()
returns trigger
language plpgsql
as $$
declare
  total_candidates int;
  total_chapas int;
begin
  select count(*) into total_chapas from public.chapas;

  if (TG_OP = 'INSERT') then
    if total_chapas > 0 then
      raise exception 'CHAPAS_EXIST: Não é permitido adicionar candidatos após chapas terem sido geradas.';
    end if;
    select count(*) into total_candidates from public.candidates;
    if total_candidates >= 5 then
      raise exception 'MAX_CANDIDATES: Máximo de 5 candidatos permitido.';
    end if;
  elsif (TG_OP = 'DELETE') then
    if total_chapas > 0 then
      raise exception 'CHAPAS_EXIST: Não é permitido excluir candidatos após chapas terem sido geradas.';
    end if;
  end if;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_candidates_integrity on public.candidates;
create trigger trg_candidates_integrity
before insert or delete on public.candidates
for each row execute function public.check_candidates_integrity();

-- Habilitar Row Level Security (RLS)
alter table public.candidates enable row level security;
alter table public.chapas enable row level security;
alter table public.election_settings enable row level security;
alter table public.votes enable row level security;
alter table public.voter_receipts enable row level security;

-- Políticas de RLS:
-- Leitura pública para candidatos, chapas e configurações
drop policy if exists "Allow public select on candidates" on public.candidates;
create policy "Allow public select on candidates" on public.candidates for select using (true);

drop policy if exists "Allow public select on chapas" on public.chapas;
create policy "Allow public select on chapas" on public.chapas for select using (true);

drop policy if exists "Allow public select on election_settings" on public.election_settings;
create policy "Allow public select on election_settings" on public.election_settings for select using (true);

-- votes e voter_receipts NÃO possuem políticas de acesso direto (nem select nem insert para anon/authenticated)
-- Todo o acesso se dá via RPCs com SECURITY DEFINER.

-- Função RPC: has_voted()
create or replace function public.has_voted()
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  return exists (select 1 from public.voter_receipts where voter_id = auth.uid());
end;
$$;

-- Função RPC: cast_vote(p_chapa_id uuid)
create or replace function public.cast_vote(p_chapa_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_voter_id uuid := auth.uid();
  v_is_open boolean;
  v_closed_at timestamptz;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 símbolos legíveis
  v_code text;
  v_random_bytes bytea;
  v_part text;
  v_attempts int := 0;
  v_chapa_exists boolean;
begin
  if v_voter_id is null then
    raise exception 'UNAUTHENTICATED: Usuário não autenticado.' using errcode = '28000';
  end if;

  -- 1. Verifica estado da eleição
  select is_open, closed_at into v_is_open, v_closed_at from public.election_settings where id = 1;
  if not coalesce(v_is_open, false) or v_closed_at is not null then
    raise exception 'ELECTION_NOT_OPEN: A eleição não está aberta para votação.' using errcode = 'P0001';
  end if;

  -- 2. Valida chapa
  select exists(select 1 from public.chapas where id = p_chapa_id) into v_chapa_exists;
  if not v_chapa_exists then
    raise exception 'CHAPA_NOT_FOUND: Chapa informada não existe.' using errcode = 'P0001';
  end if;

  -- 3. Registra recibo (se já votou, violação de PK única)
  begin
    insert into public.voter_receipts (voter_id) values (v_voter_id);
  exception when unique_violation then
    raise exception 'ALREADY_VOTED: Eleitor já realizou o voto nesta eleição.' using errcode = 'P0001';
  end if;

  -- 4. Gera código VR-XXXX-XXXX-XXXX com retry em caso de colisão
  loop
    v_attempts := v_attempts + 1;
    v_random_bytes := gen_random_bytes(12);
    v_part := '';
    for i in 0..11 loop
      v_part := v_part || substr(v_alphabet, (get_byte(v_random_bytes, i) % 32) + 1, 1);
    end loop;
    v_code := 'VR-' || substr(v_part, 1, 4) || '-' || substr(v_part, 5, 4) || '-' || substr(v_part, 9, 4);

    begin
      insert into public.votes (chapa_id, code) values (p_chapa_id, v_code);
      exit; -- Inserção com sucesso
    exception when unique_violation then
      if v_attempts >= 5 then
        raise exception 'INTERNAL: Falha ao gerar código único de voto.' using errcode = 'P0001';
      end if;
    end;
  end loop;

  return v_code;
end;
$$;

-- Função RPC: validate_vote(p_code text)
create or replace function public.validate_vote(p_code text)
returns table (
  chapa_number int,
  candidate_ids jsonb
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select c.number, c.candidate_ids
  from public.votes v
  join public.chapas c on c.id = v.chapa_id
  where v.code = p_code;
end;
$$;

-- Função RPC: chapa_vote_counts()
-- Só retorna dados se a eleição estiver encerrada!
create or replace function public.chapa_vote_counts()
returns table (
  chapa_id uuid,
  number int,
  candidate_ids jsonb,
  votes bigint
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_closed_at timestamptz;
begin
  select closed_at into v_closed_at from public.election_settings where id = 1;
  if v_closed_at is null then
    raise exception 'ELECTION_NOT_CLOSED: A apuração só fica disponível após o encerramento da eleição.' using errcode = 'P0001';
  end if;

  return query
  select c.id, c.number, c.candidate_ids, count(v.id) as votes
  from public.chapas c
  left join public.votes v on v.chapa_id = c.id
  group by c.id, c.number, c.candidate_ids
  order by c.number asc;
end;
$$;

-- Concessão de permissões de execução
revoke all on function public.cast_vote(uuid) from public;
revoke all on function public.has_voted() from public;
revoke all on function public.validate_vote(text) from public;
revoke all on function public.chapa_vote_counts() from public;

grant execute on function public.cast_vote(uuid) to authenticated;
grant execute on function public.has_voted() to authenticated;
grant execute on function public.validate_vote(text) to anon, authenticated;
grant execute on function public.chapa_vote_counts() to anon, authenticated;

-- Bucket para fotos dos candidatos
insert into storage.buckets (id, name, public)
values ('candidate-photos', 'candidate-photos', true)
on conflict (id) do nothing;
