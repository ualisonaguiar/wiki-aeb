# Deploy em VM (rede interna AEB)

Este guia explica como publicar a **CTI Wiki** em uma VM dentro da rede interna da AEB para que ela consiga acessar:

- O **GitLab interno** (`gitlab.aeb.gov.br`)
- O **Nutanix Prism Element** ou **Prometheus** (API de infraestrutura)

## Requisitos na VM

- **Docker** + **Docker Compose** (ou Podman)
- Acesso de rede aos endpoints internos (GitLab e Nutanix/Prometheus)
- Porta `3000` liberada (ou ajuste no `docker-compose.yml`)

## 1. Copiar o projeto para a VM

```bash
git clone https://gitlab.aeb.gov.br/cti/wiki.git
cd wiki
```

Ou copie a pasta do projeto (incluindo `Dockerfile`, `docker-compose.yml`, `.env.example`).

## 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env
nano .env   # ou vim
```

Preencha:

| Variável | Descrição |
|----------|-----------|
| `VITE_GITLAB_URL` | URL do GitLab interno (`https://gitlab.aeb.gov.br`) |
| `VITE_GITLAB_TOKEN` | Token de acesso com escopos `read_api` + `read_repository` (role Maintainer+) |
| `VITE_GROUP_PATH` | `cti` |
| `NUTANIX_URL` | URL do Prism Element, ex: `https://10.x.x.x:9443` (deixe vazio se usar Prometheus) |
| `NUTANIX_USER` / `NUTANIX_PASS` | Credenciais do Prism |
| `NUTANIX_MOCK` | Remova ou comente para desativar mock e usar dados reais |
| `PROMETHEUS_URL` | URL do Prometheus, ex: `http://10.x.x.x:9090` (deixe vazio se usar Nutanix) |
| `PROMETHEUS_MOCK` | Remova ou comente para desativar mock e usar dados reais |

> ⚠️ **Segurança:** o `.env` já está no `.gitignore`. Nunca o commite.

## 3. Build e start

```bash
docker compose up --build -d
```

Isso:
1. Compila o frontend React (`dist/`)
2. Empacota o servidor Node/Express
3. Inicia o container expondo a porta `3000`

## 4. Verificar saúde

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "mode": "production",
  "nutanixMock": false,
  "prometheusMock": false,
  "timestamp": "..."
}
```

Se `nutanixMock` ou `prometheusMock` for `true`, verifique se a respectiva URL está preenchida no `.env`.

## 5. Acesso

Abra no navegador (de um host com rota para a VM):

```
http://<IP_DA_VM>:3000
```

## 6. Atualizar após mudanças de código

```bash
git pull
docker compose down
docker compose up --build -d
```

## Arquitetura na VM

```
┌─────────────────────────────────────────┐
│  VM (rede interna AEB)                  │
│                                         │
│  ┌──────────────┐                     │
│  │  Navegador   │ ──► http://vm:3000   │
│  └──────────────┘                     │
│         │                               │
│         ▼                               │
│  ┌──────────────────────────────────┐  │
│  │  Container cti-wiki:3000          │  │
│  │  ├── Express API                  │  │
│  │  │   ├── /api/gitlab  ──► GitLab │  │
│  │  │   ├── /api/nutanix  ──► Prism  │  │
│  │  │   └── /api/prometheus ──► Prom │  │
│  │  └── SPA React (dist/)            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Solução de problemas

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| "Nutanix: MOCK ativo" | `NUTANIX_URL` vazio | Preencha `.env` e recrie o container |
| "Prometheus: MOCK ativo" | `PROMETHEUS_URL` vazio | Preencha `.env` e recrie o container |
| Erro 502 no GitLab | Token inválido / VM sem rota | Verifique token e conectividade de rede |
| CORS no navegador | Acessando backend e frontend em origens diferentes | Use a mesma porta/IP (o container já serve tudo na 3000) |
