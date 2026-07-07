class ProjetoService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) {
      throw new Error(`GitLab API error: ${res.status}`);
    }

    return res.json();
  }

  async getProjects() {
    return await this.request('/projetos');
  }

  getProject(id: number) {
    return this.request(`/projetos/${id}`);
  }

  getProjectLanguages(id: number) {
    return this.request(`/projetos/${id}/languages`);
  }

  getInfoMergeRequest(fullPath: string) {
    return this.request(`/projetos/merge-request?fullPath=${fullPath}`);
  }

  getBranchInfo(fullPath: string) {
    return this.request(`/projetos/branch?fullPath=${fullPath}`);
  }

  getPipelineInfo(fullPath: string) {
    return this.request(`/projetos/pipeline?fullPath=${fullPath}`);
  }

  getReadme(fullPath: string) {
    return this.request(`/projetos/readme?fullPath=${fullPath}`);
  }  
}

export const projetoService = new ProjetoService(
  import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_SERVER_UML ?? '/api'
);
