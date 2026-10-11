import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const distDir = path.resolve(__dirname, './dist')
const memoryAssets = new Map<string, { body: Buffer; type: string }>()

try {
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    memoryAssets.set('/index.html', {
      body: fs.readFileSync(path.join(distDir, 'index.html')),
      type: 'text/html; charset=utf-8',
    })
  }
  const assetsDir = path.join(distDir, 'assets')
  if (fs.existsSync(assetsDir)) {
    for (const file of fs.readdirSync(assetsDir)) {
      const ext = path.extname(file)
      const type =
        ext === '.js'
          ? 'application/javascript; charset=utf-8'
          : ext === '.css'
          ? 'text/css; charset=utf-8'
          : 'application/octet-stream'
      memoryAssets.set(`/assets/${file}`, {
        body: fs.readFileSync(path.join(assetsDir, file)),
        type,
      })
    }
  }
} catch {}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fast-memory-dist-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req.url || '/').split('?')[0]
          if (url.startsWith('/api')) {
            return next()
          }
          if (memoryAssets.has(url)) {
            const asset = memoryAssets.get(url)!
            res.statusCode = 200
            res.setHeader('Content-Type', asset.type)
            res.setHeader('Cache-Control', 'no-cache')
            res.end(asset.body)
            console.log(`[FAST-200] ${req.method} ${url} (${asset.body.length} bytes)`)
            return
          }
          // SPA fallback for routes like /, /login, /graph, /chapter/1
          if (
            !url.startsWith('/src/') &&
            !url.startsWith('/@') &&
            !url.startsWith('/node_modules/') &&
            !path.extname(url) &&
            memoryAssets.has('/index.html')
          ) {
            const indexHtml = memoryAssets.get('/index.html')!
            res.statusCode = 200
            res.setHeader('Content-Type', indexHtml.type)
            res.setHeader('Cache-Control', 'no-cache')
            res.end(indexHtml.body)
            console.log(`[FAST-SPA-200] ${req.method} ${url} -> /index.html`)
            return
          }
          next()
        })
      },
    },
  ],
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    open: 'http://localhost:5175',
    preTransformRequests: false,
    watch: {
      ignored: ['**/*'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
