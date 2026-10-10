import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { COURSE, BEST_BALL, SINGLES, TEAMS, getStrokesPerHole } from './data';
import { computeBestBallMatch, computeSinglesMatch, matchPoints, scoreColor } from './scoring';

const KEV_COLOR  = '#1a4fa0';
const G_COLOR    = '#1a6b3c';
const GOLD       = '#c9a84c';
const CREAM_BG   = '#f5f0e8';
const DARK_GREEN = '#0d2d1a';

const S = {
  app: { minHeight: '100vh', background: CREAM_BG, fontFamily: "'Georgia', 'Times New Roman', serif", paddingBottom: 80 },
  header: { background: `linear-gradient(160deg, ${DARK_GREEN} 0%, #1a4d2e 60%, #0d3320 100%)`, padding: '16px 16px 20px', textAlign: 'center', position: 'relative', borderBottom: `3px solid ${GOLD}` },
  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 },
  logoCircle: { width: 70, height: 70, borderRadius: '50%', background: GOLD, border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  logoText: { color: DARK_GREEN, fontWeight: 900, fontSize: 20, lineHeight: 1, letterSpacing: 1 },
  headerTitle: { color: GOLD, fontSize: 26, fontWeight: 900, letterSpacing: 2, margin: 0, textTransform: 'uppercase' },
  headerSub: { color: '#b8d4c0', fontSize: 11, letterSpacing: 2, margin: '2px 0 0', textTransform: 'uppercase' },
  defChamp: { color: GOLD, fontSize: 10, letterSpacing: 3, marginTop: 3, textTransform: 'uppercase', fontStyle: 'italic' },
  liveDot: { position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, color: '#6fdd8b', fontSize: 11, letterSpacing: 1, fontFamily: 'monospace' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#6fdd8b', animation: 'pulse 1.5s infinite' },
  scoreboardWrap: { display: 'flex', justifyContent: 'center', gap: 12, margin: '14px auto 0', maxWidth: 360 },
  teamBox: (color, active) => ({ flex: 1, background: active ? `${color}22` : 'rgba(255,255,255,0.07)', border: `2px solid ${color}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }),
  teamLabel: (color) => ({ color: color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }),
  teamPts: { color: '#fff', fontSize: 38, fontWeight: 900, lineHeight: 1.1 },
  ptsDivider: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 10, letterSpacing: 1, fontFamily: 'monospace', paddingTop: 4 },
  tabs: { display: 'flex', borderBottom: `2px solid ${GOLD}`, background: DARK_GREEN },
  tab: (active) => ({ flex: 1, padding: '11px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: active ? GOLD : '#7aaa8a', borderBottom: active ? `3px solid ${GOLD}` : '3px solid transparent', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Georgia, serif' }),
  section: { maxWidth: 700, margin: '0 auto', padding: '0 12px' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 6px', borderBottom: `1px solid ${GOLD}44`, marginBottom: 8 },
  sectionTitle: { color: DARK_GREEN, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' },
  sectionSub: { color: '#888', fontSize: 10, letterSpacing: 1 },
  sectionScore: { color: DARK_GREEN, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', background: `${GOLD}22`, border: `1px solid ${GOLD}88`, borderRadius: 6, padding: '3px 10px' },
  matchCard: { background: '#fff', borderRadius: 10, border: `1px solid #ddd`, marginBottom: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  matchCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 8px' },
  matchPlayers: { flex: 1 },
  playerRow: () => ({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }),
  colorSquare: (color) => ({ width: 10, height: 10, background: color, borderRadius: 2, flexShrink: 0 }),
  playerName: () => ({ color: '#222', fontSize: 14, fontWeight: 600 }),
  matchStanding: (leader) => ({ textAlign: 'right', color: leader === 'kev' ? KEV_COLOR : leader === 'g' ? G_COLOR : '#888', fontSize: 18, fontWeight: 900, minWidth: 60 }),
  tapHint: { color: '#aaa', fontSize: 10, fontStyle: 'italic', display: 'block', textAlign: 'right' },
  holeStrip: { display: 'flex', overflowX: 'auto', borderTop: '1px solid #eee', padding: '0', WebkitOverflowScrolling: 'touch' },
  holeCell: (color) => ({ minWidth: 28, textAlign: 'center', padding: '4px 2px', borderRight: '1px solid #f0f0f0', fontSize: 11, fontWeight: 700, background: color, color: color === CREAM_BG || color === 'transparent' || color === '#f5f0e8' ? '#333' : '#fff' }),
  oddsRow: { display: 'flex', gap: 6, padding: '0 14px 10px' },
  oddsPill: (color) => ({ background: `${color}18`, border: `1px solid ${color}88`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: color, display: 'flex', gap: 4, alignItems: 'center' }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 },
  modal: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  modalHeader: { background: DARK_GREEN, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${GOLD}` },
  modalTitle: { color: GOLD, fontSize: 14, fontWeight: 700, letterSpacing: 1 },
  closeBtn: { color: '#ccc', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  scoreTable: { width: '100%', padding: 12 },
  scoreRow: { display: 'grid', gridTemplateColumns: '28px 28px 1fr 1fr 1fr 1fr', gap: 4, alignItems: 'center', marginBottom: 4 },
  scoreHeaderRow: { display: 'grid', gridTemplateColumns: '28px 28px 1fr 1fr 1fr 1fr', gap: 4, marginBottom: 6, padding: '0 0 4px', borderBottom: `1px solid ${GOLD}44` },
  th: { fontSize: 9, fontWeight: 700, color: '#888', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' },
  scoreInput: (color) => ({ width: '100%', border: `1.5px solid ${color}66`, borderRadius: 6, padding: '5px 2px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#222', outline: 'none', background: '#fafafa', WebkitAppearance: 'none' }),
  holeNum: { fontSize: 11, color: '#888', textAlign: 'center', fontWeight: 700 },
  parNum: { fontSize: 11, color: '#555', textAlign: 'center' },
  saveBtnWrap: { padding: '10px 12px 16px' },
  saveBtn: { width: '100%', background: DARK_GREEN, color: GOLD, border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase' },
  adBadge: { position: 'fixed', bottom: 16, right: 14, background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 2px 10px rgba(0,0,0,0.13)', textDecoration: 'none', zIndex: 50 },
  adText: { fontSize: 11, fontWeight: 700, color: '#222', display: 'block' },
  adSub: { fontSize: 9, color: '#888', display: 'block' },
};

const pulseStyle = document.createElement('style');
pulseStyle.innerHTML = `
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  * { box-sizing: border-box; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  body { margin: 0; }
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
`;
document.head.appendChild(pulseStyle);

function OddsPill({ label, val, color }) {
  if (!val) return null;
  const isFav = val.startsWith('-');
  return (
    <span style={S.oddsPill(color)}>
      <span style={{ fontWeight: 900, fontSize: 10 }}>{label}</span>
      <span style={{ color: isFav ? color : '#888' }}>{val}</span>
      {isFav && <span style={{ fontSize: 8, color: '#888' }}>FAV</span>}
    </span>
  );
}

function HoleStrip({ matchId, scores, par }) {
  const ms = scores[matchId] || {};
  const kevArr = ms.kev || [];
  const gArr   = ms.g   || [];
  return (
    <div style={S.holeStrip}>
      {par.map((p, i) => {
        const ks = kevArr[i];
        const gs = gArr[i];
        const entered = ks != null && gs != null;
        const kevColor = entered ? scoreColor(ks, p) : 'transparent';
        const gColor   = entered ? scoreColor(gs, p) : 'transparent';
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', minWidth: 28, borderRight: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 9, color: '#bbb', textAlign: 'center', padding: '2px 0', borderBottom: '1px solid #f5f5f5' }}>{i + 1}</div>
            <div style={{ ...S.holeCell(kevColor), borderRight: 'none', borderBottom: '1px solid #f5f5f5' }}>{ks ?? '·'}</div>
            <div style={{ ...S.holeCell(gColor), borderRight: 'none' }}>{gs ?? '·'}</div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreModal({ match, matchType, scores, onSave, onClose }) {
  const [local, setLocal] = useState(() => {
    const ms = scores[match.id] || {};
    const kev = (ms.kev || []).map(v => v == null ? '' : String(v));
    const g   = (ms.g   || []).map(v => v == null ? '' : String(v));
    while (kev.length < 18) kev.push('');
    while (g.length < 18)   g.push('');
    return { kev, g };
  });

  const set = (team, idx, val) => {
    setLocal(prev => { const arr = [...prev[team]]; arr[idx] = val; return { ...prev, [team]: arr }; });
  };

  const handleSave = () => {
    const kev = local.kev.map(v => v === '' ? null : parseInt(v, 10));
    const g   = local.g.map(v   => v === '' ? null : parseInt(v, 10));
    onSave(match.id, { kev, g });
    onClose();
  };

  const isBB = matchType === 'bb';
  const kevName = isBB ? `${match.kev[0].name} & ${match.kev[1].name}` : match.kevPlayer;
  const gName   = isBB ? `${match.g[0].name} & ${match.g[1].name}`   : match.gPlayer;
  const kevStrokesArr = isBB ? null : getStrokesPerHole(match.kevStrokes);
  const gStrokesArr   = isBB ? null : getStrokesPerHole(match.gStrokes);

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <div style={S.modalTitle}>ENTER SCORES</div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', padding: '10px 12px 6px', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: KEV_COLOR, letterSpacing: 1 }}>TEAM KEV</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{kevName}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G_COLOR, letterSpacing: 1 }}>TEAM G</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{gName}</div>
          </div>
        </div>
        <div style={S.scoreTable}>
          <div style={S.scoreHeaderRow}>
            <div style={S.th}>H</div>
            <div style={S.th}>Par</div>
            <div style={{ ...S.th, color: KEV_COLOR }}>Kev</div>
            <div style={{ ...S.th, color: KEV_COLOR, fontSize: 8 }}>{isBB ? 'BB' : 'Net'}</div>
            <div style={{ ...S.th, color: G_COLOR }}>G</div>
            <div style={{ ...S.th, color: G_COLOR, fontSize: 8 }}>{isBB ? 'BB' : 'Net'}</div>
          </div>
          {COURSE.par.map((par, i) => {
            const ks = local.kev[i];
            const gs = local.g[i];
            const ksN = ks === '' ? null : parseInt(ks, 10);
            const gsN = gs === '' ? null : parseInt(gs, 10);
            const kevNetVal = isBB ? ksN : (ksN != null ? ksN - kevStrokesArr[i] : null);
            const gNetVal   = isBB ? gsN : (gsN != null ? gsN - gStrokesArr[i] : null);
            return (
              <div key={i} style={S.scoreRow}>
                <div style={S.holeNum}>{i + 1}</div>
                <div style={S.parNum}>{par}</div>
                <input type="number" min="1" max="12" value={ks} onChange={e => set('kev', i, e.target.value)} style={S.scoreInput(KEV_COLOR)} inputMode="numeric" />
                <div style={{ fontSize: 12, textAlign: 'center', color: kevNetVal != null ? (kevNetVal < par ? '#1a6b3c' : kevNetVal > par ? '#e53935' : '#555') : '#ccc', fontWeight: 700 }}>
                  {kevNetVal != null ? kevNetVal : '—'}
                  {!isBB && kevStrokesArr[i] > 0 && <span style={{ fontSize: 8, color: '#aaa' }}> (-{kevStrokesArr[i]})</span>}
                </div>
                <input type="number" min="1" max="12" value={gs} onChange={e => set('g', i, e.target.value)} style={S.scoreInput(G_COLOR)} inputMode="numeric" />
                <div style={{ fontSize: 12, textAlign: 'center', color: gNetVal != null ? (gNetVal < par ? '#1a6b3c' : gNetVal > par ? '#e53935' : '#555') : '#ccc', fontWeight: 700 }}>
                  {gNetVal != null ? gNetVal : '—'}
                  {!isBB && gStrokesArr[i] > 0 && <span style={{ fontSize: 8, color: '#aaa' }}> (-{gStrokesArr[i]})</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.saveBtnWrap}>
          <button style={S.saveBtn} onClick={handleSave}>Save Scores</button>
        </div>
      </div>
    </div>
  );
}

function BestBallCard({ match, scores, onTap }) {
  const result = computeBestBallMatch(match, scores);
  const leader = result.leader;
  return (
    <div style={S.matchCard}>
      <div style={S.matchCardTop}>
        <div style={S.matchPlayers}>
          <div style={{ display: 'inline-block', background: GOLD, color: DARK_GREEN, fontSize: 9, fontWeight: 900, letterSpacing: 1, borderRadius: 4, padding: '2px 6px', marginBottom: 5 }}>GROUP {match.group}</div>
          <div style={S.playerRow(KEV_COLOR)}>
            <div style={S.colorSquare(KEV_COLOR)} />
            <span style={S.playerName(KEV_COLOR)}>{match.kev.map(p => p.name).join(' & ')}</span>
          </div>
          <div style={S.playerRow(G_COLOR)}>
            <div style={S.colorSquare(G_COLOR)} />
            <span style={S.playerName(G_COLOR)}>{match.g.map(p => p.name).join(' & ')}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          <div style={S.matchStanding(leader)}>{result.txt}</div>
          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => onTap(match)}>
            <span style={S.tapHint}>tap to score →</span>
          </button>
        </div>
      </div>
      {(match.odds.kev || match.odds.g) && (
        <div style={S.oddsRow}>
          {match.kevFav ? (
            <><OddsPill label="Team Kev" val={match.odds.kev} color={KEV_COLOR} /><OddsPill label="Team G" val={match.odds.g} color={G_COLOR} /></>
          ) : (
            <><OddsPill label="Team G" val={match.odds.g} color={G_COLOR} /><OddsPill label="Team Kev" val={match.odds.kev} color={KEV_COLOR} /></>
          )}
        </div>
      )}
      <HoleStrip matchId={match.id} scores={scores} par={COURSE.par} />
    </div>
  );
}

function SinglesCard({ match, scores, onTap }) {
  const result = computeSinglesMatch(match, scores);
  const leader = result.leader;
  const isPlaceholder = match.kevPlayer.startsWith('Player');
  return (
    <div style={{ ...S.matchCard, opacity: isPlaceholder ? 0.65 : 1 }}>
      <div style={S.matchCardTop}>
        <div style={S.matchPlayers}>
          <div style={S.playerRow(KEV_COLOR)}>
            <div style={S.colorSquare(KEV_COLOR)} />
            <span style={S.playerName(KEV_COLOR)}>{match.kevPlayer}</span>
            {match.kevStrokes > 0 && <span style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}> (+{match.kevStrokes})</span>}
          </div>
          <div style={S.playerRow(G_COLOR)}>
            <div style={S.colorSquare(G_COLOR)} />
            <span style={S.playerName(G_COLOR)}>{match.gPlayer}</span>
            {match.gStrokes > 0 && <span style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}> (+{match.gStrokes})</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          {isPlaceholder ? (
            <div style={{ color: '#bbb', fontSize: 12, fontStyle: 'italic' }}>TBD</div>
          ) : (
            <>
              <div style={S.matchStanding(leader)}>{result.txt}</div>
              <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => onTap(match)}>
                <span style={S.tapHint}>tap to score →</span>
              </button>
            </>
          )}
        </div>
      </div>
      {!isPlaceholder && <HoleStrip matchId={match.id} scores={scores} par={COURSE.par} />}
    </div>
  );
}

export default function App() {
  const [scores, setScores]       = useState({});
  const [activeTab, setActiveTab] = useState('bb');
  const [editMatch, setEditMatch] = useState(null);
  const [editType, setEditType]   = useState(null);

  const loadScores = useCallback(async () => {
    const { data, error } = await supabase.from('scores').select('match_id, hole, team, score');
    if (error) { console.error(error); return; }
    const built = {};
    for (const row of data) {
      if (!built[row.match_id]) built[row.match_id] = { kev: new Array(18).fill(null), g: new Array(18).fill(null) };
      if (row.score != null) built[row.match_id][row.team][row.hole] = row.score;
    }
    setScores(built);
  }, []);

  useEffect(() => {
    loadScores();
    const channel = supabase.channel('scores-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, loadScores)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadScores]);

  const handleSave = async (matchId, { kev, g }) => {
    const rows = [];
    for (let h = 0; h < 18; h++) {
      if (kev[h] != null) rows.push({ match_id: matchId, hole: h, team: 'kev', score: kev[h] });
      if (g[h]   != null) rows.push({ match_id: matchId, hole: h, team: 'g',   score: g[h] });
    }
    if (rows.length === 0) return;
    const { error } = await supabase.from('scores').upsert(rows, { onConflict: 'match_id,hole,team' });
    if (error) console.error(error);
    setScores(prev => {
      const next = { ...prev };
      next[matchId] = { kev: [...(prev[matchId]?.kev || new Array(18).fill(null))], g: [...(prev[matchId]?.g || new Array(18).fill(null))] };
      for (let h = 0; h < 18; h++) {
        if (kev[h] != null) next[matchId].kev[h] = kev[h];
        if (g[h]   != null) next[matchId].g[h]   = g[h];
      }
      return next;
    });
  };

  const bbResults   = BEST_BALL.map(m => computeBestBallMatch(m, scores));
  const singResults = SINGLES.map(m => computeSinglesMatch(m, scores));

  let kevPts = 0, gPts = 0;
  for (const r of [...bbResults, ...singResults]) {
    const p = matchPoints(r); kevPts += p.kev; gPts += p.g;
  }
  const bbKev = bbResults.reduce((s, r) => s + matchPoints(r).kev, 0);
  const bbG   = bbResults.reduce((s, r) => s + matchPoints(r).g,   0);
  const sKev  = singResults.reduce((s, r) => s + matchPoints(r).kev, 0);
  const sG    = singResults.reduce((s, r) => s + matchPoints(r).g,   0);
  const fmt = v => v % 1 === 0 ? String(v) : v.toFixed(1);

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.liveDot}><div style={S.dot} /><span>LIVE</span></div>
        <div style={S.logoWrap}>
          <div style={S.logoCircle}><span style={S.logoText}>MUNI{'\n'}CUP</span></div>
          <div>
            <h1 style={S.headerTitle}>Muni Cup 2026</h1>
            <p style={S.headerSub}>Turtle Creek GC · Oct 10, 2026</p>
            <p style={S.defChamp}>Team Kev — Defending Champs</p>
          </div>
        </div>
        <div style={S.scoreboardWrap}>
          <div style={S.teamBox(KEV_COLOR, kevPts > gPts)}>
            <div style={S.teamLabel(KEV_COLOR)}><div style={{ ...S.colorSquare(KEV_COLOR), width: 8, height: 8 }} />Team Kev</div>
            <div style={S.teamPts}>{fmt(kevPts)}</div>
          </div>
          <div style={S.ptsDivider}><span>PTS</span><span>—</span></div>
          <div style={S.teamBox(G_COLOR, gPts > kevPts)}>
            <div style={S.teamLabel(G_COLOR)}><div style={{ ...S.colorSquare(G_COLOR), width: 8, height: 8 }} />Team G</div>
            <div style={S.teamPts}>{fmt(gPts)}</div>
          </div>
        </div>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(activeTab === 'bb')}      onClick={() => setActiveTab('bb')}>Best Ball</button>
        <button style={S.tab(activeTab === 'singles')} onClick={() => setActiveTab('singles')}>Singles</button>
        <button style={S.tab(activeTab === 'info')}    onClick={() => setActiveTab('info')}>Course</button>
      </div>

      {activeTab === 'bb' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div><div style={S.sectionTitle}>Round 1 — Best Ball</div><div style={S.sectionSub}>Turtle Creek · 18 Holes · Morning Round</div></div>
            <div style={S.sectionScore}>{fmt(bbKev)} – {fmt(bbG)}</div>
          </div>
          {BEST_BALL.map(match => <BestBallCard key={match.id} match={match} scores={scores} onTap={m => { setEditMatch(m); setEditType('bb'); }} />)}
        </div>
      )}

      {activeTab === 'singles' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div><div style={S.sectionTitle}>Round 2 — Singles</div><div style={S.sectionSub}>Turtle Creek · 18 Holes · Afternoon Round</div></div>
            <div style={S.sectionScore}>{fmt(sKev)} – {fmt(sG)}</div>
          </div>
          <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}66`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#666', fontStyle: 'italic' }}>🕐 Singles matchups will be announced on the day. Placeholders shown below.</p>
          </div>
          {SINGLES.map(match => <SinglesCard key={match.id} match={match} scores={scores} onTap={m => { setEditMatch(m); setEditType('singles'); }} />)}
        </div>
      )}

      {activeTab === 'info' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div><div style={S.sectionTitle}>Turtle Creek GC</div><div style={S.sectionSub}>White Tees · Par 72 · 5,827 yards</div></div>
          </div>
          {[{ label: 'Front 9', range: [0, 9] }, { label: 'Back 9', range: [9, 18] }].map(({ label, range }) => {
            const hRange = COURSE.par.slice(...range);
            const yRange = COURSE.yards.slice(...range);
            const hcpRange = COURSE.handicap.slice(...range);
            const parTotal = hRange.reduce((a, b) => a + b, 0);
            return (
              <div key={label} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: DARK_GREEN, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <thead>
                      <tr style={{ background: DARK_GREEN }}>
                        <th style={{ color: GOLD, padding: '6px 8px', textAlign: 'left', fontWeight: 700, letterSpacing: 1 }}>HOLE</th>
                        {hRange.map((_, idx) => <th key={idx} style={{ color: '#b8d4c0', padding: '6px 6px', textAlign: 'center', minWidth: 28 }}>{range[0] + idx + 1}</th>)}
                        <th style={{ color: GOLD, padding: '6px 8px', textAlign: 'center' }}>OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>YARDS</td>
                        {yRange.map((y, idx) => <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', color: '#555' }}>{y}</td>)}
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#555' }}>{yRange.reduce((a, b) => a + b, 0)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>PAR</td>
                        {hRange.map((p, idx) => <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: DARK_GREEN }}>{p}</td>)}
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 900, color: DARK_GREEN }}>{parTotal}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>HCP</td>
                        {hcpRange.map((h, idx) => <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', color: '#777' }}>{h}</td>)}
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#777' }}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DARK_GREEN, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Best Ball — Strokes</div>
            {BEST_BALL.map(match => {
              const allPlayers = [...match.kev.map(p => ({ ...p, team: 'kev' })), ...match.g.map(p => ({ ...p, team: 'g' }))].filter(p => p.strokes > 0);
              return (
                <div key={match.id} style={{ marginBottom: 10, background: '#fff', borderRadius: 8, padding: '8px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 5 }}>GROUP {match.group}</div>
                  {allPlayers.map(p => {
                    const ph = getStrokesPerHole(p.strokes);
                    return (
                      <div key={p.name} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: p.team === 'kev' ? KEV_COLOR : G_COLOR, marginBottom: 3 }}>{p.name} — {p.strokes} strokes</div>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto' }}>
                          {ph.map((s, i) => (
                            <div key={i} style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, background: s > 0 ? (p.team === 'kev' ? KEV_COLOR : G_COLOR) : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: s > 0 ? '#fff' : '#ccc' }}>
                              {i + 1}{s > 1 && <sup style={{ fontSize: 7 }}>{s}</sup>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editMatch && <ScoreModal match={editMatch} matchType={editType} scores={scores} onSave={handleSave} onClose={() => setEditMatch(null)} />}

      <a href="https://www.instagram.com/mastersofmuni" target="_blank" rel="noopener noreferrer" style={S.adBadge}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#C13584" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="12" r="5" stroke="#C13584" strokeWidth="2" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="#C13584"/>
        </svg>
        <div>
          <span style={S.adText}>Masters of Muni</span>
          <span style={S.adSub}>@mastersofmuni</span>
        </div>
      </a>
    </div>
  );
}
