# Democracy Box — Design (Voto por Ranking / IRV)

Data: 2026-10-08 · Status: aprovado em conversa, aguardando revisão da spec escrita.

## 1. Objetivo

Sistema web **educativo e transparente** que demonstra o Voto por Ranking
(Instant-Runoff Voting). Sucesso = um admin cadastra até 5 candidatos, gera as
chapas, abre a votação; eleitores autenticados votam uma única vez e recebem um
código verificável; qualquer pessoa valida um código sem descobrir o eleitor;
após o encerramento, a apuração IRV é exibida rodada a rodada.

## 2. Decisões (o que foi dito vs. assumido)

| Tema | Decisão | Origem |
|---|---|---|
| Stack | Next.js 15 App Router, TS strict, Tailwind, shadcn/ui, Supabase (`@supabase/ssr`), Vercel | Regra do projeto |
| Node | 24.21.0 via nvm, `.nvmrc` | Regra global |
| Nº de candidatos | **Máximo 5** → até 325 chapas | Usuário |
| Admin | E-mails em `ADMIN_EMAILS` (env, server-only) | Usuário |
| Login eleitor | E-mail+senha (cadastro aberto) **e** Magic Link | Usuário |
| Supabase | Ainda não existe → código + migrations + instruções | Usuário |
| Sigilo | `voter_receipts` separado de `votes` (sem `voter_id` em `votes`) | Proposto e aprovado |
| Encerramento | Irreversível | Proposto e aprovado |
| Candidatos após chapas | Add/delete bloqueados; edição de nome/bio/foto permitida | Proposto e aprovado |
| Testes | Vitest para lógica pura (permutações, IRV, código) | Assumido |

## 3. Arquitetura

```
src/
  app/
    page.tsx                    # landing
    como-funciona/page.tsx      # educativo + resultado se encerrada
    resultado/page.tsx          # apuração detalhada
    validar/page.tsx            # público
    login/page.tsx              # senha + magic link + cadastro
    auth/callback/route.ts      # troca code -> sessão
    votar/page.tsx              # protegido (eleitor)
    admin/
      page.tsx                  # painel (status eleição)
      candidatos/page.tsx
      chapas/page.tsx
    actions/                    # Server Actions
      auth.ts  candidates.ts  chapas.ts  election.ts  vote.ts  validate.ts
  components/
    ui/                         # shadcn
    candidate-avatar.tsx  chapa-card.tsx  chapa-list.tsx (busca/filtro)
    rounds-table.tsx  results-summary.tsx  site-header.tsx  ...
  lib/
    ranked/
      permutations.ts           # geração de chapas (puro)
      irv.ts                    # contagem IRV (puro)
      vote-code.ts              # formato/normalização do código (puro)
    supabase/
      server.ts  client.ts  admin.ts (service role, server-only)  middleware.ts
    auth/admin.ts               # isAdminEmail / requireAdmin
    election/queries.ts         # leituras tipadas
    env.ts                      # validação de env
  types/
    domain.ts                   # Candidate, Chapa, Vote, ElectionSettings, IrvResult...
    database.ts                 # tipos das tabelas
  middleware.ts
supabase/migrations/0001_init.sql
README.md  .env.example  .nvmrc
```

## 4. Modelo de dados

- `candidates(id uuid pk, name text not null, description text, photo_url text, created_at timestamptz)`
  - Trigger: bloqueia INSERT se já houver 5 candidatos ou se existirem chapas;
    bloqueia DELETE se existirem chapas.
- `chapas(id uuid pk, number int unique not null, candidate_ids jsonb not null, created_at)`
  - `candidate_ids`: array de 1..5 UUIDs distintos, ordenado (1ª preferência primeiro).
- `votes(id uuid pk, chapa_id uuid fk → chapas, code text unique not null, created_at)`
  - **Sem** `voter_id` (sigilo).
- `voter_receipts(voter_id uuid pk fk → auth.users, created_at)`
  - Prova apenas que a pessoa votou. PK impede voto duplo.
- `election_settings(id int pk check (id = 1), is_open bool default false, opened_at, closed_at, created_at)`
  - Linha única. Estados derivados: rascunho (`!is_open && closed_at is null`),
    aberta (`is_open`), encerrada (`closed_at is not null`).

### RLS
- `candidates`, `chapas`, `election_settings`: SELECT público; sem políticas de escrita
  (escrita só via service role nas Server Actions).
- `votes`, `voter_receipts`: sem SELECT/INSERT para `anon`/`authenticated`.
  Acesso somente via funções `SECURITY DEFINER`.

