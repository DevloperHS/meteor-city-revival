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

export async function startSession() {
  const res = await fetch('/api/game/start', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start game session');
  const data = await res.json();
  session = { token: data.token, seed: data.seed, impacts: [] };
  return data;
}

export async function submitWinVerification(clicks) {
  const res = await fetch('/api/game/verify', {
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
