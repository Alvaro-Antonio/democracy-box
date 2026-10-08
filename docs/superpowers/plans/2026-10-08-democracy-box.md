# Democracy Box Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema web educativo de Voto por Ranking (IRV) com admin, geração de chapas, votação com código verificável, validação pública e apuração rodada a rodada.

**Architecture:** Next.js 15 App Router com Server Components e Server Actions; lógica de domínio pura em `src/lib/ranked/` (testada com Vitest); Supabase para Auth, Postgres (RLS + funções `SECURITY DEFINER` para voto/validação/contagem) e Storage. Escritas administrativas só via Server Actions com cliente service role após `requireAdmin()`.

**Tech Stack:** Node 24.21.0, Next.js 15, React 19, TypeScript strict, Tailwind CSS, shadcn/ui, `@supabase/ssr`, `@supabase/supabase-js`, Vitest, `server-only`, `zod`.

**Spec:** `docs/superpowers/specs/2026-10-08-democracy-box-design.md`

## Global Constraints

- Node `24.21.0` (`nvm use 24.21.0`); `.nvmrc` contém `24.21.0`.
- TypeScript `strict: true`; sem `any`; sem `as` sem validação.
- Máximo de **5** candidatos; chapas de 1..5 candidatos; 5 candidatos → **325** chapas.
- Código de voto: `VR-XXXX-XXXX-XXXX`, alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- Fotos: `image/jpeg`, `image/png`, `image/webp`; ≤ `2 * 1024 * 1024` bytes; bucket `candidate-photos`.
- `ADMIN_EMAILS` (vírgula), `SUPABASE_SERVICE_ROLE_KEY` são server-only; nunca `NEXT_PUBLIC_`.
- `votes` não possui `voter_id`. Encerramento irreversível.
- Mensagens ao usuário em pt-BR; sem `console.log` de dados sensíveis.
- Antes de concluir: `npm run test`, `npm run lint`, `npm run build`, `npm audit`.

## Review Focus

1. Código digitado em minúsculas, com espaços ou sem hífens → normalizado e aceito (Task 2).
2. Duplo clique / duas abas votando ao mesmo tempo → exatamente um voto; o segundo recebe "Você já votou" (Task 5 SQL via PK em `voter_receipts`; Task 11 botão desabilitado).
3. `ADMIN_EMAILS` com espaços/maiúsculas (`" Admin@X.com ,b@y.com"`) → comparação funciona; lista vazia → ninguém é admin (Task 6).
4. Upload com MIME declarado `image/png` mas bytes de outro tipo → rejeitado por magic bytes (Task 9).
5. Acessar contagem antes de encerrar / votar fora do período → estado claro, sem vazamento de parcial (Task 5 SQL + Tasks 11/13).

---

### Task 1: Scaffold do projeto

**Files:**
- Create: projeto Next.js na raiz (`package.json`, `tsconfig.json`, `src/app/*`, `next.config.ts`, `eslint.config.mjs`), `.nvmrc`, `.env.example`, `vitest.config.ts`, `src/lib/env.ts`, `components.json` (shadcn)

**Interfaces:**
- Produces: `serverEnv(): { supabaseUrl: string; supabaseAnonKey: string; serviceRoleKey: string; adminEmails: string[] }` (server-only, lança erro descritivo se faltar), `publicEnv: { supabaseUrl: string; supabaseAnonKey: string }`. Scripts `dev`, `build`, `lint`, `test` (`vitest run`).

- [ ] **Step 1:** `nvm use 24.21.0`; `npx -y create-next-app@15 --help`; criar em diretório temporário com `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack` e mover para a raiz (raiz já tem `docs/`, `.agents/`).
- [ ] **Step 2:** Instalar `@supabase/ssr @supabase/supabase-js zod server-only` e dev `vitest`; `npx shadcn@latest init` (tema dark, neutro) e adicionar `button card input label textarea dialog badge table sonner tabs alert separator`.
- [ ] **Step 3:** Escrever `.nvmrc`, `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`), `src/lib/env.ts`, `vitest.config.ts` (alias `@`→`src`).
- [ ] **Step 4:** Run `npm run build` e `npm run lint` → sucesso.
- [ ] **Step 5:** Commit `chore: scaffold Next.js 15 + Supabase + shadcn`.