### Funções SQL
- `cast_vote(p_chapa_id uuid) returns text` — `SECURITY DEFINER`, `search_path` fixo.
  Exige `auth.uid()`; exige eleição aberta; valida chapa; insere recibo
  (`unique_violation` → erro "já votou"); gera código com `gen_random_bytes` sobre
  alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 símbolos, 12 chars ≈ 60 bits),
  formato `VR-XXXX-XXXX-XXXX`; tenta até 5 vezes em colisão; tudo numa transação.
  Concedida apenas a `authenticated`.
- `has_voted() returns boolean` — para a UI do eleitor.
- `validate_vote(p_code text) returns table(chapa_number int, candidate_ids jsonb)` —
  pública; não retorna nada sobre o eleitor.
- `chapa_vote_counts() returns table(chapa_id uuid, number int, candidate_ids jsonb, votes bigint)` —
  pública; **retorna erro se a eleição não estiver encerrada**.

### Storage
- Bucket `candidate-photos`, leitura pública, escrita só via service role.
- Server Action valida MIME (`image/jpeg|png|webp`), extensão e tamanho ≤ 2 MB;
  nome do objeto = UUID gerado no servidor (nunca o nome original).

## 5. Fluxos

**Admin** (todas as actions chamam `requireAdmin()`: sessão válida + e-mail em
`ADMIN_EMAILS`, comparação case-insensitive; só então usa o cliente service role):
- CRUD de candidatos (com regras de bloqueio acima).
- `generateChapas()`: só em rascunho e sem votos; apaga chapas antigas e insere novas.
- `openElection()`: exige chapas; `closeElection()`: exige aberta; irreversível.

**Geração de chapas** (`permutations.ts`): para k = 1..min(5, n), todas as
permutações ordenadas de k candidatos (ordem base: `created_at`). Ordenação
final: por tamanho, depois lexicográfica pelos índices. Numeração sequencial
começando em 1, exibida com 2 dígitos (`01`, `02`…, `325`).

**Voto**: `/votar` lista chapas com busca (nome de candidato) e filtros
(tamanho da chapa, 1ª preferência). Seleção → diálogo de confirmação →
`castVote` (Server Action → RPC). Sucesso mostra o código com botão copiar.
Se já votou, mostra aviso; se eleição não aberta, mostra estado adequado.

**Validação**: `/validar` normaliza entrada (maiúsculas, remove espaços, aceita
sem hífens) e valida o formato antes do RPC. Resposta: válido/inválido, nº da
chapa e candidatos em ordem.

**Apuração** (`irv.ts`, puro):
- Entrada: lista de `{ ranking: CandidateId[], count: number }` + lista de candidatos.
- Cada rodada: cada cédula conta para o candidato não eliminado mais bem ranqueado;
  cédulas sem candidato restante são **esgotadas** (reportadas por rodada).
- Vence quem tiver **> 50% das cédulas ativas** na rodada; se restar 1 candidato, vence.
- Senão elimina o menor. Desempate: menos votos na rodada anterior (recursivo
  até a 1ª rodada); persistindo, o cadastrado por último (`created_at`). Regra
  documentada na UI.
- Zero votos → resultado "sem votos", sem vencedor.
- Saída: rodadas `{ tallies, exhausted, activeBallots, eliminated, tieBreak? }`,
  vencedor, votos por chapa.

## 6. Erros e feedback
- Server Actions retornam `ActionResult<T> = { ok: true, data } | { ok: false, error: { code, message } }`.
  Códigos: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION`, `CONFLICT`, `NOT_FOUND`, `ELECTION_STATE`, `INTERNAL`.
- Erros SQL mapeados por `SQLSTATE`/mensagem para esses códigos; mensagens ao
  usuário em pt-BR, sem detalhes internos; sem `console.log` de dados sensíveis.
- Botões com estados loading/disabled; toasts de sucesso/erro.

## 7. UI
Tema escuro com gradientes sutis (tokens CSS no `globals.css` + Tailwind),
fonte Inter/Outfit, animações discretas, responsivo, acessível (labels, foco
visível, `aria-live` para resultados, informação não dependente só de cor).

## 8. Testes e verificação
- Vitest: `permutations` (contagens 1..5 → 1, 4, 15, 64, 325; ordem; unicidade),
  `irv` (maioria 1ª rodada, multi-rodadas, esgotadas, empates, zero votos),
  `vote-code` (normalização, formato).
- `npm run lint`, `npm run build`, `npm audit` antes de concluir.

## 9. Fora de escopo
Reabertura de eleição, múltiplas eleições, auditoria criptográfica avançada,
rate limiting dedicado (código de 60 bits torna enumeração inviável), i18n.
