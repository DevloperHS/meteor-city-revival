import { handleVerifyWin } from '../../server/handlers.js';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const result = handleVerifyWin(body);
    const status = result.verified ? 200 : 403;
    return Response.json(result, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('game/verify', err);
    return Response.json({ verified: false, reason: 'server_error' }, { status: 500 });
  }
}
