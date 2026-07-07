export const NUTANIX_URL = process.env.NUTANIX_URL ?? '';
export const NUTANIX_USER = process.env.NUTANIX_USER ?? '';
export const NUTANIX_PASS = process.env.NUTANIX_PASS ?? '';
export const USE_NUTANIX_MOCK =
  !NUTANIX_URL ||
  process.env.NUTANIX_MOCK === 'true' ||
  NUTANIX_URL.toLowerCase().includes('ip_do_');