### Task 2: Tipos de domínio e código de voto

**Files:**
- Create: `src/types/domain.ts`, `src/lib/ranked/vote-code.ts`, `src/lib/ranked/vote-code.test.ts`

**Interfaces:**
- Produces (`domain.ts`): `type CandidateId = string`; `interface Candidate { id; name; description: string | null; photoUrl: string | null; createdAt: string }`; `interface Chapa { id: string; number: number; candidateIds: CandidateId[] }`; `type ElectionStatus = 'draft' | 'open' | 'closed'`; `interface ElectionSettings { isOpen: boolean; openedAt: string | null; closedAt: string | null; status: ElectionStatus }`; `type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: ActionErrorCode; message: string } }`; `type ActionErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'CONFLICT' | 'NOT_FOUND' | 'ELECTION_STATE' | 'INTERNAL'`.
- Produces (`vote-code.ts`): `VOTE_CODE_ALPHABET`, `normalizeVoteCode(input: string): string | null` (retorna formato canônico ou `null`), `formatChapaNumber(n: number): string`.

- [ ] **Step 1: Testes**
```ts
expect(normalizeVoteCode('VR-ABCD-EFGH-JKLM')).toBe('VR-ABCD-EFGH-JKLM');
expect(normalizeVoteCode(' vr abcd efgh jklm ')).toBe('VR-ABCD-EFGH-JKLM');
expect(normalizeVoteCode('VRABCDEFGHJKLM')).toBe('VR-ABCD-EFGH-JKLM');
expect(normalizeVoteCode('ABCD-EFGH-JKLM')).toBe('VR-ABCD-EFGH-JKLM');
expect(normalizeVoteCode('VR-ABCD-EFGH-JKL0')).toBeNull(); // 0 fora do alfabeto
expect(normalizeVoteCode('VR-ABCD')).toBeNull();
expect(formatChapaNumber(1)).toBe('01');
expect(formatChapaNumber(325)).toBe('325');
```
- [ ] **Step 2:** `npx vitest run src/lib/ranked/vote-code.test.ts` → FAIL.
- [ ] **Step 3:** Implementar (remove não-alfanuméricos, uppercase, remove prefixo `VR`, exige 12 chars do alfabeto).
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: domain types and vote code normalization`.

### Task 3: Geração de chapas (permutações)

**Files:**
- Create: `src/lib/ranked/permutations.ts`, `src/lib/ranked/permutations.test.ts`

**Interfaces:**
- Produces: `MAX_CANDIDATES = 5`, `MAX_CHAPA_SIZE = 5`, `generateChapaRankings(candidateIds: readonly CandidateId[]): CandidateId[][]` (lança se > 5 ou ids duplicados).

- [ ] **Step 1: Testes**
```ts
const ids = (n: number) => ['a','b','c','d','e'].slice(0, n);
expect([0,1,2,3,4,5].map(n => generateChapaRankings(ids(n)).length)).toEqual([0,1,4,15,64,325]);
expect(generateChapaRankings(ids(2))).toEqual([['a'],['b'],['a','b'],['b','a']]);
const r = generateChapaRankings(ids(5));
expect(new Set(r.map(x => x.join())).size).toBe(325);
expect(r.every(x => new Set(x).size === x.length)).toBe(true);
expect(() => generateChapaRankings(['a','b','c','d','e','f'])).toThrow();
expect(() => generateChapaRankings(['a','a'])).toThrow();
```
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Implementar: para k = 1..n, permutações de tamanho k por backtracking em ordem de índice (gera lexicográfica naturalmente), concatenadas por k. Comentar o algoritmo.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: chapa permutation generator`.

