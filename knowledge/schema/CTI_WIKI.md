# Schema do Wiki CTI — AEB
> **Versão:** 1.0 · **Status:** Ativo · **Revisado em:** 2026-04-10
> **Responsável:** Equipe CTI · **Grupo GitLab:** https://gitlab.aeb.gov.br/groups/cti

---

## 1. Domínio

O **Wiki CTI** documenta todos os sistemas, projetos e conhecimentos do **Centro de Tecnologia da Informação da Agência Espacial Brasileira (AEB)**.

Cobre:
- Sistemas desenvolvidos internamente (frontend, backend, banco de dados, DevOps)
- Processos e fluxos de trabalho do CTI
- Entidades e atores externos integrados (DOU, RESBRA, outros órgãos)
- Decisões de arquitetura e débitos técnicos
- Histórico de mudanças relevantes

---

## 2. Estrutura de Diretórios

```
knowledge/
├── schema/
│   └── CTI_WIKI.md          # Este arquivo — o "cérebro" do wiki
├── raw/
│   ├── requisitos/          # Documentos de requisitos brutos (.pdf, .docx, .md)
│   ├── leis/                # Legislação e normativos relacionados
│   ├── atas/                # Atas de reunião
│   └── diagramas/           # Diagramas de arquitetura / fluxos
└── wiki/
    ├── index.md             # Índice mestre do wiki
    ├── log.md               # Log de operações de ingestão e revisões
    ├── projetos/            # Uma página por projeto GitLab
    │   ├── resbra.md
    │   ├── sis-evento.md
    │   ├── sis-bem-estar.md
    │   └── ...
    ├── conceitos/           # Conceitos técnicos e de domínio transversais
    │   ├── arquitetura_padrao.md
    │   ├── stack_tecnologica.md
    │   └── integracao_continua.md
    ├── entidades/           # Sistemas, órgãos e atores externos
    │   ├── aeb.md
    │   ├── jenkins.md
    │   └── gitlab.md
    └── decisoes/            # Architecture Decision Records (ADRs)
        └── adr_001_stack_nextjs.md
```

---

## 3. Convenções de Nomenclatura

| Tipo de página | Padrão de nome | Exemplo |
|---|---|---|
| Projeto GitLab | `projetos/[slug-do-projeto].md` | `projetos/sis-evento.md` |
| Conceito técnico | `conceitos/[slug-do-conceito].md` | `conceitos/autenticacao_jwt.md` |
| Entidade externa | `entidades/[slug-da-entidade].md` | `entidades/dou.md` |
| Decisão arquitetural | `decisoes/adr_[seq]_[slug].md` | `decisoes/adr_002_banco_postgres.md` |
| Síntese de reunião | `atas/sintese_[aaaa-mm-dd]_[tema].md` | `atas/sintese_2026-03-15_sprint_review.md` |
| Lei / normativo | `raw/leis/[tipo]_[numero]_[ano].md` | `raw/leis/lei_13931_2019.md` |

### Regras gerais
- Nomes em **minúsculo com underscores** (`_`) para separar palavras
- Slugs sem acentos e sem caracteres especiais
- Datas sempre no formato `AAAA-MM-DD`

---

## 4. Formato de Página (Frontmatter + Corpo)

Toda página wiki deve começar com frontmatter YAML:

```yaml
---
titulo: "Nome da Página"
tipo: projeto | conceito | entidade | decisao | ata
tags: [tag1, tag2]
status: rascunho | ativo | deprecado | arquivado
confidence: alta | media | baixa
data_criacao: AAAA-MM-DD
data_ultima_revisao: AAAA-MM-DD
autor: nome.sobrenome
projetos_relacionados: [slug1, slug2]
---
```

**Campos obrigatórios:** `titulo`, `tipo`, `status`, `data_ultima_revisao`

**Corpo:** Markdown puro com `[[wikilinks]]` para referências internas.
Exemplo: `Veja também [[conceitos/autenticacao_jwt]] e [[entidades/gitlab]]`

---

## 5. Workflow: Ingestão (`/cti-wiki ingest`)

Ao processar um documento bruto em `raw/`, o LLM deve:

### Passo 1 — Leitura e Extração
- Identificar: título, data, tipo (requisito / lei / ata / diagrama)
- Extrair: entidades mencionadas, projetos afetados, decisões, restrições

### Passo 2 — Criação / Atualização de Páginas
```
Para cada entidade identificada:
  → Criar ou atualizar wiki/entidades/[slug].md

Para cada projeto mencionado:
  → Criar ou atualizar wiki/projetos/[slug].md
  → Adicionar seção "Requisitos Identificados" se aplicável

Para cada decisão técnica:
  → Criar wiki/decisoes/adr_[N]_[slug].md

Para cada conceito novo:
  → Criar wiki/conceitos/[slug].md
```

### Passo 3 — Registro no Log
Em `wiki/log.md`, adicionar entrada:
```markdown
## [AAAA-MM-DD HH:MM] Ingestão: [nome-do-arquivo]
- **Operação:** ingest
- **Fonte:** raw/[subdir]/[arquivo]
- **Páginas criadas:** [[projetos/x]], [[conceitos/y]]
- **Páginas atualizadas:** [[entidades/z]]
- **Contradições sinalizadas:** [lista ou "nenhuma"]
- **Confidence geral:** alta | media | baixa
```

### Passo 4 — Atualização do Índice
Adicionar novas páginas em `wiki/index.md` com link e descrição de uma linha.

---

## 6. Workflow: Consulta (`/cti-wiki query`)

Ao responder perguntas sobre o domínio CTI:

