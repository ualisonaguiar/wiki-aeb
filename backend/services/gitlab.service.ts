import https from 'https';
import fetch from 'node-fetch';

type GraphQLResponse<T = any> = {
  data: T;
  errors?: unknown;
};

export async function executeGitlabQuery<T = any>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GraphQLResponse<T>> {
  const gitlabUrl = (process.env.VITE_GITLAB_URL ?? process.env.GITLAB_URL ?? '')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
  const gitlabToken = process.env.VITE_GITLAB_TOKEN ?? process.env.GITLAB_TOKEN ?? '';
  const verifySsl = (process.env.GITLAB_VERIFY_SSL ?? 'false').toLowerCase() !== 'false';
  const agent = new https.Agent({ rejectUnauthorized: verifySsl });

  const response = await fetch(`${gitlabUrl}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': gitlabToken,
    },
    body: JSON.stringify({ query, variables }),
    agent,
  });

  return await response.json() as GraphQLResponse<T>;
}