### Task 4: Contagem IRV

**Files:**
- Create: `src/lib/ranked/irv.ts`, `src/lib/ranked/irv.test.ts`

**Interfaces:**
- Consumes: `CandidateId`.
- Produces:
```ts
interface BallotGroup { ranking: CandidateId[]; count: number }
interface IrvRound { round: number; tallies: Record<CandidateId, number>; activeBallots: number; exhausted: number; eliminated: CandidateId | null; tieBreak: 'previous-round' | 'registration-order' | null }
interface IrvResult { totalBallots: number; rounds: IrvRound[]; winner: CandidateId | null }
function runInstantRunoff(candidates: readonly CandidateId[] /* em ordem de cadastro */, ballots: readonly BallotGroup[]): IrvResult
```

- [ ] **Step 1: Testes** (candidatos `A,B,C` nessa ordem de cadastro)
```ts
// maioria na 1ª rodada
r = run([{ranking:['A'],count:3},{ranking:['B'],count:1}]); expect(r.winner).toBe('A'); expect(r.rounds).toHaveLength(1);
// multi-rodada: A4 B3 C2(C>B) → C eliminado, B vence 5x4
r = run([{ranking:['A'],count:4},{ranking:['B'],count:3},{ranking:['C','B'],count:2}]);
expect(r.rounds[0].eliminated).toBe('C'); expect(r.winner).toBe('B'); expect(r.rounds[1].tallies).toEqual({A:4,B:5});
// esgotadas: A3 B2 C2(sem 2ª) → elimina por desempate, cédulas de C esgotam
r = run([{ranking:['A'],count:3},{ranking:['B'],count:2},{ranking:['C'],count:2}]);
expect(r.rounds[0].eliminated).toBe('C'); expect(r.rounds[0].tieBreak).toBe('registration-order');
expect(r.rounds[1].exhausted).toBe(2); expect(r.rounds[1].activeBallots).toBe(5); expect(r.winner).toBe('A');
// desempate por rodada anterior (candidatos A,B,C,D): A6 B3 C2 D1(D>C)
// R1 elimina D; R2 A6 B3 C3 → empate B/C, C tinha menos na R1 → C eliminado; R3 A6 B3, ativas 9 → A vence
r = runInstantRunoff(['A','B','C','D'], [{ranking:['A'],count:6},{ranking:['B'],count:3},{ranking:['C'],count:2},{ranking:['D','C'],count:1}]);
expect(r.rounds[1].eliminated).toBe('C'); expect(r.rounds[1].tieBreak).toBe('previous-round');
expect(r.rounds[2].exhausted).toBe(3); expect(r.winner).toBe('A');
// zero votos
expect(run([]).winner).toBeNull(); expect(run([]).rounds).toEqual([]);
// candidato com 0 votos aparece em tallies com 0 e é eliminado primeiro
```
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Implementar conforme spec §5: tallies sobre não eliminados; vence se `votos * 2 > activeBallots` ou resta 1; senão elimina mínimo com desempate (rodadas anteriores de trás para frente; depois maior índice de cadastro). Comentários didáticos.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: instant-runoff tally`.

### Task 5: Schema SQL do Supabase

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `src/types/database.ts`

**Interfaces:**
- Produces RPCs: `cast_vote(p_chapa_id uuid) → text`, `has_voted() → boolean`, `validate_vote(p_code text) → table(chapa_number int, candidate_ids jsonb)`, `chapa_vote_counts() → table(chapa_id uuid, number int, candidate_ids jsonb, votes bigint)`. Erros levantados com `raise exception using errcode`: `'P0001'` + mensagens `ELECTION_NOT_OPEN`, `ALREADY_VOTED`, `CHAPA_NOT_FOUND`, `ELECTION_NOT_CLOSED`, `MAX_CANDIDATES`, `CHAPAS_EXIST`; `28000` para `UNAUTHENTICATED`.
- `database.ts`: tipos `Database` no formato do `supabase gen types` (escritos à mão) para as 5 tabelas e 4 funções.

- [ ] **Step 1:** Escrever tabelas, `pgcrypto`, linha única `election_settings (id=1)`, triggers de candidatos (§4), RLS (SELECT público em `candidates/chapas/election_settings`; nada em `votes/voter_receipts`), funções com `security definer set search_path = public, extensions`, `revoke all ... from public` e `grant execute` (`cast_vote`/`has_voted` → `authenticated`; `validate_vote`/`chapa_vote_counts` → `anon, authenticated`), bucket `candidate-photos` público via `insert into storage.buckets`.
- [ ] **Step 2:** Validar sintaxe: se Docker disponível, `npx supabase db start` + aplicar; caso contrário revisar manualmente e registrar no README que deve ser aplicado no SQL Editor.
- [ ] **Step 3:** Commit `feat: supabase schema, RLS and RPCs`.

### Task 6: Clientes Supabase, middleware e autorização

**Files:**
- Create: `src/lib/supabase/server.ts`, `client.ts`, `admin.ts`, `middleware.ts`; `src/middleware.ts`; `src/lib/auth/admin.ts`, `src/lib/auth/admin.test.ts`; `src/lib/errors.ts`, `src/lib/errors.test.ts`

**Interfaces:**
- Produces: `createServerSupabase(): Promise<SupabaseClient<Database>>`, `createBrowserSupabase()`, `createAdminSupabase()` (`import 'server-only'`), `parseAdminEmails(raw: string | undefined): string[]`, `isAdminEmail(email: string | null | undefined, admins: readonly string[]): boolean`, `getCurrentUser(): Promise<User | null>`, `requireUser(): Promise<User>` / `requireAdmin(): Promise<User>` (lançam `AppError`), `class AppError { code: ActionErrorCode }`, `mapRpcError(e: { message?: string; code?: string }): AppError`, `toActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>>`.
- Middleware: refresh de sessão; `/votar` e `/admin*` sem sessão → redirect `/login?next=...`; `/admin*` com sessão não-admin → redirect `/`.

- [ ] **Step 1: Testes**
```ts
expect(parseAdminEmails(' Admin@X.com ,b@y.com,, ')).toEqual(['admin@x.com','b@y.com']);
expect(parseAdminEmails(undefined)).toEqual([]);
expect(isAdminEmail('ADMIN@x.com', ['admin@x.com'])).toBe(true);
expect(isAdminEmail(null, ['admin@x.com'])).toBe(false);
expect(isAdminEmail('a@x.com', [])).toBe(false);
expect(mapRpcError({ message: 'ALREADY_VOTED' }).code).toBe('CONFLICT');
expect(mapRpcError({ message: 'ELECTION_NOT_OPEN' }).code).toBe('ELECTION_STATE');
expect(mapRpcError({ message: 'boom' }).code).toBe('INTERNAL');
```
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS; `npm run build` OK.
- [ ] **Step 5:** Commit `feat: supabase clients, middleware and admin guard`.

### Task 7: Design system e layout

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/components/site-header.tsx`, `site-footer.tsx`, `page-header.tsx`, `candidate-avatar.tsx`, `chapa-card.tsx`, `election-status-badge.tsx`, `empty-state.tsx`

