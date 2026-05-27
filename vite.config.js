import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

const entryByMode = {
  customer: 'customer/frontend/index.html',
  partner: 'worker/frontend/partner.html',
  admin: 'admin/frontend/admin.html',
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const entry = entryByMode[mode] ?? entryByMode.customer

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: resolve(rootDir, entry),
      },
    },
  }
})
