export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Wiki CTI API',
    version: '1.0.0',
    description: 'API da Wiki CTI para projetos e inventario de infraestrutura.',
  },
  servers: [
    {
      url: '/api',
      description: 'API local',
    },
  ],
  tags: [
    { name: 'Health', description: 'Verificacoes de saude da API' },
    { name: 'Infra', description: 'CRUD de aplicacoes e relacionamentos de infraestrutura' },
    { name: 'Admin', description: 'Rotas administrativas para cadastro e manutencao de aplicacoes' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica saude geral da API',
        responses: {
          '200': { description: 'API disponivel' },
        },
      },
    },
    '/infra/health': {
      get: {
        tags: ['Infra'],
        summary: 'Verifica conexao com o banco do CRUD de infraestrutura',
        responses: {
          '200': {
            description: 'Banco conectado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InfraHealth' },
              },
            },
          },
          '503': {
            description: 'Banco indisponivel ou credenciais invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/infra/status': {
      get: {
        tags: ['Infra'],
        summary: 'Lista status de aplicacao',
        responses: {
          '200': {
            description: 'Lista de status',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Status' },
                },
              },
            },
          },
        },
      },
    },
    '/infra/unidades': {
      get: {
        tags: ['Infra'],
        summary: 'Lista unidades da AEB',
        responses: {
          '200': {
            description: 'Lista de unidades',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Unidade' },
                },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes': {
      get: {
        tags: ['Infra'],
        summary: 'Lista aplicacoes cadastradas',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Busca por nome ou sigla',
          },
          {
            name: 'idStatus',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filtra pelo status da aplicacao',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de aplicacoes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Aplicacao' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Infra'],
        summary: 'Cria uma aplicacao',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAplicacaoInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Aplicacao criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Aplicacao' },
              },
            },
          },
          '400': {
            description: 'Payload invalido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Registro duplicado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes/{id}': {
      get: {
        tags: ['Infra'],
        summary: 'Busca uma aplicacao por ID',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        responses: {
          '200': {
            description: 'Aplicacao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Aplicacao' },
              },
            },
          },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Infra'],
        summary: 'Atualiza uma aplicacao',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAplicacaoInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Aplicacao atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Aplicacao' },
              },
            },
          },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Infra'],
        summary: 'Remove uma aplicacao',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        responses: {
          '204': { description: 'Aplicacao removida' },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes/{id}/hosts': {
      post: {
        tags: ['Infra'],
        summary: 'Adiciona host/vhost a uma aplicacao',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateHostInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Host criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AplicacaoHost' },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes/{id}/hosts/{hostId}': {
      delete: {
        tags: ['Infra'],
        summary: 'Remove host/vhost de uma aplicacao',
        parameters: [
          { $ref: '#/components/parameters/AplicacaoId' },
          { $ref: '#/components/parameters/HostId' },
        ],
        responses: {
          '204': { description: 'Host removido' },
          '404': {
            description: 'Host nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes/{id}/unidades': {
      post: {
        tags: ['Infra'],
        summary: 'Adiciona vinculo entre aplicacao e unidade',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUnidadeVinculoInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Vinculo criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AplicacaoUnidade' },
              },
            },
          },
        },
      },
    },
    '/infra/aplicacoes/{id}/unidades/{vinculoId}': {
      delete: {
        tags: ['Infra'],
        summary: 'Remove vinculo entre aplicacao e unidade',
        parameters: [
          { $ref: '#/components/parameters/AplicacaoId' },
          { $ref: '#/components/parameters/VinculoId' },
        ],
        responses: {
          '204': { description: 'Vinculo removido' },
          '404': {
            description: 'Vinculo nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes': {
      get: {
        tags: ['Admin'],
        summary: 'Lista aplicacoes para administracao',
        responses: {
          '200': {
            description: 'Lista de aplicacoes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Aplicacao' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Cadastra uma aplicacao',
        description: 'Cria uma aplicacao em tb_aplicacao e, opcionalmente, seus vhosts e vinculos de unidade.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAplicacaoInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Aplicacao cadastrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Aplicacao' },
              },
            },
          },
          '400': {
            description: 'Payload invalido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Registro duplicado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Atualiza uma aplicacao cadastrada',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAplicacaoInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Aplicacao atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Aplicacao' },
              },
            },
          },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Remove uma aplicacao cadastrada',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        responses: {
          '204': { description: 'Aplicacao removida' },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes/{id}/hosts': {
      post: {
        tags: ['Admin'],
        summary: 'Adiciona vhost a uma aplicacao cadastrada',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateHostInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Vhost cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AplicacaoHost' },
              },
            },
          },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes/{id}/hosts/{hostId}': {
      delete: {
        tags: ['Admin'],
        summary: 'Remove vhost de uma aplicacao cadastrada',
        parameters: [
          { $ref: '#/components/parameters/AplicacaoId' },
          { $ref: '#/components/parameters/HostId' },
        ],
        responses: {
          '204': { description: 'Vhost removido' },
          '404': {
            description: 'Vhost nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes/{id}/unidades': {
      post: {
        tags: ['Admin'],
        summary: 'Adiciona unidade responsavel a uma aplicacao',
        parameters: [{ $ref: '#/components/parameters/AplicacaoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUnidadeVinculoInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Vinculo cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AplicacaoUnidade' },
              },
            },
          },
          '404': {
            description: 'Aplicacao nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/aplicacoes/{id}/unidades/{vinculoId}': {
      delete: {
        tags: ['Admin'],
        summary: 'Remove unidade responsavel de uma aplicacao',
        parameters: [
          { $ref: '#/components/parameters/AplicacaoId' },
          { $ref: '#/components/parameters/VinculoId' },
        ],
        responses: {
          '204': { description: 'Vinculo removido' },
          '404': {
            description: 'Vinculo nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/status': {
      get: {
        tags: ['Admin'],
        summary: 'Lista status disponiveis para cadastro de aplicacao',
        responses: {
          '200': {
            description: 'Lista de status',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Status' },
                },
              },
            },
          },
        },
      },
    },
    '/admin/unidades': {
      get: {
        tags: ['Admin'],
        summary: 'Lista unidades disponiveis para vinculo de responsavel',
        responses: {
          '200': {
            description: 'Lista de unidades',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Unidade' },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      AplicacaoId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      HostId: {
        name: 'hostId',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      VinculoId: {
        name: 'vinculoId',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    schemas: {
      InfraHealth: {
        type: 'object',
        required: ['status', 'database'],
        properties: {
          status: { type: 'string', example: 'ok' },
          database: { type: 'string', example: 'connected' },
        },
      },
      Status: {
        type: 'object',
        required: ['id', 'descricao'],
        properties: {
          id: { type: 'integer', example: 1 },
          descricao: { type: 'string', example: 'Ativo' },
        },
      },
      Unidade: {
        type: 'object',
        required: ['id', 'descricao'],
        properties: {
          id: { type: 'integer', example: 262 },
          descricao: { type: 'string', example: 'Assessoria de Cooperacao Internacional' },
          sigla: { type: 'string', nullable: true, example: 'ACI' },
        },
      },
      AplicacaoHost: {
        type: 'object',
        required: ['id', 'idAplicacao', 'vhost'],
        properties: {
          id: { type: 'integer' },
          idAplicacao: { type: 'integer' },
          vhost: { type: 'string', example: 'sistema.aeb.gov.br' },
        },
      },
      AplicacaoUnidade: {
        type: 'object',
        required: ['id', 'idAplicacao', 'idUnidade', 'unidadeDescricao', 'responsavel'],
        properties: {
          id: { type: 'integer' },
          idAplicacao: { type: 'integer' },
          idUnidade: { type: 'integer' },
          unidadeDescricao: { type: 'string' },
          unidadeSigla: { type: 'string', nullable: true },
          responsavel: { type: 'string' },
        },
      },
      Aplicacao: {
        type: 'object',
        required: ['id', 'idStatus', 'statusDescricao', 'nome', 'hosts', 'unidades'],
        properties: {
          id: { type: 'integer' },
          idStatus: { type: 'integer' },
          statusDescricao: { type: 'string' },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          tecnologia: { type: 'string', nullable: true },
          urlVersionamento: { type: 'string', nullable: true },
          sigla: { type: 'string', nullable: true },
          hosts: {
            type: 'array',
            items: { $ref: '#/components/schemas/AplicacaoHost' },
          },
          unidades: {
            type: 'array',
            items: { $ref: '#/components/schemas/AplicacaoUnidade' },
          },
        },
      },
      CreateAplicacaoInput: {
        type: 'object',
        required: ['idStatus', 'nome'],
        properties: {
          idStatus: { type: 'integer', minimum: 1 },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          tecnologia: { type: 'string', nullable: true },
          urlVersionamento: { type: 'string', nullable: true },
          sigla: { type: 'string', nullable: true },
          hosts: {
            type: 'array',
            items: { $ref: '#/components/schemas/CreateHostInput' },
          },
          unidades: {
            type: 'array',
            items: { $ref: '#/components/schemas/CreateUnidadeVinculoInput' },
          },
        },
      },
      UpdateAplicacaoInput: {
        type: 'object',
        properties: {
          idStatus: { type: 'integer', minimum: 1 },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          tecnologia: { type: 'string', nullable: true },
          urlVersionamento: { type: 'string', nullable: true },
          sigla: { type: 'string', nullable: true },
        },
      },
      CreateHostInput: {
        type: 'object',
        required: ['vhost'],
        properties: {
          vhost: { type: 'string', example: 'sistema.aeb.gov.br' },
        },
      },
      CreateUnidadeVinculoInput: {
        type: 'object',
        required: ['idUnidade', 'responsavel'],
        properties: {
          idUnidade: { type: 'integer', minimum: 1, example: 262 },
          responsavel: { type: 'string', example: 'Nome do responsavel' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error', 'code'],
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: {},
        },
      },
    },
  },
} as const;
