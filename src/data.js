// ============================================================
// MUNI CUP 2026 — Data
// Turtle Creek Golf Course · White Tees
// Saturday, October 10, 2026
// Team Kev (Blue) vs Team G (Green)
// ============================================================

export const COURSE = {
  name: 'Turtle Creek Golf Course',
  tees: 'White',
  par: [4,5,3,4,4,4,4,5,3, 4,3,4,4,5,3,4,4,5],
  handicap: [11,3,17,13,5,1,15,9,7, 16,14,12,8,18,10,2,4,6],
  yards: [340,482,107,331,373,388,318,469,168, 260,126,286,433,339,140,357,380,530],
  holes: 18,
};

export function getStrokesPerHole(playerStrokes) {
  const strokes = new Array(18).fill(0);
  if (playerStrokes <= 0) return strokes;
  const order = COURSE.handicap
    .map((hcp, i) => ({ hcp, i }))
    .sort((a, b) => a.hcp - b.hcp);
  const first = Math.min(playerStrokes, 18);
  for (let k = 0; k < first; k++) strokes[order[k].i] += 1;
  const extra = playerStrokes - 18;
  if (extra > 0) {
    const extra2 = Math.min(extra, 18);
    for (let k = 0; k < extra2; k++) strokes[order[k].i] += 1;
  }
  return strokes;
}

export const TEAMS = {
  kev: { id: 'kev', name: 'Team Kev', color: '#1a4fa0', label: 'KEV', short: 'K' },
  g:   { id: 'g',   name: 'Team G',   color: '#1a6b3c', label: 'G',   short: 'G' },
};

export const BEST_BALL = [
  {
    id: 'bb1', group: 1,
    kev: [{ name: 'Kev', strokes: 1 }, { name: 'Leyden', strokes: 1 }],
    g:   [{ name: 'Greg', strokes: 2 }, { name: 'Andy', strokes: 0 }],
    odds: { kev: '+113', g: '-113' }, kevFav: false,
  },
  {
    id: 'bb2', group: 2,
    kev: [{ name: 'PJ', strokes: 5 }, { name: 'Kuz', strokes: 5 }],
    g:   [{ name: 'Odge', strokes: 5 }, { name: 'Jack P', strokes: 0 }],
    odds: { kev: '-127', g: '+127' }, kevFav: true,
  },
  {
    id: 'bb3', group: 3,
    kev: [{ name: 'Dave', strokes: 0 }, { name: 'Ruane', strokes: 21 }],
    g:   [{ name: 'Clumpy', strokes: 1 }, { name: 'Egan', strokes: 10 }],
    odds: { kev: '-113', g: '+113' }, kevFav: true,
  },
  {
    id: 'bb4', group: 4,
    kev: [{ name: 'Troy', strokes: 0 }, { name: 'Droe', strokes: 10 }],
    g:   [{ name: 'Emmett', strokes: 1 }, { name: 'Giz', strokes: 17 }],
    odds: { kev: '+104', g: '-104' }, kevFav: false,
  },
];

export const SINGLES = [
  { id: 's1', kevPlayer: 'Player K1', gPlayer: 'Player G1', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's2', kevPlayer: 'Player K2', gPlayer: 'Player G2', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's3', kevPlayer: 'Player K3', gPlayer: 'Player G3', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's4', kevPlayer: 'Player K4', gPlayer: 'Player G4', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's5', kevPlayer: 'Player K5', gPlayer: 'Player G5', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's6', kevPlayer: 'Player K6', gPlayer: 'Player G6', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's7', kevPlayer: 'Player K7', gPlayer: 'Player G7', kevStrokes: 0, gStrokes: 0, odds: null },
  { id: 's8', kevPlayer: 'Player K8', gPlayer: 'Player G8', kevStrokes: 0, gStrokes: 0, odds: null },
];
