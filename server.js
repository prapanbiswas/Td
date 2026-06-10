const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1><p><a href="/">← Home</a></p>');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Remove trailing slash for non-root paths
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  // Resolve file path
  let filePath = path.join(__dirname, urlPath);

  // Check if path exists as-is
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Try index.html inside directory
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        serveFile(indexPath, res);
        return;
      }
    } else {
      serveFile(filePath, res);
      return;
    }
  }

  // Try adding .html extension
  if (fs.existsSync(filePath + '.html')) {
    serveFile(filePath + '.html', res);
    return;
  }

  // Try directory/index.html
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    serveFile(indexPath, res);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<!DOCTYPE html><html><head><title>404 — ToolDuck.xyz</title><link rel="stylesheet" href="/assets/css/global.css"></head><body style="display:grid;place-items:center;min-height:100vh;"><div style="text-align:center;"><img src="/assets/images/duck-404.png" alt="ToolDuck 404" style="width:180px;margin-bottom:1.5rem;filter:drop-shadow(0 12px 28px rgba(255,210,63,0.3))"><h1 style="font-size:4rem;font-weight:900;color:var(--accent-primary);">404</h1><p style="color:var(--text-secondary);margin-bottom:1.5rem;">Quack! That page doesn\'t exist.</p><a href="/" style="color:var(--accent-primary);font-weight:600;text-decoration:none;border:1px solid rgba(255,210,63,0.3);padding:0.5rem 1.25rem;border-radius:100px;background:rgba(255,210,63,0.08);">&larr; Back to ToolDuck</a></div></body></html>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ToolDuck.xyz running at http://0.0.0.0:${PORT}`);
});
