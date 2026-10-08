# Democracy Box — Sistema de Voto por Ranking (Instant-Runoff Voting)

Sistema web educativo, moderno e transparente para demonstrar o funcionamento do **Voto por Ranking (Ranked Choice Voting / Instant-Runoff Voting)** com chapas geradas dinamicamente e auditoria pública de cédulas.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router, Server Actions e Server Components)
- **Linguagem**: TypeScript (strict mode, tipagem rigorosa de domínio e banco)
- **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Auth e Storage)
- **Estilização**: Tailwind CSS + componentes shadcn/ui
- **Testes**: Vitest (testes unitários com TDD para contagem IRV, permutações e validações)
- **Ambiente**: Node.js `24.21.0` (configurado via `.nvmrc`)

---

## 📋 Funcionalidades Principais

1. **Painel do Administrador (Protegido)**
   - Login administrativo controlado por lista de e-mails (`ADMIN_EMAILS`).
   - Cadastro, edição e exclusão de candidatos (máximo 5).
   - Upload de foto com validação binária rigorosa (*magic bytes* para PNG, JPEG ou WebP, até 2MB).
   - Geração automática de todas as chapas possíveis (permutações ordenadas de 1 a 5 candidatos: até 325 chapas).
   - Controle do ciclo da eleição: *Rascunho* → *Aberta* → *Encerrada* (encerramento definitivo e irreversível).
   - Visualização da apuração e métricas da urna.

2. **Cabine de Votação (Eleitores)**
   - Autenticação de eleitor via e-mail e senha ou Magic Link (cadastro aberto).
   - Regra estrita de **1 eleitor = 1 voto** garantida atomicamente no banco.
   - Navegação paginada com busca por nome de candidatos e filtros de preferências.
   - **Garantia de Sigilo**: A tabela de cédulas (`votes`) não armazena `voter_id`. A tabela de recibos (`voter_receipts`) garante apenas que o eleitor já votou, sem ligação com a chapa escolhida.
   - Geração imediata de comprovante único no formato `VR-XXXX-XXXX-XXXX` (com cerca de 60 bits de entropia e alfabeto legível sem ambiguidades).

3. **Auditoria Pública de Cédulas (`/validar`)**
   - Qualquer cidadão pode digitar o código do voto.
   - Mostra se a cédula é autêntica e exibe a ordem completa dos candidatos daquela chapa.
   - Não revela a identidade do eleitor.

4. **Página Educativa (`/como-funciona`) e Resultados (`/resultado`)**
   - Explicação didática de como funciona o IRV, comparação com o voto tradicional de maioria simples e prós/contras.
   - Apuração oficial rodada a rodada com gráficos de barras, destaque do vencedor com mais de 50% dos votos ativos, votos por chapa e detalhamento de desempates e cédulas esgotadas.

---

## 🚀 Como Configurar e Executar

### 1. Pré-requisitos e Versão do Node
Certifique-se de utilizar a versão `24.21.0` do Node.js:
```bash
nvm use 24.21.0
# Se ainda não estiver instalada:
nvm install 24.21.0
nvm use 24.21.0
```

### 2. Configurar o Projeto no Supabase
1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** no painel do Supabase.
3. Copie o conteúdo do arquivo [0001_init.sql](supabase/migrations/0001_init.sql) e execute-o.
4. No menu **Authentication -> Providers -> Email**, certifique-se de que a opção de login por e-mail e Magic Link está habilitada.
5. Em **Authentication -> URL Configuration**, configure a **Site URL** para `http://localhost:3000` (ou sua URL na Vercel) e adicione `http://localhost:3000/auth/callback` na lista de **Redirect URLs**.

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example`:
```bash
cp .env.example .env.local
```

Preencha os valores:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Chaves exclusivas de servidor (NUNCA coloque no cliente!)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
ADMIN_EMAILS=seu.email@exemplo.com,outro.admin@exemplo.com
```

### 4. Instalar Dependências e Rodar Localmente
```bash
npm install
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testes e Validação de Qualidade

Para executar a suíte de testes unitários (lógica de permutações, IRV, normalização de códigos e imagens):
```bash
npm run test
```

Para validar a integridade de tipagem e lint:
```bash
npm run lint
npm run build
```

---

## 📐 Estrutura de Pastas

```text
├── docs/                        # Especificação de design e plano de tarefas
├── supabase/
│   └── migrations/
│       └── 0001_init.sql        # Schema completo, RLS, triggers e RPCs
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── actions/             # Server Actions (auth, candidates, chapas, election, vote, validate)
│   │   ├── admin/               # Painel administrativo (/admin, /admin/candidatos, /admin/chapas)
│   │   ├── auth/callback/       # Troca de código de sessão / Magic Link
│   │   ├── como-funciona/       # Página educativa
│   │   ├── login/               # Autenticação de eleitores e admin
│   │   ├── resultado/           # Apuração oficial rodada a rodada
│   │   ├── validar/             # Consulta e auditoria pública de código de voto
│   │   ├── votar/               # Cabine de votação para eleitores autenticados
│   │   └── page.tsx             # Landing page
│   ├── components/              # Componentes de UI (avatares, cards, listas, tabelas)
│   ├── lib/
│   │   ├── auth/                # Guards e autorização de admin
│   │   ├── election/            # Consultas e apuração de resultados
│   │   ├── images/              # Validação de magic bytes
│   │   ├── ranked/              # Algoritmos puros (IRV, permutações, códigos)
│   │   └── supabase/            # Clientes SSR, Browser, Admin e Middleware
│   └── types/                   # Tipos de domínio e tipos Database do Supabase
└── vitest.config.ts             # Configuração de testes unitários
```

---

## 🔒 Auditoria e Segurança

- **Row Level Security (RLS)**: Leitura pública controlada nas tabelas de candidatos e chapas. Cédulas e recibos não possuem políticas diretas de inserção ou consulta para `anon` ou `authenticated`.
- **Acesso Atômico por RPCs**: As funções `cast_vote`, `has_voted`, `validate_vote` e `chapa_vote_counts` rodam com `SECURITY DEFINER` e `search_path` restrito, garantindo transacionalidade e impossibilitando vazamento de votos parciais antes do encerramento.
- **Admin Server-Side**: O papel de administrador é verificado nas Server Actions antes de utilizar o cliente `service_role`.
