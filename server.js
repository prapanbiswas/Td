const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.xml':  'text/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
};

const CACHE_STATIC = 'public, max-age=86400, stale-while-revalidate=604800';
const CACHE_HTML   = 'public, max-age=0, must-revalidate';
const CACHE_NONE   = 'no-cache, no-store, must-revalidate';

function getCacheHeader(ext) {
  if (ext === '.html') return CACHE_HTML;
  if (['.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.woff2','.woff','.ttf'].includes(ext)) return CACHE_STATIC;
  return CACHE_NONE;
}

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
      'Cache-Control': getCacheHeader(ext),
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  let filePath = path.join(__dirname, urlPath);

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
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

  if (fs.existsSync(filePath + '.html')) {
    serveFile(filePath + '.html', res);
    return;
  }

  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    serveFile(indexPath, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>404 — ToolDuck.xyz</title><link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg"><link rel="stylesheet" href="/assets/css/global.css"><script>(function(){var t=localStorage.getItem(\'toolduck-theme\');var d=window.matchMedia(\'(prefers-color-scheme: dark)\').matches;document.documentElement.setAttribute(\'data-theme\',t||(d?\'dark\':\'light\'));})();</script></head><body style="display:grid;place-items:center;min-height:100vh;"><div style="text-align:center;padding:2rem;"><img src="/assets/images/duck-404.png" alt="ToolDuck 404" style="width:160px;margin-bottom:1.5rem;filter:var(--mascot-filter)"><h1 style="font-size:4rem;font-weight:900;color:var(--accent-primary);">404</h1><p style="color:var(--text-secondary);margin-bottom:1.5rem;">Quack! That page doesn\'t exist.</p><a href="/" style="color:var(--accent-primary);font-weight:600;text-decoration:none;border:1px solid rgba(255,210,63,0.3);padding:0.5rem 1.25rem;border-radius:100px;background:rgba(255,210,63,0.08);">&larr; Back to ToolDuck</a></div><script src="/assets/js/global.js"></script></body></html>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ToolDuck.xyz running at http://0.0.0.0:${PORT}`);
});
