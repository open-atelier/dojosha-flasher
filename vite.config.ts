import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** public/local/ holds a local dojosha build for `pnpm dev:local`. Keep it out of every deploy. */
function dropLocalFirmware(): Plugin {
  return {
    name: 'drop-local-firmware',
    apply: 'build',
    closeBundle() {
      rmSync(fileURLToPath(new URL('./dist/local', import.meta.url)), { recursive: true, force: true })
    },
  }
}

export default defineConfig({
  // Relative paths, so that the same build works at the root of a domain and under
  // a GitHub Pages project path (https://<owner>.github.io/dojosha-flasher/).
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [tailwindcss(), react(), dropLocalFirmware()],
  server: {
    // Web Serial needs a secure context: localhost is one, a LAN address is not.
    host: 'localhost',
  },
})