**Interfaces:**
- Produces: `<CandidateAvatar candidate size />` (iniciais se sem foto, `next/image` com `remotePatterns` do host Supabase), `<ChapaCard chapa candidatesById selected? onSelect? />` (ordem numerada 1º..5º), `<ElectionStatusBadge status />` (texto + ícone, não só cor), `<PageHeader title description />` (único `h1`), `<EmptyState title description action? />`.

- [ ] **Step 1:** Tokens (cores HSL, raios, sombras, gradiente), fonte `Outfit`/`Inter` via `next/font`, metadata padrão, `Toaster`.
- [ ] **Step 2:** Componentes acima; header mostra links (Como funciona, Resultado, Validar, Votar, Admin se admin) e login/logout.
- [ ] **Step 3:** `npm run build` OK. Commit `feat: design system and shared components`.

### Task 8: Autenticação

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/login/login-form.tsx`, `src/app/actions/auth.ts`, `src/app/auth/callback/route.ts`

**Interfaces:**
- Produces actions: `signInWithPassword(form: FormData): Promise<ActionResult<{ redirectTo: string }>>`, `signUp(form)`, `sendMagicLink(form)`, `signOut(): Promise<void>`. `next` validado (apenas paths relativos iniciando com `/` e sem `//`).

- [ ] **Step 1:** Formulário com abas (Senha / Magic Link / Criar conta), validação zod (e-mail, senha ≥ 8), estados loading/erro, `aria-live`.
- [ ] **Step 2:** Callback troca `code` por sessão e redireciona para `next` seguro.
- [ ] **Step 3:** Teste unitário `safeNextPath('//evil.com')` → `'/'`, `safeNextPath('/votar')` → `'/votar'` em `src/lib/auth/safe-next.ts(.test.ts)`.
- [ ] **Step 4:** test + build OK. Commit `feat: password, signup and magic link auth`.

