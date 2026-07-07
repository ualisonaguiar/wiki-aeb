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
  aplicacoes?: InfraAplicacaoRelacionada[];
}

export interface InfraAplicacaoRelacionada {
  id: number;
  nome: string;
  sigla: string | null;
  vhost: string;
}

class InfraService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...init,
    });

    let payload: unknown = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
    }

    if (!res.ok) {
      const message =
        (payload as { error?: string; message?: string } | null)?.error ||
        (payload as { error?: string; message?: string } | null)?.message ||
        `Infra API error: ${res.status}`;
      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    if (payload === null) {
      return [] as T;
    }

    return payload as T;
  }

  getAplicacoes() {
    return this.request<InfraAplicacao[]>("/infra/aplicacoes");
  }

  getVhostInformacoes() {
    return this.request<InfraVhostInfo[]>("/infra/vhosts");
  }

  getInventarioVms() {
    return this.request<InventarioVm[]>("/inventario-vm");
  }

  getInventarioVm(id: number) {
    return this.request<InventarioVm>(`/inventario-vm/${id}`);
  }

  createInventarioVm(input: Partial<InventarioVm>) {
    return this.request<InventarioVm>("/inventario-vm", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  updateInventarioVm(id: number, input: Partial<InventarioVm>) {
    return this.request<InventarioVm>(`/inventario-vm/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  deleteInventarioVm(id: number) {
    return this.request<void>(`/inventario-vm/${id}`, {
      method: "DELETE",
    });
  }

  getAplicacoesPorVm(vmName: string) {
    return this.request<InfraAplicacaoRelacionada[]>(
      `/inventario-vm/${encodeURIComponent(vmName)}/aplicacoes`,
    );
  }
}

export const infraService = new InfraService(
  import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_SERVER_UML ?? "/api",
);
