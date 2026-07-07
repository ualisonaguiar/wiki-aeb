# Wiki CTI - AEB

Wiki dos projetos do grupo Centro de Tecnologia da Informacao (CTI) da Agencia Espacial Brasileira.

## Tecnologias

- React 18 + Vite
- TypeScript
- TailwindCSS
- Express
- PostgreSQL via `pg`
- Validacao de entrada com `zod`
- Swagger UI / OpenAPI
- GitLab GraphQL
- Integracoes de leitura com Nutanix e Prometheus
- Docker Compose para execucao local/VM

## Estrutura Atual

```text
wiki/
+-- backend/
|   +-- app.ts
|   +-- index.ts
|   +-- db/
|   |   +-- client.ts
|   +-- docs/
|   |   +-- openapi.ts
|   +-- shared/
|   |   +-- http/
|   |       +-- async-handler.ts
|   |       +-- errors.ts
|   +-- modules/
|   |   +-- admin/
|   |   |   +-- admin.routes.ts
|   |   +-- gitlab/
|   |   |   +-- gitlab.routes.ts
|   |   +-- infra/
|   |   |   +-- infra.controller.ts
|   |   |   +-- infra.routes.ts
|   |   |   +-- infra.schemas.ts
|   |   |   +-- infra.types.ts
|   |   |   +-- aplicacao.mapper.ts
|   |   |   +-- aplicacao.repository.ts
|   |   |   +-- aplicacao.service.ts
|   |   +-- nutanix/
|   |   |   +-- nutanix.routes.ts
|   |   +-- projeto/
|   |   |   +-- projeto.routes.ts
|   |   +-- prometheus/
|   |       +-- prometheus.routes.ts
|   +-- routes/
|   |   +-- index.ts
|   |   +-- docs.ts
|   |   +-- health.ts
|   +-- services/
|       +-- gitlab.service.ts
|       +-- nutanix.ts
|       +-- prometheus.ts
|       +-- infra/
|       |   +-- detection.ts
|       |   +-- types.ts
|       +-- nutanix/
|       |   +-- client.ts
|       |   +-- config.ts
|       |   +-- mappers.ts
|       |   +-- mocks.ts
|       |   +-- types.ts
|       +-- prometheus/
|           +-- client.ts
|           +-- config.ts
|           +-- mappers.ts
|           +-- mocks.ts
|           +-- parser.ts
+-- frontend/
|   +-- src/
|       +-- components/
|       |   +-- Projeto/
|       |       +-- ProjectDetail.tsx
|       |       +-- ProjectDetailInfra.tsx
|       +-- services/
|           +-- infra.service.ts
+-- knowledge/
+-- Dockerfile
+-- docker-compose.yml
```

## Decisoes de Backend

### Organizacao de responsabilidades

As rotas Express devem ficar finas. Regra de negocio, acesso externo e transformacao de dados devem ficar fora de `routes/`.

Padrao atual:

```text
routes/       -> camada HTTP
services/     -> fachadas usadas pelas rotas
services/*/   -> clients, config, mappers, mocks e parsers especificos
```

As fachadas `backend/services/nutanix.ts` e `backend/services/prometheus.ts` preservam os exports usados pelas rotas atuais:

```ts
listVMs()
listHosts()
getVMsByProject(projectKey)
```

Isso permite refatorar internamente sem quebrar endpoints existentes.

### Infraestrutura externa nao e CRUD

Nutanix e Prometheus sao fontes externas de leitura:

- Nutanix: virtualizacao/hosts/VMs.
- Prometheus: observabilidade/metricas.

O CRUD da Wiki nao deve escrever diretamente nessas fontes. O CRUD deve usar o banco PostgreSQL da Wiki e tratar infraestrutura como inventario interno de aplicacoes, hosts, unidades e responsaveis.

### Banco existente para o CRUD de infraestrutura

O banco atual possui as tabelas:

```text
tb_aplicacao
tb_aplicacao_host
tb_aplicacao_unidade
tb_status
tb_unidade
vw_informacao_vhost_aplicacao
```

Interpretacao adotada:

```text
tb_aplicacao           -> aplicacao/sistema
tb_aplicacao_host      -> hosts/vhosts vinculados a aplicacao
tb_aplicacao_unidade   -> vinculo aplicacao x unidade x responsavel
tb_status              -> dominio de status
tb_unidade             -> dominio de unidades AEB
vw_informacao_vhost_aplicacao -> detalhes operacionais dos vhosts
```

O primeiro CRUD de infraestrutura deve ser baseado em aplicacoes e seus relacionamentos, nao em VMs isoladas.

### Busca de infraestrutura na aba do projeto

Quando o usuario abre um projeto, a tela busca os dados cadastrados para aquele sistema especifico. Esses dados alimentam a aba `Infraestrutura` e tambem o bloco `Servidores por ambiente` da aba `Visao Geral`.

Fluxo atual:

