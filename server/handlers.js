import { createSessionToken, newSessionSeed, parseSessionToken } from '../shared/token.js';
import { verifyWinReplay } from '../shared/simulation.js';

export function handleStartGame() {
  const seed = newSessionSeed();
  const startedAt = Date.now();
  const token = createSessionToken(seed, startedAt);
  return { token, seed, startedAt };
}

export function handleVerifyWin(body) {
  const session = parseSessionToken(body?.token);
  if (!session) {
    return { verified: false, reason: 'invalid_session' };
  }

  const impacts = body?.impacts;
  const clicks = body?.clicks;
  if (typeof clicks !== 'number' || clicks !== impacts?.length) {
    return { verified: false, reason: 'click_mismatch' };
  }

  const result = verifyWinReplay(session.seed, impacts);
  if (!result.valid) {
    return { verified: false, reason: result.reason || 'simulation_failed' };
  }

  return {
    verified: true,
    seed: session.seed,
    clicks,
    elapsed: impacts[impacts.length - 1]?.t ?? 0,
  };
}
