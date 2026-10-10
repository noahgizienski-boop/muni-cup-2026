import { COURSE, getStrokesPerHole } from './data.js';

// ── Score color coding ────────────────────────────────────
export function scoreColor(score, par) {
  if (score == null) return '#888';
  const diff = score - par;
  if (diff <= -2) return '#c9a84c'; // eagle+ = gold
  if (diff === -1) return '#2d8a4e'; // birdie = green
  if (diff === 0)  return '#f5f0e8'; // par = cream
  if (diff === 1)  return '#c0392b'; // bogey = red
  return '#7b1a1a';                  // double+ = dark red
}

// ── Best Ball match computation ───────────────────────────
// Each player plays their own ball; best NET score on hole counts for team
export function computeBestBallMatch(match, scores) {
  // scores: { [matchId_hole_team_playerIdx]: score }
  // Returns hole-by-hole result and running totals
  const results = [];
  let kevUp = 0; // positive = kev leading

  for (let h = 0; h < 18; h++) {
    const par = COURSE.par[h];

    // Get best net score for each team on this hole
    const kevScores = match.kev.map((p, pi) => {
      const raw = scores[`${match.id}_${h}_kev_${pi}`];
      if (raw == null) return null;
      const strks = getStrokesPerHole(p.strokes);
      return raw - strks[h]; // net score
    }).filter(s => s != null);

    const gScores = match.g.map((p, pi) => {
      const raw = scores[`${match.id}_${h}_g_${pi}`];
      if (raw == null) return null;
      const strks = getStrokesPerHole(p.strokes);
      return raw - strks[h];
    }).filter(s => s != null);

    if (kevScores.length === 0 || gScores.length === 0) {
      results.push({ hole: h, status: 'pending', kevUp });
      continue;
    }

    const kevBest = Math.min(...kevScores);
    const gBest   = Math.min(...gScores);

    let delta = 0;
    if (kevBest < gBest) delta = 1;
    else if (gBest < kevBest) delta = -1;

    kevUp += delta;
    results.push({ hole: h, status: 'played', delta, kevUp, kevBest, gBest, par });
  }

  return { results, kevUp, holesPlayed: results.filter(r => r.status === 'played').length };
}

// ── Singles match computation ─────────────────────────────
export function computeSinglesMatch(match, scores) {
  const results = [];
  let kevUp = 0;

  for (let h = 0; h < 18; h++) {
    const par = COURSE.par[h];
    const kevRaw = scores[`${match.id}_${h}_kev`];
    const gRaw   = scores[`${match.id}_${h}_g`];

    if (kevRaw == null || gRaw == null) {
      results.push({ hole: h, status: 'pending', kevUp });
      continue;
    }

    const kevStrks = getStrokesPerHole(match.kevStrokes);
    const gStrks   = getStrokesPerHole(match.gStrokes);
    const kevNet = kevRaw - kevStrks[h];
    const gNet   = gRaw   - gStrks[h];

    let delta = 0;
    if (kevNet < gNet) delta = 1;
    else if (gNet < kevNet) delta = -1;

    kevUp += delta;
    results.push({ hole: h, status: 'played', delta, kevUp, kevNet, gNet, kevRaw, gRaw, par });
  }

  return { results, kevUp, holesPlayed: results.filter(r => r.status === 'played').length };
}

// ── Match points ──────────────────────────────────────────
export function matchPoints(kevUp, holesPlayed) {
  const holesLeft = 18 - holesPlayed;
  // Match is over if one team is up by more holes than remain
  if (Math.abs(kevUp) > holesLeft || holesPlayed === 18) {
    if (kevUp > 0) return { kev: 1, g: 0 };
    if (kevUp < 0) return { kev: 0, g: 1 };
    return { kev: 0.5, g: 0.5 };
  }
  return null; // still in progress
}
