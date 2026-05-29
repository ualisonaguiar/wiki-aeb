class GitlabService {
  private token: string;
  private baseUrl: string;

  constructor(token: string, baseUrl: string) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`GitLab API error: ${res.status}`);
    }

    return res.json();
  }

  getProjects() {
    return this.request("/projects");
  }
  getProject(id: number) {
    return this.request(`/projects/${id}`);
  }

  getProjectLanguages(id: number) {
    return this.request(`/projects/${id}/languages`);
  }
}

export const gitlabService = new GitlabService(
  import.meta.env.VITE_GITLAB_TOKEN,
  import.meta.env.VITE_GITLAB_URL,
);
