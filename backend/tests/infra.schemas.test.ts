import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createAplicacaoSchema,
  createAplicacaoUnidadeSchema,
  hostIdParamSchema,
  idParamSchema,
  listAplicacoesQuerySchema,
  updateAplicacaoSchema,
} from '../modules/infra/infra.schemas.js';

describe('infra schemas', () => {
  it('coage ids de params e query para number', () => {
    assert.deepEqual(idParamSchema.parse({ id: '10' }), { id: 10 });
    assert.deepEqual(hostIdParamSchema.parse({ id: '10', hostId: '20' }), {
      id: 10,
      hostId: 20,
    });
    assert.deepEqual(listAplicacoesQuerySchema.parse({ q: 'edite', idStatus: '1' }), {
      q: 'edite',
      idStatus: 1,
    });
  });

  it('valida payload completo de cadastro de aplicacao', () => {
    const payload = createAplicacaoSchema.parse({
      idStatus: '1',
      nome: 'EDITE',
      descricao: 'Sistema de repositorio de atos normativos',
      tecnologia: 'React Js',
      urlVersionamento: 'https://gitlab.aeb.gov.br/cti/edite',
      sigla: 'EDITE',
      hosts: [{ vhost: 'SVLDREPOATOS' }],
      unidades: [{ idUnidade: '262', responsavel: 'Carla Elisandra Campelo da Silva' }],
    });

    assert.equal(payload.idStatus, 1);
    assert.equal(payload.unidades?.[0]?.idUnidade, 262);
    assert.equal(payload.hosts?.[0]?.vhost, 'SVLDREPOATOS');
  });

  it('rejeita cadastro sem nome e vinculo de unidade sem responsavel', () => {
    assert.throws(() => createAplicacaoSchema.parse({ idStatus: 1, nome: '' }));
    assert.throws(() => createAplicacaoUnidadeSchema.parse({ idUnidade: 1, responsavel: '' }));
  });

  it('rejeita update sem nenhum campo', () => {
    assert.throws(() => updateAplicacaoSchema.parse({ }));
  });
});
