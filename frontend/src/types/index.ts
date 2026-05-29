export interface Project {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  created_at: string;
  last_activity_at: string;
  default_branch: string | null;
  star_count: number;
  open_issues_count: number;
  languages: Record<string, number>;
}

export interface Member {
  id: number;
  name: string;
  username: string;
  access_level: number;
}

export type AccessLevel = 10 | 20 | 30 | 40 | 50;