### Task 9: Admin — candidatos

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/candidatos/page.tsx`, `src/app/admin/candidatos/candidate-form.tsx`, `src/app/actions/candidates.ts`, `src/lib/election/queries.ts`, `src/lib/images/validate-image.ts(.test.ts)`

**Interfaces:**
- Produces: `getCandidates(): Promise<Candidate[]>` (ordem `created_at`), `getChapas(): Promise<Chapa[]>`, `getElectionSettings(): Promise<ElectionSettings>`, `getVoteTotal()` (via service role, só contagem); `validateImage(file: { type: string; size: number; bytes: Uint8Array }): { ok: true; ext: 'jpg'|'png'|'webp' } | { ok: false; message: string }`; actions `createCandidate(form)`, `updateCandidate(id, form)`, `deleteCandidate(id)` → `ActionResult`, todas com `requireAdmin()` e `revalidatePath`.

- [ ] **Step 1: Testes de `validateImage`**: PNG real (`89 50 4E 47`) ok; JPEG (`FF D8 FF`) ok; WebP (`RIFF....WEBP`) ok; `type:'image/png'` com bytes `GIF8` → erro; size `2*1024*1024+1` → erro; `image/gif` → erro.
- [ ] **Step 2:** FAIL → implementar → PASS.
- [ ] **Step 3:** Página: lista, formulário (nome obrigatório ≤ 80, bio ≤ 500, foto opcional), edição, exclusão com confirmação; desabilita "Adicionar" com 5 candidatos ou chapas existentes, explicando o motivo. Remove foto antiga do storage ao substituir/excluir.
- [ ] **Step 4:** test + build OK. Commit `feat: admin candidate management`.

### Task 10: Admin — chapas e eleição

**Files:**
- Create: `src/app/admin/chapas/page.tsx`, `src/app/actions/chapas.ts`, `src/app/actions/election.ts`, `src/app/admin/election-controls.tsx`, `src/components/chapa-list.tsx`

**Interfaces:**
- Consumes: `generateChapaRankings`, queries da Task 9.
- Produces: `generateChapas(): Promise<ActionResult<{ count: number }>>` (exige status `draft`, ≥ 1 candidato, 0 votos), `openElection()`, `closeElection()` → `ActionResult<ElectionSettings>`; `<ChapaList chapas candidates selectable? selectedId? onSelect? />` com busca por nome e filtros (tamanho, 1ª preferência), renderização paginada (50 por página) com `key={chapa.id}`.

- [ ] **Step 1:** Actions com checagem de estado e mensagens claras; encerrar exige confirmação no diálogo ("ação irreversível").
- [ ] **Step 2:** Página de chapas usa `ChapaList`; painel `/admin` mostra status, nº de candidatos, chapas, votos e controles.
- [ ] **Step 3:** build OK. Commit `feat: chapa generation and election lifecycle`.

### Task 11: Votação

**Files:**
- Create: `src/app/votar/page.tsx`, `src/app/votar/vote-panel.tsx`, `src/app/actions/vote.ts`, `src/components/vote-code-display.tsx`

**Interfaces:**
- Produces: `castVote(chapaId: string): Promise<ActionResult<{ code: string; chapaNumber: number }>>` (valida UUID com zod, chama RPC com cliente do usuário); `<VoteCodeDisplay code />` com botão copiar.

- [ ] **Step 1:** Página (server) decide estado: rascunho / encerrada / já votou (`has_voted`) / aberta → `VotePanel`.
- [ ] **Step 2:** `VotePanel`: `ChapaList` selecionável, barra fixa com chapa escolhida, diálogo de confirmação, botão desabilitado durante envio (`useTransition`), sucesso mostra código e aviso para guardá-lo; erro `CONFLICT` mostra "Você já votou".
- [ ] **Step 3:** build OK. Commit `feat: voting flow with verification code`.

### Task 12: Validação pública

**Files:**
- Create: `src/app/validar/page.tsx`, `src/app/validar/validate-form.tsx`, `src/app/actions/validate.ts`

**Interfaces:**
- Produces: `validateVoteCode(raw: string): Promise<ActionResult<{ valid: false } | { valid: true; chapaNumber: number; candidates: Candidate[] }>>` (normaliza com `normalizeVoteCode`; formato inválido → `VALIDATION`).

- [ ] **Step 1:** Formulário acessível; resultado com `aria-live`; mostra chapa e ordem; texto explicando que a identidade não é armazenada junto ao voto.
- [ ] **Step 2:** build OK. Commit `feat: public vote validation`.

### Task 13: Resultado, Como funciona e landing

**Files:**
- Create: `src/lib/election/results.ts`, `src/components/rounds-table.tsx`, `src/components/results-summary.tsx`, `src/components/chapa-votes-table.tsx`, `src/app/resultado/page.tsx`, `src/app/como-funciona/page.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `runInstantRunoff`, RPC `chapa_vote_counts`.
- Produces: `getElectionResults(): Promise<{ status: 'not-closed' } | { status: 'closed'; irv: IrvResult; chapaVotes: { chapa: Chapa; votes: number }[]; candidates: Candidate[] }>`.

