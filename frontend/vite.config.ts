import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gitlabUrl = env.VITE_GITLAB_URL ?? 'https://gitlab.aeb.gov.br'
  const apiProxyTarget =
    process.env.API_PROXY_TARGET ??
    env.API_PROXY_TARGET ??
    `http://localhost:${env.PORT ?? 3000}`

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/gitlab-proxy': {
          target: gitlabUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/gitlab-proxy/, ''),
        },
        '/api': {
          target: apiProxyTarget,
          changeOrigin: false,
        },
      },
    },
  }
})
