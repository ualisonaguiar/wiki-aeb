import fetch from 'node-fetch';
import https from 'https';
import { NUTANIX_PASS, NUTANIX_URL, NUTANIX_USER } from './config.js';

const agent = new https.Agent({ rejectUnauthorized: false });

function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${NUTANIX_USER}:${NUTANIX_PASS}`).toString('base64');
}

export async function prismGet<T>(path: string): Promise<T> {
  const res = await fetch(`${NUTANIX_URL}${path}`, {
    headers: {
      Authorization: basicAuth(),
      'Content-Type': 'application/json',
    },
    agent,
  });

  if (!res.ok) {
    throw new Error(`Prism ${res.status} ${res.statusText}`);
  }

  return await res.json() as T;
}
