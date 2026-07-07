import { Router } from 'express';
import { executeGitlabQuery } from '../../services/gitlab.service.js';

const router = Router();

type GitlabProject = {
  id: string;
  name: string;
  fullPath: string;
  repository?: {
    rootRef?: string;
  };
  description?: string | null;
  webUrl: string;
  visibility: string;
  createdAt: string;
  lastActivityAt: string;
  languages: Array<{
    name: string;
    color: string;
    share: number;
  }>;
  projectId: number;
};

async function fetchProjects(): Promise<GitlabProject[]> {
  const groupPath = process.env.VITE_GROUP_PATH ?? process.env.GITLAB_GROUP_PATH ?? 'cti';
  const query = `
      query Projects($groupPath: ID!) {
        group(fullPath: $groupPath) {
          projects(first: 100, includeSubgroups: true) {
            nodes {
              id
              name
              fullPath
              repository {
                rootRef
              }              
              description
              webUrl
              visibility
              createdAt
              lastActivityAt
              languages {
                name
                color
                share
              }        
            }
          }
        }
      }
    `;

  const response = await executeGitlabQuery(query, { groupPath: groupPath.toLowerCase() });

  return response?.data?.group?.projects?.nodes?.map(
    (project: Omit<GitlabProject, 'projectId'>) => ({
      ...project,
      projectId: Number(project.id.split('/').pop()),
    })
  ) ?? [];
}

router.get('/', async (_req, _res) => {
  try {
    const projects = await fetchProjects();

    _res.json(projects);
  } catch (error) {
    console.error(error);

    _res.status(500).json({
      error: String(error),
    });
  }
});

router.get('/readme', async (_req, _res) => {
  try {
    const { fullPath } = _req.query;
    const query = `
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
    const response = await executeGitlabQuery(query, { fullPath });

    _res.json(response?.data?.project);
  } catch (error) {
    console.error(error);

    _res.status(500).json({
      error: String(error),
    });
  }
});

router.get('/merge-request', async (_req, _res) => {
  try {
    const { fullPath } = _req.query;
    const query = `
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
    const response = await executeGitlabQuery(query, { fullPath });

    _res.json(response?.data?.project);
  } catch (error) {
    console.error(error);

    _res.status(500).json({
      error: String(error),
    });
  }
});


router.get('/pipeline', async (_req, _res) => {
  try {
    const { fullPath } = _req.query;
    const query = `
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
    const response = await executeGitlabQuery(query, { fullPath });

    _res.json(response?.data?.project);
  } catch (error) {
    console.error(error);

    _res.status(500).json({
      error: String(error),
    });
  }
});

router.get('/branch', async (_req, _res) => {
  try {
    const { fullPath } = _req.query;
    const query = `
    query Branches($fullPath: ID!) {
      project(fullPath: $fullPath) {
        repository {
          rootRef
          branchNames(
            searchPattern: "*"
            offset: 0
            limit: 10
          )
        }
      }
    }
    `;
    const response = await executeGitlabQuery(query, { fullPath });

    _res.json(response?.data?.project);
  } catch (error) {
    console.error(error);

    _res.status(500).json({
      error: String(error),
    });
  }
});

router.get('/:id', async (_req, _res) => {
  try {
    const projectId = Number(_req.params.id);
    const projects = await fetchProjects();
    const project = projects.find((item) => item.projectId === projectId);

    if (!project) {
      return _res.status(404).json({ error: 'Projeto nao encontrado' });
    }

    return _res.json(project);
  } catch (error) {
    console.error(error);

    return _res.status(500).json({
      error: String(error),
    });
  }
});

router.get('/:id/languages', async (_req, _res) => {
  try {
    const projectId = Number(_req.params.id);
    const projects = await fetchProjects();
    const project = projects.find((item) => item.projectId === projectId);

    if (!project) {
      return _res.status(404).json({ error: 'Projeto nao encontrado' });
    }

    return _res.json(project.languages ?? []);
  } catch (error) {
    console.error(error);

    return _res.status(500).json({
      error: String(error),
    });
  }
});

export default router;