- [ ] **Step 1:** `results.ts` só chama o RPC se status `closed`; converte contagens em `BallotGroup[]`.
- [ ] **Step 2:** `/resultado`: vencedor, votos por chapa (ordenado desc), tabela de rodadas (barras com % + números, eliminado marcado com texto), nota sobre desempate e cédulas esgotadas. Se não encerrada: estado explicativo.
- [ ] **Step 3:** `/como-funciona`: o que é, contagem IRV com exemplo ilustrado, diferença para voto tradicional, vantagens/desvantagens, e `ResultsSummary` quando encerrada.
- [ ] **Step 4:** Landing com hero, passos (Cadastro → Chapas → Voto → Validação → Apuração) e CTAs.
- [ ] **Step 5:** build OK. Commit `feat: results, education and landing pages`.

### Task 14: Documentação e verificação final

**Files:**
- Create: `README.md`

- [ ] **Step 1:** README: requisitos, `nvm use`, criar projeto Supabase, rodar `0001_init.sql` no SQL Editor, habilitar Email provider + Magic Link, configurar Site URL/Redirect URLs (`/auth/callback`), `.env.local`, `ADMIN_EMAILS`, deploy Vercel, estrutura de pastas, explicação da lógica.
- [ ] **Step 2:** `npm run test && npm run lint && npm run build && npm audit` → todos OK (avaliar achados do audit, sem `--force`).
- [ ] **Step 3:** Rodar `npm run dev` sem env → página mostra erro de configuração claro (não stack trace genérico).
- [ ] **Step 4:** Commit `docs: setup instructions`.
