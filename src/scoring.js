import { getStrokesPerHole } from './data';

export function computeBestBallMatch(match, scores) {
  if (!match || !scores) return { kevUp: 0, status: 'live', holesPlayed: 0, leader: null, txt: 'AS' };
  const matchScores = scores[match.id] || {};
  const kevRaw = matchScores.kev || new Array(18).fill(null);
  const gRaw   = matchScores.g   || new Array(18).fill(null);
  let kevUp = 0, holesPlayed = 0;
  for (let h = 0; h < 18; h++) {
    const ks = kevRaw[h], gs = gRaw[h];
    if (ks == null || gs == null) break;
    holesPlayed++;
    if (ks < gs) kevUp++;
    else if (gs < ks) kevUp--;
  }
  const remaining = 18 - holesPlayed;
  const abs = Math.abs(kevUp);
  const leader = kevUp > 0 ? 'kev' : kevUp < 0 ? 'g' : null;
  let status = 'live', txt = 'AS';
  if (holesPlayed === 0) { txt = 'AS'; }
  else if (kevUp === 0) { txt = holesPlayed === 18 ? 'HALVED' : 'AS'; }
  else if (abs > remaining || holesPlayed === 18) { status = 'final'; txt = holesPlayed === 18 ? `${abs} UP` : `${abs}&${remaining}`; }
  else { txt = `${abs} UP`; }
  return { kevUp, status, holesPlayed, leader, txt };
}

export function computeSinglesMatch(match, scores) {
  if (!match || !scores) return { kevUp: 0, status: 'live', holesPlayed: 0, leader: null, txt: 'AS' };
  const matchScores = scores[match.id] || {};
  const kevRaw = matchScores.kev || new Array(18).fill(null);
  const gRaw   = matchScores.g   || new Array(18).fill(null);
  const kevStrokes = getStrokesPerHole(match.kevStrokes || 0);
  const gStrokes   = getStrokesPerHole(match.gStrokes || 0);
  let kevUp = 0, holesPlayed = 0;
  for (let h = 0; h < 18; h++) {
    const ks = kevRaw[h], gs = gRaw[h];
    if (ks == null || gs == null) break;
    holesPlayed++;
    const kevNet = ks - kevStrokes[h], gNet = gs - gStrokes[h];
    if (kevNet < gNet) kevUp++;
    else if (gNet < kevNet) kevUp--;
  }
  const remaining = 18 - holesPlayed;
  const abs = Math.abs(kevUp);
  const leader = kevUp > 0 ? 'kev' : kevUp < 0 ? 'g' : null;
  let status = 'live', txt = 'AS';
  if (holesPlayed === 0) { txt = 'AS'; }
  else if (kevUp === 0) { txt = holesPlayed === 18 ? 'HALVED' : 'AS'; }
  else if (abs > remaining || holesPlayed === 18) { status = 'final'; txt = holesPlayed === 18 ? `${abs} UP` : `${abs}&${remaining}`; }
  else { txt = `${abs} UP`; }
  return { kevUp, status, holesPlayed, leader, txt };
}

export function matchPoints(result) {
  if (!result || (result.status !== 'final' && result.holesPlayed < 18)) return { kev: 0, g: 0 };
  if (result.kevUp > 0) return { kev: 1, g: 0 };
  if (result.kevUp < 0) return { kev: 0, g: 1 };
  return { kev: 0.5, g: 0.5 };
}

export function scoreColor(score, par) {
  if (score == null) return 'transparent';
  const diff = score - par;
  if (diff <= -2) return '#FFD700';
  if (diff === -1) return '#4CAF50';
  if (diff === 0)  return '#f5f0e8';
  if (diff === 1)  return '#e53935';
  return '#8B0000';
}
