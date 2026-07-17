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

export default defineConfig({
  plugins: [{
    name: 'game-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/game/start' && req.method === 'POST') {
          try {
            const data = handleStartGame();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            console.error('game/start', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'start_failed' }));
          }
          return;
        }

        if (req.url === '/api/game/verify' && req.method === 'POST') {
          try {
            const raw = await readBody(req);
            const body = JSON.parse(raw || '{}');
            const result = handleVerifyWin(body);
            res.statusCode = result.verified ? 200 : 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error('game/verify', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ verified: false, reason: 'server_error' }));
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
