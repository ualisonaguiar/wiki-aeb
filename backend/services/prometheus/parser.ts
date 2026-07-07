export function parseMetricValue(
  body: string,
  metricName: string,
  labels?: Record<string, string>,
): number {
  for (const line of body.split('\n')) {
    if (line.startsWith('#') || !line.startsWith(metricName)) continue;

    if (labels && !matchesLabels(line, labels)) continue;

    const rawValue = line.trim().split(/\s+/).at(-1);
    const value = Number(rawValue);
    return Number.isNaN(value) ? 0 : value;
  }

  return 0;
}

export function countMetricMatches(
  body: string,
  metricName: string,
  labels?: Record<string, string>,
): number {
  return body
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .filter((line) => line.startsWith(metricName))
    .filter((line) => !labels || matchesLabels(line, labels))
    .length;
}

function matchesLabels(line: string, labels: Record<string, string>): boolean {
  return Object.entries(labels).every(([key, value]) => line.includes(`${key}="${value}"`));
}
