import { defineConfig } from 'vite';
import { handleStartGame, handleVerifyWin } from './server/handlers.js';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default defineConfig({
  plugins: [{
    name: 'game-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];

        if (path === '/api/start' && req.method === 'POST') {
          try {
            sendJson(res, 200, handleStartGame());
          } catch (err) {
            console.error('api/start', err);
            sendJson(res, 500, { error: 'start_failed' });
          }
          return;
        }

        if (path === '/api/verify' && req.method === 'POST') {
          try {
            const raw = await readBody(req);
            const body = JSON.parse(raw || '{}');
            const result = handleVerifyWin(body);
            sendJson(res, result.verified ? 200 : 403, result);
          } catch (err) {
            console.error('api/verify', err);
            sendJson(res, 500, { verified: false, reason: 'server_error' });
          }
          return;
        }

        next();
      });
    },
  }],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
