import crypto from 'crypto';

const SESSION_TTL_MS = 60 * 60 * 1000;

function sessionSecret() {
  return process.env.GAME_SESSION_SECRET || 'meteor-dev-insecure-secret-change-in-production';
}

function signTokenBody(body) {
  return crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

function createSessionToken(seed, startedAt) {
  const payload = { seed, startedAt, exp: startedAt + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${signTokenBody(body)}`;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const seed = crypto.randomInt(1, 2147483646);
    const startedAt = Date.now();
    const token = createSessionToken(seed, startedAt);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ token, seed, startedAt });
  } catch (err) {
    console.error('api/start', err);
    return res.status(500).json({ error: 'start_failed' });
  }
}
