---
trigger: always_on
---

Você é um desenvolvedor full-stack sênior especializado em Next.js e Supabase. Crie um sistema web completo de demonstração de Voto por Ranking (Ranked Choice Voting / Instant-Runoff Voting) com as seguintes especificações:
Stack obrigatória

Next.js 15 (App Router)
Supabase (Auth + Database + Storage)
TypeScript
Tailwind CSS + shadcn/ui
Server Actions e Server Components sempre que possível
Deploy preparado para Vercel

Objetivo do sistema
Sistema educativo e transparente para demonstrar como funciona o Voto por Ranking. Deve ser simples, limpo e fácil de entender.
Funcionalidades
1. Área Administrativa (protegida)

Login de administrador (pode usar um usuário específico no Supabase ou role)
Cadastro de candidatos:
Nome
Descrição/biografia (opcional)
Foto (upload para Supabase Storage)

Listagem, edição e exclusão de candidatos
Botão para gerar chapas automaticamente
Visualização de todas as chapas geradas
Possibilidade de encerrar a votação
Visualização do resultado final com detalhes da apuração

2. Geração de Chapas

Após cadastrar os candidatos, o administrador gera as chapas
Uma chapa é uma lista ordenada de até 5 candidatos
O sistema deve gerar todas as possibilidades hierárquicas (todas as permutações ordenadas de 1 a 5 candidatos)
Cada chapa recebe um número sequencial (01, 02, 03...)
Salvar as chapas no banco de dados
Exibir claramente a ordem dos candidatos em cada chapa

3. Votação (Eleitores)

Login do eleitor via Supabase Auth (e-mail + senha ou Magic Link)
Após login, o eleitor vê a lista de todas as chapas disponíveis
O eleitor escolhe uma única chapa
Ao confirmar o voto:
O sistema gera um código único de verificação no formato VR-XXXX-XXXX-XXXX
Salva o voto no banco
Mostra o código imediatamente na tela
Cada eleitor só pode votar uma vez


4. Página Pública de Validação do Voto

Rota pública: /validar
O usuário digita o código do voto
O sistema mostra:
Se o código é válido
Número da chapa escolhida
A ordem completa dos candidatos daquela chapa

Não deve revelar a identidade do eleitor

5. Página Educativa + Resultados

Rota pública: /sobre ou /como-funciona
Explicação clara e didática sobre:
O que é Voto por Ranking
Como funciona a contagem (Instant-Runoff)
Diferença para o voto tradicional
Vantagens e desvantagens

Quando a votação estiver encerrada, esta página (ou uma página /resultado) deve mostrar:
Resultado final
Quantidade de votos por chapa
Detalhamento das rodadas de eliminação
Vencedor


Modelo de Dados (Supabase)
Crie as seguintes tabelas:

candidates (id, name, description, photo_url, created_at)
chapas (id, number, candidate_ids JSONB ou relação, created_at)
votes (id, chapa_id, code, voter_id, created_at)
election_settings (id, is_open, created_at, closed_at)

Regras importantes

Máximo de 5 candidatos por chapa
Código de voto deve ser único e legível
Um eleitor só vota uma vez
A contagem deve usar o método Instant-Runoff Voting (eliminação sucessiva do último colocado até alguém ter mais de 50%)
Interface limpa, moderna, responsiva e com boa UX
Toda a lógica de geração de chapas e contagem deve ser clara e bem comentada

Entregáveis esperados

Estrutura completa de pastas do projeto
Schema SQL para o Supabase
Tipos TypeScript
Funções principais (gerar chapas, registrar voto, validar código, contagem ranked choice)
Páginas principais (admin, votação, validar, resultado, sobre)
Componentes reutilizáveis
Instruções de configuração do Supabase e variáveis de ambiente