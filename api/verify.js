import crypto from 'crypto';
import { verifyWinReplay } from '../shared/simulation.js';

const SESSION_TTL_MS = 60 * 60 * 1000;

function sessionSecret() {
  return process.env.GAME_SESSION_SECRET || 'meteor-dev-insecure-secret-change-in-production';
}

function signTokenBody(body) {
  return crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

function parseSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (signTokenBody(body) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.seed || !payload.startedAt || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body ?? {};
    const session = parseSessionToken(body.token);
    if (!session) {
      return res.status(403).json({ verified: false, reason: 'invalid_session' });
    }

    const impacts = body.impacts;
    const clicks = body.clicks;
    if (typeof clicks !== 'number' || clicks !== impacts?.length) {
      return res.status(403).json({ verified: false, reason: 'click_mismatch' });
    }

    const result = verifyWinReplay(session.seed, impacts);
    if (!result.valid) {
      return res.status(403).json({ verified: false, reason: result.reason || 'simulation_failed' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      verified: true,
      seed: session.seed,
      clicks,
      elapsed: impacts[impacts.length - 1]?.t ?? 0,
    });
  } catch (err) {
    console.error('api/verify', err);
    return res.status(500).json({ verified: false, reason: 'server_error' });
  }
}
