export const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  TSX: '#61dafb',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  PHP: '#777bb4',
  HTML: '#e34c26',
  'HTML+PHP': '#9a5396',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  PLpgSQL: '#336791',
  Hack: '#878787',
};

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang] ?? '#6b7280';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

export function accessLevelLabel(level: number): string {
  const map: Record<number, string> = {
    10: 'Guest',
    20: 'Reporter',
    30: 'Developer',
    40: 'Maintainer',
    50: 'Owner',
  };
  return map[level] ?? `Nível ${level}`;
}

export function accessLevelColor(level: number): string {
  const map: Record<number, string> = {
    10: 'bg-gray-100 text-gray-600',
    20: 'bg-blue-100 text-blue-700',
    30: 'bg-green-100 text-green-700',
    40: 'bg-yellow-100 text-yellow-700',
    50: 'bg-purple-100 text-purple-700',
  };
  return map[level] ?? 'bg-gray-100 text-gray-600';
}

export function topLanguages(langs: Record<string, number>, top = 3): [string, number][] {
  return Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);
}
