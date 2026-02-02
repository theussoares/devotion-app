# User Flows & Project Wireframe

Documentação detalhada dos fluxos de usuário do projeto **Devotion**, cobrindo funcionalidades implementadas (funcionais) e indicações de elementos visuais (wireframe textual).

---

## 🔐 1. Autenticação e Acesso

### 1.1. Registro (Sign Up)
**Rota:** `/register`
*   **Atores:** Visitante (Usuário não autenticado).
*   **Objetivo:** Criar uma nova conta para acessar a plataforma.
*   **Campos do Formulário:**
    *   `Nome Completo` (Texto, Obrigatório)
    *   `Nome de Usuário` (Texto, Obrigatório, Único, prefixo `@`)
    *   `Cidade` (Texto, Obrigatório) - *Usado para rankings locais.*
    *   `Email` (Email, Obrigatório)
    *   `Senha` (Senha, Obrigatório, Min. 6 caracteres)
*   **Fluxo:**
    1.  Usuário preenche formulário.
    2.  Sistema cria conta de Autenticação (Supabase Auth).
    3.  Sistema atualiza perfil do usuário com a cidade informada.
    4.  **Sucesso:** Redirecionamento automático para a Home (`/`).
    5.  **Falha:** Exibição de mensagem de erro (ex: email já em uso).
*   **Links:** "Já tem conta? Entrar" -> Direciona para LOGIN.

### 1.2. Login (Sign In)
**Rota:** `/login`
*   **Atores:** Usuário Registrado.
*   **Objetivo:** Autenticar-se para acessar áreas protegidas.
*   **Campos do Formulário:**
    *   `Email` (Email, Obrigatório)
    *   `Senha` (Senha, Obrigatório)
*   **Fluxo:**
    1.  Verificação automática: Se já logado, redireciona para `/`.
    2.  Usuário insere credenciais.
    3.  **Sucesso:** Redirecionamento para a Home (`/`).
    4.  **Falha:** Exibição de mensagem de erro "Email ou senha inválidos".
*   **Links:** "Esqueceu a senha?" (Placeholder visual), "Não tem conta? Cadastre-se".

### 1.3. Logout
**Ação:** Botão no Menu de Perfil.
*   **Fluxo:**
    1.  Usuário clica no avatar (Navbar) -> "Sair".
    2.  Sessão é encerrada.
    3.  Redirecionamento imediato para `/login`.

---

## 🏠 2. Navegação Principal (Layout)

### 2.1. Navbar (Desktop/Mobile Top)
*   **Logo:** "Devocional" -> Link para `/`.
*   **Menu:**
    *   `Ranking` -> Link para `/ranking`.
    *   **Dropdown de Usuário (Logado):**
        *   Avatar (Imagem do perfil ou DiceBear gerado por seed).
        *   `Meu Perfil` -> Link para `/profile`.
        *   `Sair` -> Ação de Logout.
    *   **Botão de Ação (Visitante):** `Entrar` -> Link para `/login`.

### 2.2. Bottom Nav (Mobile Only)
Barra de navegação fixa no rodapé para acesso rápido em dispositivos móveis.
*   `🏠 Home` -> `/`
*   `➕ Publicar` (Destaque Central) -> `/post`
*   `👤 Perfil` -> `/profile`

---

## 📱 3. Funcionalidades Core

### 3.1. Feed de Devocionais (Home)
**Rota:** `/` (Protegida)
*   **Visualização:** Lista vertical de posts (Cards).
*   **Componentes do Post:**
    *   **Cabeçalho:** Avatar + Nome (Link para Perfil) + Data + Badge (se tipo "Devocional").
    *   **Mídia:** Imagem (Aspecto quadrado, lazy loaded).
    *   **Ações:**
        *   ❤️ **Curtir:** Toggle. Ícone preenchido e vermelho se "liked_by_me". Contador de curtidas.
        *   💬 **Comentar:** Ícone visual (Ainda não funcional).
    *   **Legenda:** Texto descritivo.
*   **Fluxo de Atualização (Polling):**
    *   Sistema verifica novos posts a cada 10 minutos.
    *   Se houver novos posts, exibe botão flutuante "⬆️ Novas publicações".
    *   Clique no botão -> Atualiza lista e rola para o topo.

### 3.2. Criar Publicação
**Rota:** `/post` (Protegida)
*   **Tabs de Tipo:**
    1.  **Devocional:** Conta para Ranking/Streak. Foto Obrigatória.
    2.  **Post Livre:** Interação social. Não afeta Streak. Foto Opcional.
*   **Inputs:**
    *   `Foto`: Upload de arquivo (Preview imediato com botão remover).
    *   `Legenda`: Área de texto.
*   **Fluxo:**
    1.  Usuário seleciona tipo e preenche dados.
    2.  Clique em "Publicar".
    3.  Estado `uploading` (Spinner).
    4.  Upload de Imagem (Storage) -> Criação do Registro (DB).
    5.  **Sucesso:** Cache do feed invalidado -> Redireciona para `/`.
    6.  **Falha:** Exibe alerta de erro.

### 3.3. Ranking de Constância
**Rota:** `/ranking`
*   **Objetivo:** Gamificação baseada na constância (Streak) de devocionais.
*   **Visualização:** Top 50 usuários ordenados por `current_streak`.
*   **Filtros:**
    *   `Global`: Todos os usuários.
    *   `Minha Cidade`: Apenas usuários da mesma cidade do logado.
*   **Card de Usuário:**
    *   Posição (#1, #2...).
    *   Avatar (Destaque dourado para #1).
    *   Nome + Cidade.
    *   Score: Número de dias (Streak).

### 3.4. Perfil do Usuário
**Rota:** `/profile` (Meu Perfil)
*   **Cabeçalho:**
    *   Avatar Grande.
    *   Nome + Username + Cidade.
    *   **Stats:** "Sequência Atual" (Streak) em destaque.
*   **Histórico (Calendário):**
    *   Visualização de calendário mensal.
    *   Dias com post tipo "Devocional" marcados/interativos.
*   **Detalhe do Histórico (Modal):**
    *   Ao clicar em um dia com post -> Abre Modal.
    *   Exibe: Data, Foto e Legenda do devocional daquele dia.

**Rota:** `/user/[username]` (Perfil Público)
*   *(Inferido)* Similar ao perfil pessoal, mas em modo somente leitura (sem acesso a configs privadas se houverem no futuro).

---

## 🛠️ 4. Elementos Técnicos Notáveis
*   **Middleware de Auth:** Protege rotas `/`, `/post`, `/profile`. Redireciona não-autenticados para `/login`.
*   **Cache:** Feed possui cache de 5 minutos (client-side via Nuxt Data) para performance, invalidado ao postar.
*   **Responsividade:** Design adaptativo com foco em Mobile (Bottom Nav, Touch targets).
