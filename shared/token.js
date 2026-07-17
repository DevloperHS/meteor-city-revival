import crypto from 'crypto';

const SESSION_TTL_MS = 60 * 60 * 1000;

function secret() {
  return process.env.GAME_SESSION_SECRET || 'meteor-dev-insecure-secret-change-in-production';
}

function sign(body) {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}

export function createSessionToken(seed, startedAt) {
  const payload = {
    seed,
    startedAt,
    exp: startedAt + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sign(body) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.seed || !payload.startedAt || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function newSessionSeed() {
  return crypto.randomInt(1, 2147483646);
}
