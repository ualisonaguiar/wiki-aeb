const GITLAB_TOKEN = import.meta.env.VITE_GITLAB_TOKEN as string;
// In dev, route through Vite proxy (/gitlab-proxy) to avoid CORS.
// In prod, call the backend API proxy so the token never leaves the server.
const GRAPHQL_ENDPOINT = import.meta.env.DEV
  ? '/gitlab-proxy/api/graphql'
  : '/api/gitlab/graphql';

export interface CommitInfo {
  id: string;
  title: string;
  message: string;
  authorName: string;
  committedDate: string;
  webUrl: string;
}

export interface MergeRequest {
  iid: string;
  title: string;
  state: 'opened' | 'closed' | 'locked' | 'merged';
  createdAt: string;
  mergedAt: string | null;
  sourceBranch: string;
  targetBranch: string;
  author: { name: string; username: string } | null;
}

export interface PipelineInfo {
  sha: string;
  ref: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
}

export interface ProjectGQLData {
  branches: string[];
  defaultBranch: string | null;
  lastCommit: CommitInfo | null;
  pipelines: PipelineInfo[];
  readme: string | null;
  mergeRequests: MergeRequest[];
}

async function gql(queryName: string, query: string, variables: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': GITLAB_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const msg = `[${queryName}] HTTP ${res.status} ${res.statusText}`;
    console.error(msg);
    throw new Error(msg);
  }

  const json = (await res.json()) as { data?: unknown; errors?: { message: string; path?: string[] }[] };

  if (json.errors?.length) {
    const msg = json.errors.map((e) => `${e.path?.join('.') ?? '?'}: ${e.message}`).join(' | ');
    console.warn(`[${queryName}] GraphQL errors:`, msg);
    throw new Error(msg);
  }

  console.debug(`[${queryName}] OK`, json.data);
  return json.data;
}

const PIPELINES_QUERY = `
  query Pipelines($fullPath: ID!) {
    project(fullPath: $fullPath) {
      pipelines(first: 10) {
        nodes {
          sha
          ref
          status
          createdAt
          finishedAt
        }
      }
    }
  }
`;

const MR_QUERY = `
  query MergeRequests($fullPath: ID!) {
    project(fullPath: $fullPath) {
      mergeRequests(first: 20, sort: CREATED_DESC) {
        nodes {
          iid
          title
          state
          createdAt
          mergedAt
          sourceBranch
          targetBranch
          author {
            name
            username
          }
        }
      }
    }
  }
`;

const README_QUERY = `
  query ProjectReadme($fullPath: ID!) {
    project(fullPath: $fullPath) {
      repository {
        blobs(paths: ["README.md"]) {
          nodes {
            rawBlob
            path
          }
        }
      }
    }
  }
`;

export async function fetchProjectData(fullPath: string): Promise<ProjectGQLData> {
  const result: ProjectGQLData = {
    branches: [],
    defaultBranch: null,
    lastCommit: null,
    pipelines: [],
    readme: null,
    mergeRequests: [],
  };

  await Promise.allSettled([
    gql('Pipelines', PIPELINES_QUERY, { fullPath }).then((data) => {
      const nodes = (
        data as { project: { pipelines: { nodes: PipelineInfo[] } } }
      ).project?.pipelines?.nodes;
      if (nodes?.length) {
        result.pipelines = nodes;
        // Derive unique branches and default branch from pipeline refs
        const refs = [...new Set(nodes.map((p) => p.ref).filter(Boolean))];
        result.branches = refs;
        // The most recent pipeline's ref is likely the default branch
        result.defaultBranch = nodes[0]?.ref ?? null;
        // Build a synthetic "last commit" from the most recent pipeline
        const latest = nodes[0];
        if (latest) {
          result.lastCommit = {
            id: latest.sha,
            title: `Pipeline em ${latest.ref}`,
            message: '',
            authorName: '',
            committedDate: latest.createdAt,
            webUrl: '',
          };
        }
      }
    }),

    gql('MergeRequests', MR_QUERY, { fullPath }).then((data) => {
      const nodes = (
        data as { project: { mergeRequests: { nodes: MergeRequest[] } } }
      ).project?.mergeRequests?.nodes;
      if (nodes) result.mergeRequests = nodes;
    }),

    gql('Readme', README_QUERY, { fullPath }).then((data) => {
      const nodes = (
        data as { project: { repository: { blobs: { nodes: { rawBlob: string; path: string }[] } } } }
      ).project?.repository?.blobs?.nodes;
      if (nodes?.length) result.readme = nodes[0].rawBlob ?? null;
    }),
  ]);

  return result;
}
