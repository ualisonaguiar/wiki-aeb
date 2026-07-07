export const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? '';
export const USE_PROMETHEUS_MOCK =
  !PROMETHEUS_URL ||
  process.env.PROMETHEUS_MOCK === 'true' ||
  isPlaceholderUrl(PROMETHEUS_URL);

export function isNodeExporterUrl(url: string): boolean {
  return url.includes(':9100');
}

export function getNodeExporterTargets(url: string): string[] {
  if (!url) return [];

  return url
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean);
}

function isPlaceholderUrl(url: string): boolean {
  return url.toLowerCase().includes('ip_do_');
}
