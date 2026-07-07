export interface InventarioVm {
  id: number;
  vm: string;
  status: string | null;
  hospedeiro: string | null;
  nuvem: string | null;
  descricao: string | null;
  ipv4: string | null;
  ipv6: string | null;
  logicalNetwork: string | null;
  so: string | null;
  vcpu: number | null;
  memoriaGb: number | null;
  discoGb: number | null;
  tag: string | null;
  caminho: string | null;
  geracao: string | null;
  aplicacoes?: AplicacaoRelacionada[];
}

export interface AplicacaoRelacionada {
  id: number;
  nome: string;
  sigla: string | null;
  vhost: string;
}

export interface CreateInventarioVmInput {
  vm: string;
  status?: string | null;
  hospedeiro?: string | null;
  nuvem?: string | null;
  descricao?: string | null;
  ipv4?: string | null;
  ipv6?: string | null;
  logicalNetwork?: string | null;
  so?: string | null;
  vcpu?: number | null;
  memoriaGb?: number | null;
  discoGb?: number | null;
  tag?: string | null;
  caminho?: string | null;
  geracao?: string | null;
}

export interface UpdateInventarioVmInput {
  vm?: string;
  status?: string | null;
  hospedeiro?: string | null;
  nuvem?: string | null;
  descricao?: string | null;
  ipv4?: string | null;
  ipv6?: string | null;
  logicalNetwork?: string | null;
  so?: string | null;
  vcpu?: number | null;
  memoriaGb?: number | null;
  discoGb?: number | null;
  tag?: string | null;
  caminho?: string | null;
  geracao?: string | null;
}
