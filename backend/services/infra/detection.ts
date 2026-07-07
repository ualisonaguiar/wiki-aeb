import type { InfraEnvironment } from './types.js';

const KNOWN_PROJECTS = [
  'resbra',
  'sisaps',
  'sis-evento',
  'sisbem',
  'sismca',
  'sisamb',
  'sisrh',
  'portal',
  'wiki',
  'sgq',
];

export function detectEnvironment(name: string): InfraEnvironment {
  const normalized = name.toLowerCase();

  if (normalized.includes('prod') || normalized.includes('prd')) return 'producao';
  if (normalized.includes('hom') || normalized.includes('stg') || normalized.includes('staging')) {
    return 'homologacao';
  }
  if (normalized.includes('dev') || normalized.includes('des')) return 'desenvolvimento';

  return 'outro';
}

export function detectProject(name: string): string | null {
  const normalized = name.toLowerCase();

  return KNOWN_PROJECTS.find((project) => {
    const searchableProject = project.replace('-', '').replace('_', '');
    return normalized.includes(searchableProject);
  }) ?? null;
}