```text
frontend/src/components/Projeto/ProjectDetail.tsx
  -> controla as abas do detalhe do projeto
  -> renderiza ProjectDetailInfra.tsx quando a aba ativa e "infra"

frontend/src/components/Projeto/ProjectDetailInfra.tsx
  -> renderiza os dados de infraestrutura ja resolvidos para o projeto

frontend/src/components/Projeto/ProjectDetailOverview.tsx
  -> renderiza Servidores por ambiente usando a contagem por logical_network

frontend/src/hooks/useProjectRegisteredInfra.ts
  -> chama infraService.getAplicacoes()
  -> chama infraService.getVhostInformacoes()
  -> cruza os dados recebidos com o projeto GitLab aberto
  -> calcula as contagens por ambiente

frontend/src/services/infra.service.ts
  -> GET /api/infra/aplicacoes
  -> GET /api/infra/vhosts

frontend/src/utils/infraProjectMatch.ts
  -> concentra as regras de cruzamento com projeto GitLab
  -> classifica logical_network em producao, homologacao, desenvolvimento ou outro

backend/modules/infra/infra.routes.ts
  -> declara as rotas do modulo infra

backend/modules/infra/infra.controller.ts
  -> recebe a requisicao HTTP e chama o service

backend/modules/infra/aplicacao.service.ts
  -> orquestra a chamada e trata erros de banco

backend/modules/infra/aplicacao.repository.ts
  -> executa SQL nas tabelas e na view do PostgreSQL

backend/modules/infra/aplicacao.mapper.ts
  -> converte linhas SQL para o formato da API

backend/modules/infra/infra.types.ts
  -> define os tipos retornados pela API
```

Fontes usadas pela aba `Infraestrutura`:

```text
GET /api/infra/aplicacoes
  Fonte:
    tb_aplicacao
    tb_status
    tb_aplicacao_host
    tb_aplicacao_unidade
    tb_unidade

  Uso:
    nome do sistema
    descricao da aplicacao
    status
    sigla
    tecnologia
    URL de versionamento
    unidades
    responsaveis

GET /api/infra/vhosts
  Fonte:
    public.vw_informacao_vhost_aplicacao

  Uso:
    vhost
    ipv4
    logical_network
    status operacional
    url_versionamento
```

A coluna `descricao` da view `vw_informacao_vhost_aplicacao` e ignorada. A descricao exibida para o sistema vem de `tb_aplicacao.descricao`.

O bloco `Servidores por ambiente` conta os vhosts encontrados para a aplicacao cadastrada e classifica cada item pelo campo `logical_network` da view:

```text
logical_network contendo "Producao"        -> Producao
logical_network contendo "Homologacao"     -> Homologacao
logical_network contendo "Desenvolvimento" -> Desenvolvimento
demais valores ou vazio                    -> Outros
```

O cruzamento entre o projeto GitLab aberto e a aplicacao cadastrada e feito em `ProjectDetailInfra.tsx`. A regra tenta encontrar a aplicacao correspondente por:

```text
urlVersionamento
nome
sigla
fullPath do GitLab
slug final da URL do projeto
```

Exemplo: se o projeto aberto for `https://gitlab.aeb.gov.br/cti/edite`, a aba tenta localizar a aplicacao `EDITE`. Depois disso, os vhosts sao enriquecidos com os dados da view, como `SVLDREPOATOS`, `192.168.53.56`, `Rede Desenvolvimento` e `Running`.

### Arquitetura do CRUD

O CRUD inicial de infraestrutura segue a estrutura:

```text
backend/
+-- db/
|   +-- client.ts
+-- shared/
|   +-- http/
|       +-- async-handler.ts
|       +-- errors.ts
+-- modules/
    +-- infra/
        +-- infra.types.ts
        +-- aplicacao.repository.ts
        +-- aplicacao.mapper.ts
        +-- aplicacao.service.ts
        +-- infra.schemas.ts
        +-- infra.controller.ts
        +-- infra.routes.ts
```

Responsabilidades:

```text
infra.types.ts           -> tipos do dominio e DTOs
aplicacao.repository.ts  -> SQL e acesso ao PostgreSQL
aplicacao.mapper.ts      -> transformacao entre linhas do banco e objetos de dominio
aplicacao.service.ts     -> regras de negocio, orquestracao e tratamento de erros do banco
infra.schemas.ts         -> validacao com zod
infra.controller.ts      -> adaptacao HTTP req/res
infra.routes.ts          -> definicao das rotas Express
```

Endpoints disponiveis:

```text
GET    /api/infra/aplicacoes
GET    /api/infra/aplicacoes/:id
POST   /api/infra/aplicacoes
PUT    /api/infra/aplicacoes/:id
DELETE /api/infra/aplicacoes/:id

GET    /api/infra/health
GET    /api/infra/status
GET    /api/infra/unidades
GET    /api/infra/vhosts

POST   /api/infra/aplicacoes/:id/hosts
DELETE /api/infra/aplicacoes/:id/hosts/:hostId

POST   /api/infra/aplicacoes/:id/unidades
DELETE /api/infra/aplicacoes/:id/unidades/:vinculoId
```

