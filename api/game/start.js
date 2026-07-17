import { handleStartGame } from '../../server/handlers.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const data = handleStartGame();
    return Response.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('game/start', err);
    return Response.json({ error: 'start_failed' }, { status: 500 });
  }
}
