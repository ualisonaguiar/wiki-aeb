import { useState, useEffect } from 'react';
import { fetchProjectData } from '../services/gitlab';
import type { ProjectGQLData } from '../services/gitlab';

interface State {
  data: ProjectGQLData | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, ProjectGQLData>();

export function useProjectGraphQL(fullPath: string | null) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  useEffect(() => {
    if (!fullPath) return;

    if (cache.has(fullPath)) {
      setState({ data: cache.get(fullPath)!, loading: false, error: null });
      return;
    }

    setState({ data: null, loading: true, error: null });
    let cancelled = false;

    fetchProjectData(fullPath)
      .then((data) => {
        if (cancelled) return;
        cache.set(fullPath, data);
        setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Erro ao carregar dados',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [fullPath]);

  return state;
}