1. **Prioridade de busca:** `wiki/` → `raw/` → conhecimento externo do LLM
2. **Citar fontes:** Sempre indicar a página wiki ou arquivo raw de origem
3. **Usar wikilinks:** Referenciar páginas relacionadas com `[[caminho/pagina]]`
4. **Sinalizar gaps:** Se não houver cobertura, indicar: `⚠️ Sem documentação — recomenda-se ingestar [fonte sugerida]`

**Exemplo de resposta esperada:**
```
Com base em [[projetos/sis-evento]] e [[conceitos/autenticacao_jwt]]:
O sistema usa autenticação JWT com refresh token de 24h.
Fonte: wiki/projetos/sis-evento.md (data_ultima_revisao: 2026-03-10)
```

---

## 7. Workflow: Lint (`/cti-wiki lint`)

Verificar periodicamente:

| Checagem | Critério de alerta |
|---|---|
| **Páginas órfãs** | Arquivo `.md` sem nenhum `[[wikilink]]` apontando para ele |
| **Confidence baixa** | `confidence: baixa` há mais de 30 dias sem atualização |
| **Contradições abertas** | Entradas no `log.md` com `"Contradições sinalizadas"` não resolvidas |
| **Status rascunho antigo** | `status: rascunho` há mais de 14 dias |
| **Projetos sem página** | Projeto no GitLab sem correspondente em `wiki/projetos/` |

---

## 8. Projetos do Grupo CTI (Referência Rápida)

| ID | Nome | Linguagens Principais | Página Wiki |
|---|---|---|---|
| 51 | resbra | TSX, TypeScript, PLpgSQL | [[projetos/resbra]] |
| 49 | Sis-bem-estar | TSX, Python | [[projetos/sis-bem-estar]] |
| 41 | Sistema Controle Chaves | TSX, Python | [[projetos/sistema-controle-chaves]] |
| 18 | rep_digital_aeb | TSX, TypeScript | [[projetos/rep-digital-aeb]] |
| 17 | ReLaca2026 | TSX, TypeScript | [[projetos/relaca2026]] |
| 15 | Ro-DOU-Webhook | PHP, Dockerfile | [[projetos/ro-dou-webhook]] |
| 14 | Ro-DOU | Python, HTML | [[projetos/ro-dou]] |
| 12 | colaboradores-adm | Python, HTML | [[projetos/colaboradores-adm]] |
| 11 | ColaboradoresAEB | JavaScript, CSS | [[projetos/colaboradoresaeb]] |
| 9  | teste | — | [[projetos/teste]] |
| 8  | omeka-s | PHP, JavaScript | [[projetos/omeka-s]] |
| 5  | assinatura-email-adm | Python, HTML | [[projetos/assinatura-email-adm]] |
| 4  | assinatura-email | PHP, Hack | [[projetos/assinatura-email]] |
| 1  | sis-evento | HTML, TSX, Python | [[projetos/sis-evento]] |

---

## 9. Stack Tecnológica do Grupo (Padrão Identificado)

- **Frontend:** React/Next.js com TypeScript e TSX
- **Backend:** Python (FastAPI / Django) ou PHP
- **Banco de Dados:** PostgreSQL (PLpgSQL presente em resbra e sis-evento)
- **CI/CD:** Jenkins (`app_jenkins` como membro Developer)
- **Containers:** Dockerfile presente em projetos Python e PHP
- **Versionamento:** GitLab (instância interna AEB)

---

## 10. Membros da Equipe CTI

| Nome | Username | Papel |
|---|---|---|
| Anderson Malta da Silva | anderson.malta | Owner |
| Milton César Disegna de Souza Leite | miltoncsl | Owner |
| Ualison Aguiar | ualison.frota | Owner |
| Eliaquim Monteiro Ramos | eliaquim.ramos | Owner |
| Wesley Bruno | wesleyB | Owner |
| Bianca Simas Wolfgram | bianca.wolfgram | Owner |
| Jonas Silva | Jonas | Owner |
| App Jenkins | app_jenkins | Developer (CI/CD) |

---

## 11. Próximos Passos Sugeridos

1. **Criar páginas de projeto** — Executar `/cti-wiki ingest` para cada projeto do GitLab e gerar `wiki/projetos/*.md` com informações do README (quando disponível) e metadados da API.
2. **Ingestar requisitos do RESBRA** — Processar documentos de regulação espacial em `raw/leis/` gerando `wiki/conceitos/` específicos.
3. **Criar ADRs** — Documentar decisões de arquitetura identificadas (ex: escolha de TSX/Python, uso de PLpgSQL).
4. **Script de ingestão automática** — Integrar o workflow de ingest com a API GraphQL do GitLab para atualizar automaticamente as páginas de projeto quando há novos commits.
5. **Adicionar aba "Wiki" no app React** — Ler os arquivos `wiki/**/*.md` via `import.meta.glob` e renderizá-los com react-markdown.

---

## 12. Dúvidas em Aberto

- O projeto `resbra` possui integração com banco PostgreSQL (PLpgSQL detectado) — qual o schema do banco? Isso pode enriquecer a página [[projetos/resbra]] e o conceito [[conceitos/schema_resbra]].
- O projeto `teste` parece estar vazio (sem linguagens). Deve ser incluído na documentação ou ignorado?
- O `omeka-s` é um fork do Omeka-S (plataforma de acervo digital)? Contexto necessário para criar a página correta em `wiki/projetos/omeka-s.md`.
- Qual a relação entre `assinatura-email` e `assinatura-email-adm`? São o mesmo sistema em versões diferentes?
