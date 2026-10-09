# Democracy Box — Sistema de Voto por Ranking (Instant-Runoff Voting)

Sistema web educativo, moderno e transparente para demonstrar o funcionamento do **Voto por Ranking (Ranked Choice Voting / Instant-Runoff Voting)** com geração dinâmica de chapas hierárquicas, envio de comprovante por e-mail e auditoria pública de cédulas.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Server Actions e Server Components)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org) (strict mode rigoroso)
- **Backend & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Auth e Storage)
- **E-mails Transacionais**: [Resend](https://resend.com) REST API (com fallback de logger em ambiente de desenvolvimento)
- **Estilização**: Tailwind CSS + componentes [shadcn/ui](https://ui.shadcn.com)
- **Testes**: [Vitest](https://vitest.dev) (testes unitários com TDD para contagem IRV, permutações, validação de fotos e envio de e-mails)
- **Ambiente**: Node.js `24.21.0` (configurado via `.nvmrc`)

---

## 📋 Funcionalidades Principais

### 1. Painel do Administrador (Protegido)
- **Autenticação Segura**: Acesso restrito controlado via lista de e-mails de administradores (`ADMIN_EMAILS`).
- **Gestão de Candidatos**: Cadastro, edição e exclusão de candidatos (até 5 candidatos).
- **Upload Seguro de Fotos**: Validação binária rigorosa (*magic bytes* para PNG, JPEG ou WebP, tamanho máximo de 2MB) armazenadas no Supabase Storage.
- **Geração Automática de Chapas**: Gera todas as permutações ordenadas contendo todos os candidatos registrados ($n!$ possibilidades). Cada chapa recebe uma numeração sequencial (`#01`, `#02`...).
- **Controle de Ciclo Eleitoral**:
  - *Rascunho*: Cadastro e configuração prévia.
  - *Aberta*: Votação liberada para os eleitores.
  - *Encerrada*: Encerramento definitivo e irreversível da urna, liberando a apuração pública.

### 2. Cabine de Votação (Eleitores)
- **Autenticação de Eleitor**: Login via e-mail e senha ou Magic Link (Supabase Auth).
- **Regra de 1 Eleitor = 1 Voto**: Bloqueio atômico no banco de dados via RPC transacional.
- **Construtor de Voto Interativo Passo a Passo**:
  - O eleitor pode montar o seu ranking clicando nos candidatos em ordem de favoritismo (1ª Opção, 2ª Opção, 3ª Opção...).
  - O sistema filtra em tempo real as chapas correspondentes à sequência escolhida e pré-seleciona a opção exata quando todos forem ordenados.
- **Destaque Visual de Seleção**: Cards com alto contraste, gradiente verde-esmeralda vibrante e selo evidente de chapa selecionada.
- **Envio Automático do Comprovante por E-mail**:
  - Ao votar, o código único da cédula (`VR-XXXX-XXXX-XXXX`) é exibido imediatamente na tela com botão de cópia com 1 clique e enviado automaticamente para a caixa de entrada do e-mail do eleitor.
- **Sigilo Absoluto**: A cédula (`votes`) não armazena a identidade do eleitor (`voter_id`), enquanto a tabela de recibos (`voter_receipts`) registra apenas que o eleitor já exerceu seu direito, sem ligação com a escolha realizada.

### 3. Auditoria Pública de Cédulas (`/validar`)
- Qualquer cidadão pode consultar um código de voto no formato `VR-XXXX-XXXX-XXXX`.
- O sistema informa se a cédula é autêntica e exibe a ordem completa dos candidatos daquela chapa.
- **Anonimato Preservado**: A consulta pública nunca revela a identidade de quem votou.

### 4. Apuração Oficial e Detalhamento Rodada a Rodada (`/resultado`)
- **Quadro Comparativo Consolidado**: Matriz completa mostrando a quantidade de votos que cada candidato obteve em cada rodada da contagem.
- **Transferência de Votos ($\Delta$)**: Indica explicitamente quantos votos foram transferidos para cada candidato após a eliminação da rodada anterior.
- **Marcador de Maioria Absoluta**: Linha visual indicando a meta de corte de mais de 50% dos votos ativos.
- **Tabela de Cédulas Iniciais**: Total de votos diretos depositados em cada uma das chapas.

### 5. Página Educativa e Contexto Nacional (`/como-funciona`)
- **Funcionamento Didático**: Explicação passo a passo do método *Instant-Runoff Voting* com infográficos interativos.
- **Mecânica da Distribuição de Votos**: Detalhamento dos 4 princípios da transferência, exemplos ilustrados de cédulas em movimento e perguntas frequentes.
- **O Debate no Brasil (PEC 125/2011)**:
  - Documentação da proposta de voto preferencial relatada pela deputada Renata Abreu na Reforma Eleitoral de 2021.
  - Análise da votação no plenário e o potencial tecnológico da Urna Eletrônica Brasileira.
  - Links oficiais e referências da Câmara dos Deputados e notícias especializadas.

---

## 🚀 Como Configurar e Executar

### 1. Pré-requisitos e Versão do Node.js
Certifique-se de utilizar a versão `24.21.0` do Node.js:
```bash
nvm use 24.21.0
# Se ainda não estiver instalada:
nvm install 24.21.0
nvm use 24.21.0
```

### 2. Configurar o Projeto no Supabase
1. Crie um novo projeto no [Supabase](https://supabase.com).
2. No painel do Supabase, acesse o **SQL Editor**.
3. Copie e execute o arquivo de migração inicial: [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql).
4. Em **Authentication -> Providers -> Email**, certifique-se de que o provedor de e-mail e Magic Link estão ativados.
5. Em **Authentication -> URL Configuration**, defina a **Site URL** para `http://localhost:3000` e adicione `http://localhost:3000/auth/callback` na lista de **Redirect URLs**.

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

# Chaves exclusivas do Servidor (NUNCA coloque no cliente!)
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
ADMIN_EMAILS=seu.email@exemplo.com

# Envio de Comprovante de Voto por E-mail (Opcional - Resend REST API)
# Se ausente, o sistema gera o comprovante no console do servidor em desenvolvimento
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Democracy Box <onboarding@resend.dev>"
```

### 4. Instalar Dependências e Executar
```bash
npm install
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Scripts SQL para Simulação

O projeto disponibiliza scripts SQL prontos na pasta `supabase/` para agilizar testes e demonstrações:

- **[supabase/simulate_close_election.sql](supabase/simulate_close_election.sql)**:
  Encerra a eleição no banco para liberar imediatamente a página `/resultado`, ou permite reabrir/resetar o estado da eleição para novos testes.
- **[supabase/seed_sample_votes.sql](supabase/seed_sample_votes.sql)**:
  Injeta votos aleatórios distribuídos entre as chapas cadastradas para simular uma eleição competitiva com múltiplas rodadas de eliminação do IRV.

---

## 🧪 Testes e Validação de Qualidade

Para rodar a suíte completa de testes unitários (Vitest):
```bash
npm run test
```

Para validar a integridade de TypeScript, formatação e compilação do Next.js:
```bash
npm run lint
npm run build
```

---

## 📁 Estrutura de Pastas

```text
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql        # Schema completo, RLS, triggers e RPCs atômicas
│   ├── simulate_close_election.sql # Script SQL para encerrar/reabrir a eleição
│   └── seed_sample_votes.sql    # Script SQL para popular votos de teste
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── actions/             # Server Actions (auth, candidates, chapas, election, vote)
│   │   ├── admin/               # Área administrativa (/admin, /candidatos, /chapas)
│   │   ├── auth/callback/       # Callback de autenticação / Magic Link
│   │   ├── como-funciona/       # Página educativa e debate brasileiro (PEC 125/2011)
│   │   ├── login/               # Tela de login e cadastro de eleitores
│   │   ├── resultado/           # Apuração oficial com matriz comparativa rodada a rodada
│   │   ├── validar/             # Consulta pública de autenticidade da cédula
│   │   ├── votar/               # Cabine de votação com construtor interativo de voto
│   │   └── page.tsx             # Landing page principal
│   ├── components/              # Componentes React reutilizáveis e shadcn/ui
│   │   ├── vote-builder.tsx     # Construtor interativo de voto por preferência
│   │   ├── rounds-matrix-table.tsx # Quadro consolidado de votos por candidato por rodada
│   │   ├── rounds-table.tsx     # Detalhamento gráfico com linha de 50% e transferências
│   │   ├── chapa-card.tsx       # Card de chapa com destaque visual e seleção
│   │   ├── vote-code-display.tsx# Recibo da cédula com atalho de validação e confirmação de e-mail
│   │   └── candidate-avatar.tsx # Avatar responsivo de candidatos
│   ├── lib/
│   │   ├── auth/                # Guards e autorização de administradores
│   │   ├── election/            # Consultas e apuração de resultados
│   │   ├── email/               # Serviço de envio de comprovantes via Resend REST API
│   │   ├── images/              # Validação de magic bytes para upload seguro de fotos
│   │   ├── ranked/              # Algoritmos puros (IRV, permutações, códigos de cédula)
│   │   └── supabase/            # Clientes Supabase SSR, Admin e Middleware
│   └── types/                   # Tipos de domínio e tipos Database do Supabase
└── vitest.config.ts             # Configuração da suíte de testes unitários
```

---

## 🔒 Segurança e Privacidade Garantidas

- **Garantia de Voto Secreto**: A separação entre as tabelas `votes` e `voter_receipts` assegura que nenhuma consulta no banco consiga associar o eleitor à sua chapa escolhida.
- **Acesso Atômico por RPCs**: As funções `cast_vote`, `has_voted`, `validate_vote` e `chapa_vote_counts` rodam com `SECURITY DEFINER` e `search_path` restrito, impedindo o vazamento de contagens parciais antes do encerramento oficial da eleição.
- **Upload Seguro de Arquivos**: O tipo MIME e os primeiros bytes dos arquivos de foto são inspecionados no servidor para evitar uploads maliciosos.

---

## 📄 Licença

Este projeto está sob a [Licença MIT](LICENSE). Sinta-se livre para utilizar, modificar e distribuir para fins acadêmicos, cívicos e educacionais.
