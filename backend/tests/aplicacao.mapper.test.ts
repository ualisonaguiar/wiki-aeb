import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  mapAplicacao,
  mapHost,
  mapStatus,
  mapUnidade,
  mapUnidadeVinculo,
  mapVhostInfo,
  type AplicacaoRow,
  type HostRow,
  type StatusRow,
  type UnidadeRow,
  type UnidadeVinculoRow,
  type VhostInfoRow,
} from '../modules/infra/aplicacao.mapper.js';

describe('aplicacao mapper', () => {
  it('mapeia aplicacao e filtra hosts/unidades pelo id da aplicacao', () => {
    const aplicacao = mapAplicacao(
      {
        id: 2,
        id_status: '1',
        status_descricao: 'Ativo',
        nome: 'EDITE',
        descricao: 'Sistema de repositorio de atos normativos',
        tecnologia: 'React Js',
        url_versionamento: 'https://gitlab.aeb.gov.br/cti/edite',
        sigla: 'EDITE',
      } as AplicacaoRow,
      [
        { id: 1, idAplicacao: 2, vhost: 'SVLDREPOATOS' },
        { id: 2, idAplicacao: 99, vhost: 'OUTROHOST' },
      ],
      [
        {
          id: 1,
          idAplicacao: 2,
          idUnidade: 262,
          unidadeDescricao: 'Diretoria de Planejamento, Orcamento e Administracao',
          unidadeSigla: 'DPOA',
          responsavel: 'Carla Elisandra Campelo da Silva',
        },
        {
          id: 2,
          idAplicacao: 99,
          idUnidade: 1,
          unidadeDescricao: 'Outra unidade',
          unidadeSigla: null,
          responsavel: 'Outro responsavel',
        },
      ],
    );

    assert.equal(aplicacao.id, 2);
    assert.equal(aplicacao.idStatus, 1);
    assert.equal(aplicacao.nome, 'EDITE');
    assert.deepEqual(aplicacao.hosts.map((host) => host.vhost), ['SVLDREPOATOS']);
    assert.deepEqual(aplicacao.unidades.map((unidade) => unidade.unidadeSigla), ['DPOA']);
  });

  it('mapeia entidades simples com coercao numerica', () => {
    assert.deepEqual(mapHost({ id: 1, id_aplicacao: '2', vhost: 'SVLDREPOATOS' } as HostRow), {
      id: 1,
      idAplicacao: 2,
      vhost: 'SVLDREPOATOS',
    });

    assert.deepEqual(
      mapUnidadeVinculo({
        id: 1,
        id_aplicacao: '2',
        id_unidade: '262',
        unidade_descricao: 'Diretoria de Planejamento, Orcamento e Administracao',
        unidade_sigla: 'DPOA',
        responsavel: 'Carla Elisandra Campelo da Silva',
      } as UnidadeVinculoRow),
      {
        id: 1,
        idAplicacao: 2,
        idUnidade: 262,
        unidadeDescricao: 'Diretoria de Planejamento, Orcamento e Administracao',
        unidadeSigla: 'DPOA',
        responsavel: 'Carla Elisandra Campelo da Silva',
      },
    );

    assert.deepEqual(mapStatus({ id: 1, descricao: 'Ativo' } as StatusRow), {
      id: 1,
      descricao: 'Ativo',
    });

    assert.deepEqual(mapUnidade({ id: 262, descricao: 'DPOA completa', sigla: 'DPOA' } as UnidadeRow), {
      id: 262,
      descricao: 'DPOA completa',
      sigla: 'DPOA',
    });
  });

  it('mapeia informacoes de vhost da view', () => {
    assert.deepEqual(
      mapVhostInfo({
        vhost: 'SVLDREPOATOS',
        ipv4: '192.168.53.56',
        logical_network: 'Rede Desenvolvimento',
        status: 'Running',
        url_versionamento: 'https://gitlab.aeb.gov.br/cti/edite',
      } as VhostInfoRow),
      {
        vhost: 'SVLDREPOATOS',
        ipv4: '192.168.53.56',
        logicalNetwork: 'Rede Desenvolvimento',
        status: 'Running',
        urlVersionamento: 'https://gitlab.aeb.gov.br/cti/edite',
      },
    );
  });
});
