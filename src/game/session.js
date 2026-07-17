const START_TIMEOUT_MS = 5000;
const API_START = '/api/start';
const API_VERIFY = '/api/verify';

let session = {
  token: null,
  seed: null,
  impacts: [],
};

export function getSessionSeed() {
  return session.seed;
}

export function getSessionToken() {
  return session.token;
}

export function getImpactCount() {
  return session.impacts.length;
}

export function recordImpact(impact) {
  session.impacts.push({
    t: Math.round(impact.t * 1000) / 1000,
    x: Math.round(impact.x * 10) / 10,
    z: Math.round(impact.z * 10) / 10,
  });
}

function localFallbackSession() {
  const seed = Math.floor(Math.random() * 2147483645) + 1;
  session = { token: null, seed, impacts: [] };
  return { seed, offline: true };
}

export async function startSession() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), START_TIMEOUT_MS);

  try {
    const res = await fetch(API_START, {
      method: 'POST',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Failed to start game session (${res.status})`);
    const data = await res.json();
    if (!data?.token || !data?.seed) throw new Error('Invalid session response');
    session = { token: data.token, seed: data.seed, impacts: [] };
    return data;
  } catch (err) {
    console.warn('Session API unavailable, using offline seed', err);
    return localFallbackSession();
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitWinVerification(clicks) {
  if (!session.token) {
    return { verified: false, reason: 'offline_session' };
  }

  const res = await fetch(API_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: session.token,
      impacts: session.impacts,
      clicks,
    }),
  });
  return res.json();
}

export function clearSessionImpacts() {
  session.impacts = [];
}
