export interface InfraAplicacaoHost {
  id: number;
  idAplicacao: number;
  vhost: string;
}

export interface InfraAplicacaoUnidade {
  id: number;
  idAplicacao: number;
  idUnidade: number;
  unidadeDescricao: string;
  unidadeSigla: string | null;
  responsavel: string;
}

export interface InfraAplicacao {
  id: number;
  idStatus: number;
  statusDescricao: string;
  nome: string;
  descricao: string | null;
  tecnologia: string | null;
  urlVersionamento: string | null;
  sigla: string | null;
  hosts: InfraAplicacaoHost[];
  unidades: InfraAplicacaoUnidade[];
}

export interface InfraVhostInfo {
  vhost: string;
  ipv4: string | null;
  logicalNetwork: string | null;
  status: string | null;
  urlVersionamento: string | null;
}

class InfraService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Infra API error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  getAplicacoes() {
    return this.request<InfraAplicacao[]>("/infra/aplicacoes");
  }

  getVhostInformacoes() {
    return this.request<InfraVhostInfo[]>("/infra/vhosts");
  }
}

export const infraService = new InfraService(
  import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_SERVER_UML ?? "/api",
);
