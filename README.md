# Devotion App 🙏

Uma rede social focada em constância devocional e comunidade. O objetivo é incentivar o hábito diário de leitura e compartilhamento.

## 🚀 Funcionalidades

- **Feed Devocional**:
  - Compartilhe devocionais (foto obrigatória) para manter seu *streak*.
  - Publique textos livres para interagir com a comunidade.
  - Atualização manual ("Novas publicações") com verificação automática a cada 10 minutos.
- **Ranking & Constância**:
  - Sistema de *Streaks* (dias consecutivos).
  - Visualização de calendário de atividades no perfil.
- **Perfil de Usuário**:
  - Avatar personalizável ou gerado automaticamente (DiceBear).
  - Localização (Cidade) e bio.
  - Histórico de posts.
- **Interações**:
  - Curtidas e Seguidores.
  - Feed global ordenado cronologicamente.

## 🛠️ Tecnologias

- **Frontend**: [Nuxt 3](https://nuxt.com) + Vue 3.
- **Estilização**: [TailwindCSS](https://tailwindcss.com) + [DaisyUI](https://daisyui.com).
- **Backend**: [Supabase](https://supabase.com) (Auth, Database, Storage, Realtime).
- **Ícones**: Lucide Icons.

## 📦 Como rodar o projeto

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/theussoares/devotion-app.git
cd devotion-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz (baseado no `.env.example`) e adicione suas chaves do Supabase:
```env
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui (opcional, apenas para scripts administrativos)
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse `http://localhost:3000`.

## 🗄️ Banco de Dados (Supabase)

O projeto depende das seguintes tabelas no Supabase:
- `profiles` (estendido da tabela `auth.users`)
- `posts`
- `likes`
- `follows`

*Scripts de migração/setup do banco podem ser encontrados na pasta `supabase` (se aplicável).*
