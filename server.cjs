const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const distDir = path.resolve(__dirname, 'dist');
const assets = new Map();

// Preload all dist files into RAM for 0ms response time (bypasses macOS iCloud Documents latency)
function loadDistIntoMemory() {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    assets.set('/index.html', {
      body: fs.readFileSync(indexHtmlPath),
      type: 'text/html; charset=utf-8',
    });
  }
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    for (const file of fs.readdirSync(assetsDir)) {
      const ext = path.extname(file);
      const type =
        ext === '.js'
          ? 'application/javascript; charset=utf-8'
          : ext === '.css'
          ? 'text/css; charset=utf-8'
          : 'application/octet-stream';
      assets.set(`/assets/${file}`, {
        body: fs.readFileSync(path.join(assetsDir, file)),
        type,
      });
    }
  }
}

loadDistIntoMemory();

function handleRequest(req, res) {
  const url = (req.url || '/').split('?')[0];

  // Proxy /api requests to backend on port 8000, or fail fast so frontend offline mode activates immediately
  if (url.startsWith('/api')) {
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: 8000,
        path: req.url,
        method: req.method,
        headers: req.headers,
        timeout: 1500,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );
    proxyReq.on('error', () => {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Backend offline — using local store' }));
    });
    req.pipe(proxyReq);
    return;
  }

  // Exact static asset match
  if (assets.has(url)) {
    const item = assets.get(url);
    res.writeHead(200, {
      'Content-Type': item.type,
      'Content-Length': item.body.length,
      'Cache-Control': 'no-cache',
    });
    res.end(item.body);
    console.log(`[200] ${req.method} ${url} (${item.body.length} bytes)`);
    return;
  }

  // Favicon fallback
  if (url === '/qairu-icon.svg' || url === '/favicon.ico') {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#bf5af2"/><text x="16" y="22" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="18">Q</text></svg>';
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(svg);
    return;
  }

  // SPA fallback -> index.html
  const indexItem = assets.get('/index.html');
  if (indexItem) {
    res.writeHead(200, {
      'Content-Type': indexItem.type,
      'Content-Length': indexItem.body.length,
      'Cache-Control': 'no-cache',
    });
    res.end(indexItem.body);
    console.log(`[SPA 200] ${req.method} ${url} -> /index.html`);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

const ports = [5173, 5175, 3000];
let opened = false;

ports.forEach((port) => {
  const server = http.createServer(handleRequest);
  server.on('error', (err) => {
    console.log(`[Port ${port}] Skipped (${err.code})`);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`  ➜  Ready on: http://127.0.0.1:${port}/  and  http://localhost:${port}/`);
    // Self-test
    http.get(`http://127.0.0.1:${port}/`, (res) => {
      console.log(`  ✓  Self-test http://127.0.0.1:${port}/ -> HTTP ${res.statusCode}`);
    });
    if (!opened && port === 5175) {
      opened = true;
      exec('open http://127.0.0.1:5175/');
    }
  });
});
