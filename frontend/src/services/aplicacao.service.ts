import type { InfraAplicacao } from "./infra.service";

export interface AdminStatus {
  id: number;
  descricao: string;
}

export interface AdminUnidade {
  id: number;
  descricao: string;
  sigla: string | null;
}

export interface CreateAdminAplicacaoInput {
  idStatus: number;
  nome: string;
  descricao?: string | null;
  tecnologia?: string | null;
  urlVersionamento?: string | null;
  sigla?: string | null;
  hosts?: Array<{
    vhost: string;
  }>;
  unidades?: Array<{
    idUnidade: number;
    responsavel: string;
  }>;
}

class AplicacaoService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem("token");

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`Admin API error: ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  getAplicacoes() {
    return this.request<InfraAplicacao[]>("/admin/aplicacoes");
  }

  getStatus() {
    return this.request<AdminStatus[]>("/admin/status");
  }

  getUnidades() {
    return this.request<AdminUnidade[]>("/admin/unidades");
  }

  createAplicacao(input: CreateAdminAplicacaoInput) {
    return this.request<InfraAplicacao>("/admin/aplicacoes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  updateAplicacao(id: number, input: CreateAdminAplicacaoInput) {
    return this.request<InfraAplicacao>(`/admin/aplicacoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  deleteAplicacao(id: number) {
    return this.request<void>(`/admin/aplicacoes/${id}`, {
      method: "DELETE",
    });
  }

  addHost(id: number, input: { vhost: string }) {
    return this.request<{ id: number; idAplicacao: number; vhost: string }>(
      `/admin/aplicacoes/${id}/hosts`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  }

  removeHost(id: number, hostId: number) {
    return this.request<void>(`/admin/aplicacoes/${id}/hosts/${hostId}`, {
      method: "DELETE",
    });
  }
}

export const aplicacaoService = new AplicacaoService(
  import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_SERVER_UML ?? "/api",
);
