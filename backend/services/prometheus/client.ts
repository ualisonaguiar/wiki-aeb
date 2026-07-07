import fetch from 'node-fetch';

export interface PrometheusQueryResult {
  metric?: {
    instance?: string;
  };
  value?: [number, string];
}

export interface PrometheusQueryResponse {
  data?: {
    result?: PrometheusQueryResult[];
  };
}

export async function fetchNodeExporterMetrics(baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/metrics`);

  if (!res.ok) {
    throw new Error(`node_exporter ${res.status} ${res.statusText}`);
  }

  return res.text();
}

export async function queryPrometheus(baseUrl: string, query: string): Promise<PrometheusQueryResponse> {
  const encodedQuery = encodeURIComponent(query);
  const res = await fetch(`${baseUrl}/api/v1/query?query=${encodedQuery}`);

  if (!res.ok) {
    throw new Error(`Prometheus ${res.status} ${res.statusText}`);
  }

  return await res.json() as PrometheusQueryResponse;
}
