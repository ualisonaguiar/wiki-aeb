# Wiki CTI — AEB

Wiki dos projetos do grupo **Centro de Tecnologia da Informação (CTI)** da Agência Espacial Brasileira.

## Tecnologias

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [Recharts](https://recharts.org/) — gráficos de linguagens
- [Lucide React](https://lucide.dev/) — ícones
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) — renderização de README
- [Express](https://expressjs.com/) + [node-fetch](https://github.com/node-fetch/node-fetch) — backend e proxy para GitLab/Nutanix/Prometheus
- [dotenv](https://github.com/motdotla/dotenv) — variáveis de ambiente

## Pré-requisitos

- Node.js 18+
- Acesso à instância GitLab `https://gitlab.aeb.gov.br`
- Token de acesso do grupo CTI com escopos `read_api` e `read_repository` (Role: Maintainer ou superior)

## Configuração

1. Clone o repositório:
   ```bash
   git clone https://gitlab.aeb.gov.br/cti/wiki.git
   cd wiki
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo `.env` na raiz do projeto:
   ```env
   VITE_GITLAB_URL=https://gitlab.aeb.gov.br
   VITE_GITLAB_TOKEN=seu_token_aqui
   VITE_GROUP_PATH=cti

   # Nutanix Prism Element (opcional; deixe vazio para usar dados mockados)
   NUTANIX_URL=https://IP_DO_PRISM:9443
   NUTANIX_USER=admin
   NUTANIX_PASS=sua_senha_aqui
   # NUTANIX_MOCK=true

   # Prometheus (opcional; deixe vazio para usar dados mockados)
   PROMETHEUS_URL=http://IP_DO_PROMETHEUS:9090
   # PROMETHEUS_MOCK=true
   ```

   > ⚠️ O arquivo `.env` está no `.gitignore` e **nunca deve ser commitado**.
   >
   > Para gerar o token acesse: **GitLab → CTI → Settings → Access Tokens**  
   > Selecione Role **Maintainer** ou **Owner** e habilite os escopos `read_api` e `read_repository`.

4. Inicie o ambiente de desenvolvimento:
   - **Somente frontend** (Vite dev server):
     ```bash
     npm run dev
     ```
   - **Backend** (API Express):
     ```bash
     npm run dev:server
     ```
   - **Ambos** (frontend + backend):
     ```bash
     npm run dev:all
     ```

5. Acesse o frontend em `http://localhost:5173`

## Build para produção

```bash
npm run build
```

Os arquivos gerados estarão em `dist/`.

## Funcionalidades

- **Dashboard** — visão geral dos projetos do grupo: estatísticas, distribuição de linguagens e atividade recente
- **Detalhe do Projeto** — informações detalhadas com abas:
  - **Visão Geral** — linguagens, gráfico radar e barras de distribuição
  - **Branches** — branches extraídas dos pipelines CI/CD
  - **README** — conteúdo renderizado em Markdown (requer token com `read_repository`)
  - **Merge Requests** — lista de MRs via GraphQL
- **Membros** — equipe do grupo CTI com seus papéis
- **Pipeline CI/CD** — status do último pipeline por projeto
- **Infraestrutura (Nutanix / Prometheus)** — VMs e hosts do data center por projeto (requer acesso ao Prism Element ou Prometheus na rede interna)

## Estrutura do Projeto

```
wiki/
├── src/                  # Frontend React + Vite
│   ├── components/       # Dashboard, ProjectDetail, Sidebar, MembersPanel
│   ├── data/             # Dados estáticos dos projetos e membros
│   ├── hooks/            # useProjectGraphQL, useNutanix
│   ├── services/         # gitlab.ts, chamadas à API
│   ├── types/            # Interfaces TypeScript
│   └── utils/            # Funções utilitárias
├── server/               # Backend Express
│   ├── index.ts          # Entry point do servidor
│   ├── routes/           # /api/gitlab, /api/nutanix
│   └── services/         # nutanix.ts, prometheus.ts — integrações de infraestrutura
├── knowledge/
│   ├── schema/           # CTI_WIKI.md — schema e workflows para LLM
│   └── wiki/             # Base de conhecimento em Markdown
├── .env                  # Variáveis de ambiente (NÃO commitar)
├── Dockerfile            # Build multi-stage para deploy
├── docker-compose.yml    # Orquestração do container
├── tsconfig.server.json  # Compilação do backend TypeScript
└── vite.config.ts        # Proxy para GitLab API (dev) e backend (dev)
```

## Integração GraphQL

Em **desenvolvimento** o Vite proxy encaminha `/gitlab-proxy → https://gitlab.aeb.gov.br` para evitar CORS.  
Em **produção** o frontend chama `/api/gitlab/graphql`, proxyado pelo backend Express — o token nunca sai do servidor.

As queries disponíveis são:

| Query | Dados retornados |
|---|---|
| `Pipelines` | Branches, SHA, status CI/CD |
| `MergeRequests` | Lista de MRs com estado e autores |

> **Nota:** O campo `repository` do GraphQL (branches completas, commits, README) requer token com Role ≥ Maintainer. Com tokens de Role Guest o campo retorna `null`.

## Deploy em VM / Docker

O projeto inclui `Dockerfile` (build multi-stage) e `docker-compose.yml` para deploy em VM com acesso à rede interna da AEB.

```bash
# 1. Configure o .env (veja .env.example)
cp .env.example .env

# 2. Build e start
docker compose up --build -d

# 3. Verifique
curl http://localhost:3000/api/health
```

Veja [`deploy.md`](deploy.md) para o guia completo de deploy na VM.

## Conhecimento de Domínio (knowledge/)

Veja [`knowledge/schema/CTI_WIKI.md`](knowledge/schema/CTI_WIKI.md) para o schema completo de convenções e workflows de ingestão de documentos com LLM.
