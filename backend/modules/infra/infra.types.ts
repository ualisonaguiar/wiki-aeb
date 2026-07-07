export interface Status {
  id: number;
  descricao: string;
}

export interface Unidade {
  id: number;
  descricao: string;
  sigla: string | null;
}

export interface AplicacaoHost {
  id: number;
  idAplicacao: number;
  vhost: string;
}

export interface AplicacaoUnidade {
  id: number;
  idAplicacao: number;
  idUnidade: number;
  unidadeDescricao: string;
  unidadeSigla: string | null;
  responsavel: string;
}

export interface Aplicacao {
  id: number;
  idStatus: number;
  statusDescricao: string;
  nome: string;
  descricao: string | null;
  tecnologia: string | null;
  urlVersionamento: string | null;
  sigla: string | null;
  hosts: AplicacaoHost[];
  unidades: AplicacaoUnidade[];
}

export interface AplicacaoVhostInfo {
  vhost: string;
  ipv4: string | null;
  logicalNetwork: string | null;
  status: string | null;
  urlVersionamento: string | null;
}

export interface CreateAplicacaoInput {
  idStatus: number;
  nome: string;
  descricao?: string | null;
  tecnologia?: string | null;
  urlVersionamento?: string | null;
  sigla?: string | null;
  hosts?: CreateAplicacaoHostInput[];
  unidades?: CreateAplicacaoUnidadeInput[];
}

export interface UpdateAplicacaoInput {
  idStatus?: number;
  nome?: string;
  descricao?: string | null;
  tecnologia?: string | null;
  urlVersionamento?: string | null;
  sigla?: string | null;
}

export interface CreateAplicacaoHostInput {
  vhost: string;
}

export interface CreateAplicacaoUnidadeInput {
  idUnidade: number;
  responsavel: string;
}
