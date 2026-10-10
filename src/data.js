// ============================================================
// MUNI CUP 2026 — Data
// Turtle Creek Golf Course · White Tees
// Saturday, October 10, 2026
// Team Kev (Blue) vs Team G (Green)
// ============================================================

// ── Turtle Creek · White Tees ──────────────────────────────
// From scorecard: White tees row
// Front 9: 340, 482, 107, 331, 373, 388, 318, 469, 168
// Back 9:  260, 126, 286, 433, 339, 140, 357, 380, 530
// Par F:   4,5,3,4,4,4,4,4,3  = 35 (but scorecard shows 36)
// Let's re-read: Par row from scorecard image:
// H1=4, H2=5, H3=3, H4=4, H5=4, H6=4, H7=4, H8=4, H9=3 OUT=35? scorecard says 36
// Looking again at scorecard: Par: 4,5,3,4,4,4,4,5,3 = 36 OUT
// H8 is par 5 (469 yards), H9 is par 3 (168 yards) - yes
// Back: 4,3,4,4,5,3,4,4,5 = 36 IN → Total 72
// Handicap: Front: 11,3,17,13,5,1,15,9,7  Back: 16,14,12,8,18,10,2,4,6  (Mens)
// Using scorecard handicap row

export const COURSE = {
  name: 'Turtle Creek Golf Course',
  tees: 'White',
  par: [4,5,3,4,4,4,4,5,3, 4,3,4,4,5,3,4,4,5],
  handicap: [11,3,17,13,5,1,15,9,7, 16,14,12,8,18,10,2,4,6],
  yards: [340,482,107,331,373,388,318,469,168, 260,126,286,433,339,140,357,380,530],
  holes: 18,
};

// ── Stroke allocation helper ──────────────────────────────
// Given a player's handicap strokes (net), assign 1 stroke to the
// hardest holes, then an extra stroke to the hardest again if > 18
export function getStrokesPerHole(playerStrokes) {
  // playerStrokes = total strokes the player receives
  // Returns array[18] of strokes on each hole (0 or 1 or 2)
  const strokes = new Array(18).fill(0);
  if (playerStrokes <= 0) return strokes;
  // Sort holes by handicap difficulty (1 = hardest)
  const order = COURSE.handicap
    .map((hcp, i) => ({ hcp, i }))
    .sort((a, b) => a.hcp - b.hcp);
  // First 18: one stroke on hardest holes
  const first = Math.min(playerStrokes, 18);
  for (let k = 0; k < first; k++) strokes[order[k].i] += 1;
  // Additional strokes beyond 18
  const extra = playerStrokes - 18;
  if (extra > 0) {
    const extra2 = Math.min(extra, 18);
    for (let k = 0; k < extra2; k++) strokes[order[k].i] += 1;
  }
  return strokes;
}

// ── Team colors ───────────────────────────────────────────
// Team Kev = Blue, Team G = Green
export const TEAMS = {
  kev: { id: 'kev', name: 'Team Kev', color: '#1a4fa0', label: 'KEV', short: 'K' },
  g:   { id: 'g',   name: 'Team G',   color: '#1a6b3c', label: 'G',   short: 'G' },
};

// ── Round 1: Best Ball (18 holes) ─────────────────────────
// Strokes given per your spec:
//   Andy (0), Greg (2) vs Kev (1), Leyden (1)
//   Jack P (0), Odge (5) vs PJ (5), Kuz (5)
//   Clumpy (1), Egan (10) vs Dave (0), Ruane (21)
//   Emmett (1), Giz (17) vs Troy (0), Droe (10)
//
// Strokes = each player's individual strokes received (net)
// Best Ball: each player plays their own ball, best score on hole counts
// For stroke play within best ball, the player with strokes gets a net score

export const BEST_BALL = [
  {
    id: 'bb1',
    group: 1,
    kev: [
      { name: 'Kev',    strokes: 1 },
      { name: 'Leyden', strokes: 1 },
    ],
    g: [
      { name: 'Greg', strokes: 2 },
      { name: 'Andy', strokes: 0 },
    ],
    // Odds from flyer
    odds: { kev: '+113', g: '-113' },
    kevFav: false,
  },
  {
    id: 'bb2',
    group: 2,
    kev: [
      { name: 'PJ',  strokes: 5 },
      { name: 'Kuz', strokes: 5 },
    ],
    g: [
      { name: 'Odge',  strokes: 5 },
      { name: 'Jack P', strokes: 0 },
    ],
    odds: { kev: '-127', g: '+127' },
    kevFav: true,
  },
  {
    id: 'bb3',
    group: 3,
    kev: [
      { name: 'Dave',  strokes: 0 },
      { name: 'Ruane', strokes: 21 },
    ],
    g: [
      { name: 'Clumpy', strokes: 1 },
      { name: 'Egan',   strokes: 10 },
    ],
    odds: { kev: '-113', g: '+113' },
    kevFav: true,
  },
  {
    id: 'bb4',
    group: 4,
    kev: [
      { name: 'Troy', strokes: 0 },
      { name: 'Droe', strokes: 10 },
    ],
    g: [
      { name: 'Emmett', strokes: 1 },
      { name: 'Giz',    strokes: 17 },
    ],
    odds: { kev: '+104', g: '-104' },
    kevFav: false,
  },
];

// ── Round 2: Singles (18 holes) ───────────────────────────
// Matchups TBD — placeholder slots
// Will be updated once pairings are announced
// team: 'kev' or 'g' indicates which team each player is on
export const SINGLES = [
  { id: 's1',  kevPlayer: 'Kev Singles 1',    gPlayer: 'G Singles 1',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's2',  kevPlayer: 'Kev Singles 2',    gPlayer: 'G Singles 2',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's3',  kevPlayer: 'Kev Singles 3',    gPlayer: 'G Singles 3',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's4',  kevPlayer: 'Kev Singles 4',    gPlayer: 'G Singles 4',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's5',  kevPlayer: 'Kev Singles 5',    gPlayer: 'G Singles 5',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's6',  kevPlayer: 'Kev Singles 6',    gPlayer: 'G Singles 6',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's7',  kevPlayer: 'Kev Singles 7',    gPlayer: 'G Singles 7',    kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's8',  kevPlayer: 'Kev Singles 8',    gPlayer: 'G Singles 8',    kevStrokes: 0, gStrokes: 0, odds: null },
];