### Rotas administrativas

As rotas administrativas ficam sob `/api/admin` e reutilizam os services do modulo `infra`. Elas existem para telas internas de cadastro/manutencao, sem duplicar regra de negocio ou SQL.

Endpoints iniciais:

```text
GET    /api/admin/aplicacoes
POST   /api/admin/aplicacoes
PUT    /api/admin/aplicacoes/:id
DELETE /api/admin/aplicacoes/:id

POST   /api/admin/aplicacoes/:id/hosts
DELETE /api/admin/aplicacoes/:id/hosts/:hostId

POST   /api/admin/aplicacoes/:id/unidades
DELETE /api/admin/aplicacoes/:id/unidades/:vinculoId

GET    /api/admin/status
GET    /api/admin/unidades
```

Payload para cadastrar aplicacao:

```json
{
  "idStatus": 1,
  "nome": "EDITE",
  "descricao": "Sistema de repositorio de atos normativos",
  "tecnologia": "React Js",
  "urlVersionamento": "https://gitlab.aeb.gov.br/cti/edite",
  "sigla": "EDITE",
  "hosts": [
    { "vhost": "SVLDREPOATOS" }
  ],
  "unidades": [
    {
      "idUnidade": 1,
      "responsavel": "Nome do responsavel"
    }
  ]
}
```

## Dependencias do Backend

O backend usa dependencias separadas do frontend.

```text
backend/package.json
backend/package-lock.json
```

Dependencias adicionadas para o CRUD:

```text
pg        -> driver PostgreSQL
zod       -> validacao de payloads
@types/pg -> tipos TypeScript do pg
swagger-ui-express        -> interface Swagger em /api/docs
@types/swagger-ui-express -> tipos TypeScript do Swagger UI
```

Como alguns ambientes Windows podem nao ter `npm` no PATH, as dependencias podem ser instaladas via Docker:

```powershell
cd C:\Users\wesley.pereira\Desktop\PROJETOS-AEB\wiki-aeb\wiki\backend
docker run --rm -v ${PWD}:/app -w /app node:20-alpine sh -c "npm install pg zod swagger-ui-express && npm install -D @types/pg @types/swagger-ui-express"
```

Para outros devs, depois de puxar a branch:

```powershell
cd backend
npm install
```

Ou, usando Docker:

```powershell
docker compose build
```

## Variaveis de Ambiente

O arquivo `.env` fica na raiz do projeto e nao deve ser commitado.

Exemplo:

```env
VITE_GITLAB_URL=https://gitlab.aeb.gov.br/api
VITE_GITLAB_TOKEN=seu_token
VITE_GROUP_PATH=cti

DATABASE_URL=postgresql://USUARIO:SENHA@192.168.53.207:5432/wiki

NUTANIX_URL=https://IP_DO_PRISM:9443
NUTANIX_USER=admin
NUTANIX_PASS=sua_senha
# NUTANIX_MOCK=true

PROMETHEUS_URL=http://IP_DO_PROMETHEUS:9090
# PROMETHEUS_MOCK=true

PORT=3000
```

Observacoes:

- `DATABASE_URL` sera usada pelo CRUD novo de infraestrutura.
- Se `DATABASE_URL` nao existir, o backend nao deve quebrar rotas antigas.
- Placeholders como `IP_DO_PROMETHEUS` e `IP_DO_PRISM` devem cair em mock nas integracoes de infraestrutura.

## Desenvolvimento

### Backend

```powershell
cd backend
npm install
npm run dev
```

Se `npm` nao estiver disponivel localmente, use Docker Compose.

### Testes do backend

Os testes unitarios do backend usam `node:test`, `node:assert` e `tsx`.

```powershell
cd backend
npm test
```

Cobertura inicial:

```text
tests/infra.schemas.test.ts      -> validacao dos schemas zod
tests/aplicacao.mapper.test.ts   -> mappers de linhas SQL para objetos da API
tests/openapi.test.ts            -> presenca das rotas admin no OpenAPI
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Docker

```powershell
docker compose up --build -d
```

Verificacao:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/health
```

Endpoints uteis:

```text
GET /api/docs
GET /api/docs.json
GET /api/health
GET /api/projetos
GET /api/prometheus/vms
GET /api/nutanix/vms
```

## Git e fluxo de trabalho

- Evitar trabalhar direto na `develop`.
- Para backend/infra, usar branch dedicada, por exemplo:

```text
feat/backend-crud-infra
```

- Commits devem ser curtos, simples e em PT-BR.

Exemplo:

```text
organiza backend infra
```

## Build

Build completo via Docker:

```powershell
docker compose build
```

Build apenas do backend via Docker:

```powershell
cd backend
docker run --rm -v ${PWD}:/app -w /app node:20-alpine sh -c "npm ci --silent && npm run build"
```

## Conhecimento de Dominio

Veja `knowledge/schema/CTI_WIKI.md` para convencoes e base de conhecimento do projeto.
