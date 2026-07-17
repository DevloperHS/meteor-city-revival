import { handleVerifyWin } from '../../server/handlers.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body ?? {};
    const result = handleVerifyWin(body);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(result.verified ? 200 : 403).json(result);
  } catch (err) {
    console.error('game/verify', err);
    return res.status(500).json({ verified: false, reason: 'server_error' });
  }
}
