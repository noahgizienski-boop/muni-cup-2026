import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { COURSE, BEST_BALL, SINGLES, getStrokesPerHole } from './data';
import { computeBestBallMatch, computeSinglesMatch, matchPoints, scoreColor } from './scoring';

// ── Color constants ──────────────────────────────────────
const KEV_COLOR  = '#1a4fa0';  // Blue
const G_COLOR    = '#1a6b3c';  // Green
const GOLD       = '#c9a84c';
const CREAM_BG   = '#f5f0e8';
const DARK_GREEN = '#0d2d1a';

// ── Styles ───────────────────────────────────────────────
const S = {
  app: {
    minHeight: '100vh',
    background: CREAM_BG,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    paddingBottom: 80,
  },
  header: {
    background: `linear-gradient(160deg, ${DARK_GREEN} 0%, #1a4d2e 60%, #0d3320 100%)`,
    padding: '16px 16px 20px',
    textAlign: 'center',
    position: 'relative',
    borderBottom: `3px solid ${GOLD}`,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 10,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    background: '#fff',
    border: `3px solid ${GOLD}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: `0 0 0 2px ${DARK_GREEN}, 0 4px 12px rgba(0,0,0,0.3)`,
  },
  logoText: {
    color: DARK_GREEN,
    fontWeight: 700,
    fontSize: 7,
    lineHeight: 1.15,
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: "'Georgia', serif",
    fontStyle: 'italic',
    marginTop: 1,
  },
  headerTitle: {
    color: GOLD,
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: 2,
    margin: 0,
    textTransform: 'uppercase',
  },
  headerSub: {
    color: '#b8d4c0',
    fontSize: 11,
    letterSpacing: 2,
    margin: '2px 0 0',
    textTransform: 'uppercase',
  },
  defChamp: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 3,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  liveDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#6fdd8b',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#6fdd8b',
    animation: 'pulse 1.5s infinite',
  },
  scoreboardWrap: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    margin: '14px auto 0',
    maxWidth: 360,
  },
  teamBox: (color, active) => ({
    flex: 1,
    background: active ? `${color}22` : 'rgba(255,255,255,0.07)',
    border: `2px solid ${color}`,
    borderRadius: 10,
    padding: '10px 8px',
    textAlign: 'center',
    cursor: 'default',
  }),
  teamLabel: (color) => ({
    color: '#fff',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  }),
  teamPts: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  ptsDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
    paddingTop: 4,
  },
  // Tabs
  tabs: {
    display: 'flex',
    borderBottom: `2px solid ${GOLD}`,
    background: DARK_GREEN,
  },
  tab: (active) => ({
    flex: 1,
    padding: '11px 4px',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: active ? GOLD : '#7aaa8a',
    borderBottom: active ? `3px solid ${GOLD}` : '3px solid transparent',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'Georgia, serif',
  }),
  // Section
  section: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0 6px',
    borderBottom: `1px solid ${GOLD}44`,
    marginBottom: 8,
  },
  sectionTitle: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionSub: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
  },
  sectionScore: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'monospace',
    background: `${GOLD}22`,
    border: `1px solid ${GOLD}88`,
    borderRadius: 6,
    padding: '3px 10px',
  },
  // Match card
  matchCard: {
    background: '#fff',
    borderRadius: 10,
    border: `1px solid #ddd`,
    marginBottom: 10,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  matchCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px 8px',
  },
  matchPlayers: {
    flex: 1,
  },
  playerRow: (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  }),
  colorSquare: (color) => ({
    width: 10,
    height: 10,
    background: color,
    borderRadius: 2,
    flexShrink: 0,
  }),
  playerName: (color) => ({
    color: '#222',
    fontSize: 14,
    fontWeight: 600,
  }),
  matchStanding: (leader) => ({
    textAlign: 'right',
    color: leader === 'kev' ? KEV_COLOR : leader === 'g' ? G_COLOR : '#888',
    fontSize: 18,
    fontWeight: 900,
    minWidth: 60,
  }),
  tapHint: {
    color: '#aaa',
    fontSize: 10,
    fontStyle: 'italic',
    display: 'block',
    textAlign: 'right',
  },
  holeStrip: {
    display: 'flex',
    overflowX: 'auto',
    borderTop: '1px solid #eee',
    padding: '0',
    WebkitOverflowScrolling: 'touch',
  },
  holeCell: (color) => ({
    minWidth: 28,
    textAlign: 'center',
    padding: '4px 2px',
    borderRight: '1px solid #f0f0f0',
    fontSize: 11,
    fontWeight: 700,
    background: color,
    color: color === CREAM_BG || color === 'transparent' || color === '#f5f0e8' ? '#333' : '#fff',
  }),
  groupBadge: (group) => ({
    display: 'inline-block',
    background: GOLD,
    color: DARK_GREEN,
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1,
    borderRadius: 4,
    padding: '2px 6px',
    marginBottom: 6,
    textTransform: 'uppercase',
  }),
  // Odds pills
  oddsRow: {
    display: 'flex',
    gap: 6,
    padding: '0 14px 10px',
  },
  oddsPill: (color) => ({
    background: `${color}18`,
    border: `1px solid ${color}88`,
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 700,
    color: color,
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  }),
  // Score entry modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 520,
    maxHeight: '92vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    background: DARK_GREEN,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `2px solid ${GOLD}`,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
  },
  closeBtn: {
    color: '#ccc',
    fontSize: 20,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  scoreTable: {
    width: '100%',
    padding: 12,
  },
  scoreRow: {
    display: 'grid',
    gridTemplateColumns: '28px 28px 1fr 1fr 1fr 1fr',
    gap: 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '28px 28px 1fr 1fr 1fr 1fr',
    gap: 4,
    marginBottom: 6,
    padding: '0 0 4px',
    borderBottom: `1px solid ${GOLD}44`,
  },
  th: {
    fontSize: 9,
    fontWeight: 700,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreInput: (color) => ({
    width: '100%',
    border: `1.5px solid ${color}66`,
    borderRadius: 6,
    padding: '5px 2px',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: '#222',
    outline: 'none',
    background: '#fafafa',
    WebkitAppearance: 'none',
  }),
  holeNum: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    fontWeight: 700,
  },
  parNum: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
  },
  saveBtnWrap: {
    padding: '10px 12px 16px',
  },
  saveBtn: {
    width: '100%',
    background: DARK_GREEN,
    color: GOLD,
    border: 'none',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  // Ad badge
  adBadge: {
    position: 'fixed',
    bottom: 16,
    right: 14,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 10,
    padding: '7px 11px',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    boxShadow: '0 2px 10px rgba(0,0,0,0.13)',
    textDecoration: 'none',
    zIndex: 50,
  },
  adText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#222',
    display: 'block',
  },
  adSub: {
    fontSize: 9,
    color: '#888',
    display: 'block',
  },
};

// ── Pulse animation ──────────────────────────────────────
const pulseStyle = document.createElement('style');
pulseStyle.innerHTML = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  * { box-sizing: border-box; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  body { margin: 0; }
  ::-webkit-scrollbar { height: 4px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
`;
document.head.appendChild(pulseStyle);

// ── Odds pill ────────────────────────────────────────────
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

// ── Hole strip ───────────────────────────────────────────
function HoleStrip({ matchId, scores, par, kevStrokesArr, gStrokesArr }) {
  const ms = scores[matchId] || {};
  const kevArr = ms.kev || [];
  const gArr   = ms.g   || [];
  const showNet = !!(kevStrokesArr && gStrokesArr);
  return (
    <div style={S.holeStrip}>
      {par.map((p, i) => {
        const ks = kevArr[i];
        const gs = gArr[i];
        const entered = ks != null && gs != null;
        const kevNet = (showNet && ks != null) ? ks - kevStrokesArr[i] : ks;
        const gNet   = (showNet && gs != null) ? gs - gStrokesArr[i]   : gs;
        const kevColor = entered ? scoreColor(kevNet, p) : 'transparent';
        const gColor   = entered ? scoreColor(gNet,   p) : 'transparent';
        const kevHasStroke = showNet && kevStrokesArr[i] > 0;
        const gHasStroke   = showNet && gStrokesArr[i]   > 0;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', minWidth: showNet ? 34 : 28, borderRight: '1px solid #f0f0f0' }}>
            {/* Hole number */}
            <div style={{ fontSize: 9, color: '#bbb', textAlign: 'center', padding: '2px 0', borderBottom: '1px solid #f5f5f5' }}>{i + 1}</div>
            {/* Kev row */}
            <div style={{ ...S.holeCell(kevColor), borderRight: 'none', borderBottom: '1px solid #f5f5f5', position: 'relative', minHeight: showNet ? 32 : 'auto' }}>
              {ks != null ? (
                showNet ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{ks}</span>
                    {kevHasStroke && (
                      <span style={{ fontSize: 9, opacity: 0.75, fontWeight: 600 }}>→{kevNet}</span>
                    )}
                  </div>
                ) : ks
              ) : '·'}
            </div>
            {/* G row */}
            <div style={{ ...S.holeCell(gColor), borderRight: 'none', minHeight: showNet ? 32 : 'auto' }}>
              {gs != null ? (
                showNet ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{gs}</span>
                    {gHasStroke && (
                      <span style={{ fontSize: 9, opacity: 0.75, fontWeight: 600 }}>→{gNet}</span>
                    )}
                  </div>
                ) : gs
              ) : '·'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Table cell styles ────────────────────────────────────
const tdLeft = {
  padding: '5px 10px',
  fontWeight: 700,
  fontSize: 10,
  color: '#555',
  letterSpacing: 0.5,
  whiteSpace: 'nowrap',
  borderRight: '1px solid #e0e0e0',
  minWidth: 60,
};
const tdCenter = {
  padding: '4px 2px',
  textAlign: 'center',
  borderRight: '1px solid #e8e8e8',
  minWidth: 32,
};

// ── Score label (vs par) ─────────────────────────────────
function scoreLabel(score, par) {
  if (score == null) return '';
  const d = score - par;
  if (d <= -2) return 'Eagle+';
  if (d === -1) return 'Birdie';
  if (d === 0)  return 'E';
  if (d === 1)  return '+1';
  if (d === 2)  return '+2';
  return `+${d}`;
}

// ── Score Entry Modal ────────────────────────────────────
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
    setLocal(prev => {
      const arr = [...prev[team]];
      arr[idx] = val;
      return { ...prev, [team]: arr };
    });
  };

  const handleSave = () => {
    const kev = local.kev.map(v => v === '' ? null : parseInt(v, 10));
    const g   = local.g.map(v   => v === '' ? null : parseInt(v, 10));
    onSave(match.id, { kev, g });
    onClose();
  };

  const isBB = matchType === 'bb';
  const kevName = isBB
    ? `${match.kev[0].name} & ${match.kev[1].name}`
    : match.kevPlayer;
  const gName = isBB
    ? `${match.g[0].name} & ${match.g[1].name}`
    : match.gPlayer;

  // Per-player strokes for BB; per-player arrays for singles
  const kevPlayersStrokes = isBB ? match.kev.map(p => getStrokesPerHole(p.strokes)) : null;
  const gPlayersStrokes   = isBB ? match.g.map(p => getStrokesPerHole(p.strokes))   : null;
  const kevSingStrokes    = isBB ? null : getStrokesPerHole(match.kevStrokes);
  const gSingStrokes      = isBB ? null : getStrokesPerHole(match.gStrokes);

  // Compute running match play state for momentum
  const momentum = [];
  let kevUp = 0;
  for (let h = 0; h < 18; h++) {
    const ksRaw = local.kev[h] === '' ? null : parseInt(local.kev[h], 10);
    const gsRaw = local.g[h]   === '' ? null : parseInt(local.g[h],   10);
    if (ksRaw == null || gsRaw == null) { momentum.push(null); continue; }
    let ksNet = ksRaw, gsNet = gsRaw;
    if (!isBB) {
      ksNet = ksRaw - kevSingStrokes[h];
      gsNet = gsRaw - gSingStrokes[h];
    }
    if (ksNet < gsNet) kevUp++;
    else if (gsNet < ksNet) kevUp--;
    momentum.push(kevUp);
  }
  const maxMom = Math.max(...momentum.filter(v => v != null).map(Math.abs), 1);

  // Hole current result label
  const holeResults = COURSE.par.map((par, h) => {
    const ksRaw = local.kev[h] === '' ? null : parseInt(local.kev[h], 10);
    const gsRaw = local.g[h]   === '' ? null : parseInt(local.g[h],   10);
    if (ksRaw == null || gsRaw == null) return null;
    let ksNet = ksRaw, gsNet = gsRaw;
    if (!isBB) {
      ksNet = ksRaw - kevSingStrokes[h];
      gsNet = gsRaw - gSingStrokes[h];
    }
    if (ksNet < gsNet) return 'kev';
    if (gsNet < ksNet) return 'g';
    return 'halved';
  });

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        {/* ── Modal header band ── */}
        <div style={{ background: DARK_GREEN, padding: '10px 14px 8px', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <div style={{ color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                {isBB ? 'Best Ball' : 'Singles'} · Turtle Creek GC
              </div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 900, letterSpacing: 1 }}>
                {isBB ? `Group ${match.group}` : (match.id || '').toUpperCase()}
              </div>
            </div>
            <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 20, width: 30, height: 30, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>✕</button>
          </div>
          {/* Team boxes */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: `${KEV_COLOR}33`, border: `1.5px solid ${KEV_COLOR}`, borderRadius: 8, padding: '6px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: KEV_COLOR, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>■ Team Kev</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{kevName}</div>
              {isBB && <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
                {match.kev.map(p => p.strokes > 0 ? `${p.name} +${p.strokes}` : `${p.name} scratch`).join(' · ')}
              </div>}
              {!isBB && match.kevStrokes > 0 && <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>+{match.kevStrokes} strokes</div>}
            </div>
            <div style={{ flex: 1, background: `${G_COLOR}33`, border: `1.5px solid ${G_COLOR}`, borderRadius: 8, padding: '6px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>■ Team G</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{gName}</div>
              {isBB && <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
                {match.g.map(p => p.strokes > 0 ? `${p.name} +${p.strokes}` : `${p.name} scratch`).join(' · ')}
              </div>}
              {!isBB && match.gStrokes > 0 && <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>+{match.gStrokes} strokes</div>}
            </div>
          </div>
        </div>

        {/* ── Scorecard table (horizontal scroll) ── */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 720, width: '100%', fontSize: 11 }}>
            <thead>
              {/* Hole numbers */}
              <tr style={{ background: '#f7f4ee' }}>
                <td style={tdLeft}>Hole</td>
                {COURSE.par.map((_, i) => (
                  <td key={i} style={{ ...tdCenter, fontWeight: 700, color: '#444', fontSize: 10, background: i === 8 ? '#ece8e0' : undefined }}>
                    {i + 1}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f7f4ee' }}>
                <td style={tdLeft}>Yards</td>
                {COURSE.yards.map((y, i) => <td key={i} style={{ ...tdCenter, color: '#999', fontSize: 9 }}>{y}</td>)}
              </tr>
              <tr style={{ background: '#f7f4ee' }}>
                <td style={tdLeft}>Hdcp</td>
                {COURSE.handicap.map((h, i) => <td key={i} style={{ ...tdCenter, color: '#999', fontSize: 9 }}>{h}</td>)}
              </tr>
              <tr style={{ background: '#e8f0e8' }}>
                <td style={{ ...tdLeft, color: '#2d6a4f', fontWeight: 700 }}>Par</td>
                {COURSE.par.map((p, i) => <td key={i} style={{ ...tdCenter, color: '#2d6a4f', fontWeight: 700 }}>{p}</td>)}
              </tr>
            </thead>
            <tbody>
              {isBB ? (
                <>
                  {/* ── TEAM KEV: 2 player rows + best-net row ── */}
                  <tr style={{ background: '#d0d9f0' }}>
                    <td colSpan={19} style={{ padding: '3px 10px', fontSize: 9, fontWeight: 900, color: KEV_COLOR, letterSpacing: 2, textTransform: 'uppercase' }}>
                      ■ TEAM KEV — enter best net score per hole
                    </td>
                  </tr>
                  {match.kev.map((player, pi) => {
                    const strokesArr = kevPlayersStrokes[pi];
                    return (
                      <tr key={player.name} style={{ background: pi === 0 ? '#eef2ff' : '#e8edff' }}>
                        <td style={{ ...tdLeft, color: KEV_COLOR }}>
                          <div style={{ fontWeight: 700 }}>{player.name}</div>
                          <div style={{ fontSize: 8, color: '#888' }}>{player.strokes > 0 ? `+${player.strokes} strokes` : 'scratch'}</div>
                        </td>
                        {COURSE.par.map((par, i) => {
                          const hasStroke = strokesArr[i] > 0;
                          return (
                            <td key={i} style={{ padding: '2px 1px', textAlign: 'center', background: hasStroke ? `${KEV_COLOR}18` : undefined, borderBottom: hasStroke ? `2px solid ${KEV_COLOR}` : undefined }}>
                              {hasStroke && (
                                <div style={{ fontSize: 7, fontWeight: 900, color: KEV_COLOR, lineHeight: 1, marginBottom: 1 }}>+1</div>
                              )}
                              <div style={{ fontSize: 9, color: '#aaa' }}>—</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Kev score entry row (best net) */}
                  <tr style={{ background: '#dce6ff', borderTop: `2px solid ${KEV_COLOR}` }}>
                    <td style={{ ...tdLeft, color: KEV_COLOR, fontWeight: 900 }}>
                      <div>Best Net</div>
                      <div style={{ fontSize: 7, color: '#888' }}>enter here ↓</div>
                    </td>
                    {COURSE.par.map((par, i) => {
                      const val = local.kev[i];
                      const num = val === '' ? null : parseInt(val, 10);
                      const bg = num != null ? scoreColor(num, par) : '#fff';
                      const textCol = bg === '#f5f0e8' || bg === 'transparent' || bg === '#fff' ? '#333' : '#fff';
                      return (
                        <td key={i} style={{ padding: '3px 1px', textAlign: 'center', background: bg }}>
                          <input
                            type="number" min="1" max="15"
                            value={val}
                            onChange={e => set('kev', i, e.target.value)}
                            inputMode="numeric"
                            style={{ width: 28, height: 30, textAlign: 'center', border: `1.5px solid ${KEV_COLOR}55`, borderRadius: 6, fontSize: 13, fontWeight: 900, color: textCol, background: 'transparent', WebkitAppearance: 'none', MozAppearance: 'textfield', display: 'block', margin: '0 auto' }}
                          />
                          <div style={{ fontSize: 8, color: textCol, marginTop: 1 }}>
                            {num != null ? scoreLabel(num, par) : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── TEAM G: 2 player rows + best-net row ── */}
                  <tr style={{ background: '#b7d9c0' }}>
                    <td colSpan={19} style={{ padding: '3px 10px', fontSize: 9, fontWeight: 900, color: '#1a5c35', letterSpacing: 2, textTransform: 'uppercase' }}>
                      ■ TEAM G — enter best net score per hole
                    </td>
                  </tr>
                  {match.g.map((player, pi) => {
                    return (
                      <tr key={player.name} style={{ background: pi === 0 ? '#edf7ee' : '#e4f2e7' }}>
                        <td style={{ ...tdLeft, color: G_COLOR }}>
                          <div style={{ fontWeight: 700 }}>{player.name}</div>
                          <div style={{ fontSize: 8, color: '#888' }}>{player.strokes > 0 ? `+${player.strokes} strokes` : 'scratch'}</div>
                        </td>
                        {COURSE.par.map((par, i) => {
                          const hasStroke = gPlayersStrokes[pi][i] > 0;
                          return (
                            <td key={i} style={{ padding: '2px 1px', textAlign: 'center', background: hasStroke ? `${G_COLOR}18` : undefined, borderBottom: hasStroke ? `2px solid ${G_COLOR}` : undefined }}>
                              {hasStroke && (
                                <div style={{ fontSize: 7, fontWeight: 900, color: G_COLOR, lineHeight: 1, marginBottom: 1 }}>+1</div>
                              )}
                              <div style={{ fontSize: 9, color: '#aaa' }}>—</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* G score entry row (best net) */}
                  <tr style={{ background: '#cce8d4', borderTop: `2px solid ${G_COLOR}` }}>
                    <td style={{ ...tdLeft, color: G_COLOR, fontWeight: 900 }}>
                      <div>Best Net</div>
                      <div style={{ fontSize: 7, color: '#888' }}>enter here ↓</div>
                    </td>
                    {COURSE.par.map((par, i) => {
                      const val = local.g[i];
                      const num = val === '' ? null : parseInt(val, 10);
                      const bg = num != null ? scoreColor(num, par) : '#fff';
                      const textCol = bg === '#f5f0e8' || bg === 'transparent' || bg === '#fff' ? '#333' : '#fff';
                      return (
                        <td key={i} style={{ padding: '3px 1px', textAlign: 'center', background: bg }}>
                          <input
                            type="number" min="1" max="15"
                            value={val}
                            onChange={e => set('g', i, e.target.value)}
                            inputMode="numeric"
                            style={{ width: 28, height: 30, textAlign: 'center', border: `1.5px solid ${G_COLOR}55`, borderRadius: 6, fontSize: 13, fontWeight: 900, color: textCol, background: 'transparent', WebkitAppearance: 'none', MozAppearance: 'textfield', display: 'block', margin: '0 auto' }}
                          />
                          <div style={{ fontSize: 8, color: textCol, marginTop: 1 }}>
                            {num != null ? scoreLabel(num, par) : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </>
              ) : (
                <>
                  {/* ── SINGLES: 2 rows with stroke indicators ── */}
                  {/* KEV */}
                  <tr style={{ background: '#eef3ff' }}>
                    <td style={{ ...tdLeft, color: KEV_COLOR, fontWeight: 700 }}>
                      <div>{match.kevPlayer}</div>
                      <div style={{ fontSize: 8, color: '#888' }}>{match.kevStrokes > 0 ? `+${match.kevStrokes} strokes` : 'scratch'}</div>
                    </td>
                    {COURSE.par.map((par, i) => {
                      const val = local.kev[i];
                      const num = val === '' ? null : parseInt(val, 10);
                      const netNum = num != null ? num - kevSingStrokes[i] : null;
                      const hasStroke = kevSingStrokes[i] > 0;
                      const bg = num != null ? scoreColor(netNum, par) : '#fff';
                      const textCol = bg === '#f5f0e8' || bg === 'transparent' || bg === '#fff' ? '#333' : '#fff';
                      return (
                        <td key={i} style={{ padding: '3px 1px', textAlign: 'center', background: bg, borderBottom: hasStroke ? `2px solid ${KEV_COLOR}` : undefined }}>
                          {hasStroke && <div style={{ fontSize: 7, fontWeight: 900, color: num != null ? textCol : KEV_COLOR, lineHeight: 1 }}>+1</div>}
                          <input
                            type="number" min="1" max="15"
                            value={val}
                            onChange={e => set('kev', i, e.target.value)}
                            inputMode="numeric"
                            style={{ width: 28, height: 28, textAlign: 'center', border: `1.5px solid ${KEV_COLOR}44`, borderRadius: 6, fontSize: 13, fontWeight: 700, color: textCol, background: 'transparent', WebkitAppearance: 'none', MozAppearance: 'textfield', display: 'block', margin: '0 auto' }}
                          />
                          <div style={{ fontSize: 8, color: textCol, opacity: 0.85, marginTop: 1 }}>
                            {num != null ? scoreLabel(netNum, par) : ''}
                          </div>
                          {hasStroke && num != null && <div style={{ fontSize: 7, color: textCol, fontWeight: 700 }}>net {netNum}</div>}
                        </td>
                      );
                    })}
                  </tr>
                  {/* G */}
                  <tr style={{ background: '#edf7ee' }}>
                    <td style={{ ...tdLeft, color: G_COLOR, fontWeight: 700 }}>
                      <div>{match.gPlayer}</div>
                      <div style={{ fontSize: 8, color: '#888' }}>{match.gStrokes > 0 ? `+${match.gStrokes} strokes` : 'scratch'}</div>
                    </td>
                    {COURSE.par.map((par, i) => {
                      const val = local.g[i];
                      const num = val === '' ? null : parseInt(val, 10);
                      const netNum = num != null ? num - gSingStrokes[i] : null;
                      const hasStroke = gSingStrokes[i] > 0;
                      const bg = num != null ? scoreColor(netNum, par) : '#fff';
                      const textCol = bg === '#f5f0e8' || bg === 'transparent' || bg === '#fff' ? '#333' : '#fff';
                      return (
                        <td key={i} style={{ padding: '3px 1px', textAlign: 'center', background: bg, borderBottom: hasStroke ? `2px solid ${G_COLOR}` : undefined }}>
                          {hasStroke && <div style={{ fontSize: 7, fontWeight: 900, color: num != null ? textCol : G_COLOR, lineHeight: 1 }}>+1</div>}
                          <input
                            type="number" min="1" max="15"
                            value={val}
                            onChange={e => set('g', i, e.target.value)}
                            inputMode="numeric"
                            style={{ width: 28, height: 28, textAlign: 'center', border: `1.5px solid ${G_COLOR}44`, borderRadius: 6, fontSize: 13, fontWeight: 700, color: textCol, background: 'transparent', WebkitAppearance: 'none', MozAppearance: 'textfield', display: 'block', margin: '0 auto' }}
                          />
                          <div style={{ fontSize: 8, color: textCol, opacity: 0.85, marginTop: 1 }}>
                            {num != null ? scoreLabel(netNum, par) : ''}
                          </div>
                          {hasStroke && num != null && <div style={{ fontSize: 7, color: textCol, fontWeight: 700 }}>net {netNum}</div>}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}
              {/* Hole result row */}
              <tr style={{ background: '#fafafa' }}>
                <td style={{ ...tdLeft, color: '#888', fontSize: 9 }}>Result</td>
                {holeResults.map((r, i) => (
                  <td key={i} style={{ textAlign: 'center', padding: '3px 2px' }}>
                    {r === 'kev' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: KEV_COLOR, margin: '0 auto' }} />}
                    {r === 'g'   && <div style={{ width: 10, height: 10, borderRadius: '50%', background: G_COLOR,   margin: '0 auto' }} />}
                    {r === 'halved' && <div style={{ width: 10, height: 3, background: '#ccc', borderRadius: 2, margin: '0 auto' }} />}
                    {r === null  && <span style={{ color: '#ddd', fontSize: 9 }}>—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Match Momentum ── */}
        <div style={{ padding: '12px 14px 8px', background: '#fff', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Match Momentum</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 40 }}>
            {momentum.map((v, i) => {
              if (v === null) return <div key={i} style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, alignSelf: 'center' }} />;
              const pct = Math.abs(v) / maxMom;
              const barH = Math.max(4, pct * 36);
              const col = v > 0 ? KEV_COLOR : v < 0 ? G_COLOR : '#ccc';
              return <div key={i} style={{ flex: 1, height: barH, background: col, borderRadius: '2px 2px 0 0', alignSelf: 'flex-end', opacity: 0.85 }} />;
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: KEV_COLOR, fontWeight: 700 }}>■ Kev leads</span>
            <span style={{ fontSize: 9, color: G_COLOR,   fontWeight: 700 }}>G leads ■</span>
          </div>
        </div>

        {/* ── Score legend ── */}
        <div style={{ padding: '6px 14px 10px', background: '#fff', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[['#FFD700','Eagle+'],['#4CAF50','Birdie'],['#f5f0e8','Par'],['#e53935','Bogey'],['#8B0000','Double+']].map(([c, lbl]) => (
            <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#555' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, border: '1px solid #ddd', display: 'inline-block' }} />
              {lbl}
            </span>
          ))}
        </div>

        <div style={S.saveBtnWrap}>
          <button style={S.saveBtn} onClick={handleSave}>Save Scores</button>
        </div>
      </div>
    </div>
  );
}

// ── Best Ball Match Card ─────────────────────────────────
function BestBallCard({ match, scores, onTap }) {
  const result = computeBestBallMatch(match, scores);
  const leader = result.leader;
  return (
    <div style={S.matchCard}>
      <div style={S.matchCardTop}>
        <div style={S.matchPlayers}>
          <div style={{ ...S.groupBadge(), background: GOLD, color: DARK_GREEN, display: 'inline-block', fontSize: 9, fontWeight: 900, letterSpacing: 1, borderRadius: 4, padding: '2px 6px', marginBottom: 5 }}>
            GROUP {match.group}
          </div>
          <div style={S.playerRow(KEV_COLOR)}>
            <div style={S.colorSquare(KEV_COLOR)} />
            <span style={S.playerName(KEV_COLOR)}>
              {match.kev.map(p => (
                <span key={p.name}>
                  {p.name}{p.strokes > 0 && <span style={{ fontSize: 10, color: KEV_COLOR, fontWeight: 700, marginLeft: 2 }}>+{p.strokes}</span>}{' '}
                </span>
              ))}
            </span>
          </div>
          <div style={S.playerRow(G_COLOR)}>
            <div style={S.colorSquare(G_COLOR)} />
            <span style={S.playerName(G_COLOR)}>
              {match.g.map(p => (
                <span key={p.name}>
                  {p.name}{p.strokes > 0 && <span style={{ fontSize: 10, color: G_COLOR, fontWeight: 700, marginLeft: 2 }}>+{p.strokes}</span>}{' '}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          <div style={S.matchStanding(leader)}>
            {result.txt}
          </div>
          <button
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => onTap(match)}
          >
            <span style={S.tapHint}>tap to score →</span>
          </button>
        </div>
      </div>
      {/* Odds */}
      {(match.odds.kev || match.odds.g) && (
        <div style={S.oddsRow}>
          {match.kevFav ? (
            <>
              <OddsPill label="Team Kev" val={match.odds.kev} color={KEV_COLOR} />
              <OddsPill label="Team G"   val={match.odds.g}   color={G_COLOR} />
            </>
          ) : (
            <>
              <OddsPill label="Team G"   val={match.odds.g}   color={G_COLOR} />
              <OddsPill label="Team Kev" val={match.odds.kev} color={KEV_COLOR} />
            </>
          )}
        </div>
      )}
      <HoleStrip matchId={match.id} scores={scores} par={COURSE.par} />
    </div>
  );
}

// ── Singles Match Card ───────────────────────────────────
function SinglesCard({ match, scores, onTap }) {
  const result = computeSinglesMatch(match, scores);
  const leader = result.leader;
  const isPlaceholder = match.kevPlayer.includes('Singles');
  const kevStrokesArr = getStrokesPerHole(match.kevStrokes);
  const gStrokesArr   = getStrokesPerHole(match.gStrokes);
  return (
    <div style={{ ...S.matchCard, opacity: isPlaceholder ? 0.65 : 1 }}>
      <div style={S.matchCardTop}>
        <div style={S.matchPlayers}>
          <div style={S.playerRow(KEV_COLOR)}>
            <div style={S.colorSquare(KEV_COLOR)} />
            <span style={S.playerName(KEV_COLOR)}>{match.kevPlayer}</span>
            {match.kevStrokes > 0 && (
              <span style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}> (+{match.kevStrokes})</span>
            )}
          </div>
          <div style={S.playerRow(G_COLOR)}>
            <div style={S.colorSquare(G_COLOR)} />
            <span style={S.playerName(G_COLOR)}>{match.gPlayer}</span>
            {match.gStrokes > 0 && (
              <span style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}> (+{match.gStrokes})</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          {isPlaceholder ? (
            <div style={{ color: '#bbb', fontSize: 12, fontStyle: 'italic' }}>TBD</div>
          ) : (
            <>
              <div style={S.matchStanding(leader)}>{result.txt}</div>
              <button
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => onTap(match)}
              >
                <span style={S.tapHint}>tap to score →</span>
              </button>
            </>
          )}
        </div>
      </div>
      {!isPlaceholder && (
        <HoleStrip matchId={match.id} scores={scores} par={COURSE.par} kevStrokesArr={kevStrokesArr} gStrokesArr={gStrokesArr} />
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function App() {
  const [scores, setScores]       = useState({});
  const [activeTab, setActiveTab] = useState('bb');
  const [editMatch, setEditMatch] = useState(null);
  const [editType, setEditType]   = useState(null);

  // ── Load scores from Supabase ──────────────────────────
  const loadScores = useCallback(async () => {
    const { data, error } = await supabase
      .from('scores')
      .select('match_id, hole, team, score');
    if (error || !data) { console.error(error); return; }
    const built = {};
    for (const row of data) {
      if (!built[row.match_id]) built[row.match_id] = { kev: new Array(18).fill(null), g: new Array(18).fill(null) };
      if (row.score != null) built[row.match_id][row.team][row.hole] = row.score;
    }
    setScores(built);
  }, []);

  useEffect(() => {
    loadScores();
    const channel = supabase
      .channel('scores-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, loadScores)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadScores]);

  // ── Save scores to Supabase ────────────────────────────
  const handleSave = async (matchId, { kev, g }) => {
    const rows = [];
    for (let h = 0; h < 18; h++) {
      if (kev[h] != null) rows.push({ match_id: matchId, hole: h, team: 'kev', score: kev[h] });
      if (g[h]   != null) rows.push({ match_id: matchId, hole: h, team: 'g',   score: g[h] });
    }
    if (rows.length === 0) return;
    const { error } = await supabase.from('scores').upsert(rows, {
      onConflict: 'match_id,hole,team',
    });
    if (error) console.error(error);
    // Optimistic local update
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

  // ── Compute totals ─────────────────────────────────────
  const safeScores = scores || {};
  const bbResults  = BEST_BALL.map(m => computeBestBallMatch(m, safeScores));
  const singResults = SINGLES.map(m => computeSinglesMatch(m, safeScores));

  let kevPts = 0, gPts = 0;
  for (const r of bbResults) {
    const p = matchPoints(r);
    kevPts += p.kev; gPts += p.g;
  }
  for (const r of singResults) {
    const p = matchPoints(r);
    kevPts += p.kev; gPts += p.g;
  }

  const bbKev = bbResults.reduce((s, r) => s + matchPoints(r).kev, 0);
  const bbG   = bbResults.reduce((s, r) => s + matchPoints(r).g,   0);
  const sKev  = singResults.reduce((s, r) => s + matchPoints(r).kev, 0);
  const sG    = singResults.reduce((s, r) => s + matchPoints(r).g,   0);

  const fmt = v => v % 1 === 0 ? String(v) : v.toFixed(1);

  return (
    <div style={S.app}>
      {/* ── Header ──────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.liveDot}>
          <div style={S.dot} />
          <span>LIVE</span>
        </div>
        <div style={S.logoWrap}>
          <div style={S.logoCircle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: 4 }}>
              {/* Masters of Muni logo — white bg, dark green elements */}
              <svg width="58" height="44" viewBox="0 0 58 44" fill="none">
                {/* Tilted scorecard (rotated ~-10deg around center 36,18) */}
                <g transform="rotate(-10, 36, 18)">
                  <rect x="24" y="7" width="22" height="22" rx="2" fill="#fff" stroke={DARK_GREEN} strokeWidth="1.2"/>
                  {/* Grid lines vertical */}
                  <line x1="31" y1="7" x2="31" y2="29" stroke={DARK_GREEN} strokeWidth="0.7"/>
                  <line x1="38" y1="7" x2="38" y2="29" stroke={DARK_GREEN} strokeWidth="0.7"/>
                  {/* Grid lines horizontal */}
                  <line x1="24" y1="14" x2="46" y2="14" stroke={DARK_GREEN} strokeWidth="0.7"/>
                  <line x1="24" y1="21" x2="46" y2="21" stroke={DARK_GREEN} strokeWidth="0.7"/>
                  {/* Numbers 4, 5, 3 in right column */}
                  <text x="40" y="13" fontSize="4.5" fill={DARK_GREEN} fontFamily="Georgia, serif" fontWeight="700">4</text>
                  <text x="40" y="20" fontSize="4.5" fill={DARK_GREEN} fontFamily="Georgia, serif" fontWeight="700">5</text>
                  <text x="40" y="27" fontSize="4.5" fill={DARK_GREEN} fontFamily="Georgia, serif" fontWeight="700">3</text>
                </g>
                {/* Flag pole */}
                <line x1="18" y1="4" x2="18" y2="34" stroke={DARK_GREEN} strokeWidth="1.6" strokeLinecap="round"/>
                {/* Flag */}
                <polygon points="18,4 30,8.5 18,13" fill={DARK_GREEN}/>
                {/* Hole circle at base */}
                <ellipse cx="18" cy="35" rx="4" ry="2" fill="none" stroke={DARK_GREEN} strokeWidth="1.2"/>
              </svg>
              <span style={S.logoText}>Masters of Muni</span>
            </div>
          </div>
          <div>
            <h1 style={S.headerTitle}>Muni Cup 2026</h1>
            <p style={S.headerSub}>Turtle Creek GC · Oct 10, 2026</p>
            <p style={S.defChamp}>Team Kev — Defending Champs</p>
          </div>
        </div>
        {/* Scoreboard */}
        <div style={S.scoreboardWrap}>
          <div style={S.teamBox(KEV_COLOR, kevPts > gPts)}>
            <div style={S.teamLabel(KEV_COLOR)}>
              <div style={{ ...S.colorSquare(KEV_COLOR), width: 8, height: 8 }} />
              Team Kev
            </div>
            <div style={S.teamPts}>{fmt(kevPts)}</div>
          </div>
          <div style={S.ptsDivider}>
            <span>PTS</span>
            <span>—</span>
          </div>
          <div style={S.teamBox(G_COLOR, gPts > kevPts)}>
            <div style={S.teamLabel(G_COLOR)}>
              <div style={{ ...S.colorSquare(G_COLOR), width: 8, height: 8 }} />
              Team G
            </div>
            <div style={S.teamPts}>{fmt(gPts)}</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={S.tabs}>
        <button style={S.tab(activeTab === 'bb')}     onClick={() => setActiveTab('bb')}>
          Best Ball
        </button>
        <button style={S.tab(activeTab === 'singles')} onClick={() => setActiveTab('singles')}>
          Singles
        </button>
        <button style={S.tab(activeTab === 'info')}    onClick={() => setActiveTab('info')}>
          Course
        </button>
      </div>

      {/* ── Best Ball Tab ────────────────────────────────── */}
      {activeTab === 'bb' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div>
              <div style={S.sectionTitle}>Round 1 — Best Ball</div>
              <div style={S.sectionSub}>Turtle Creek · 18 Holes · Morning Round</div>
            </div>
            <div style={S.sectionScore}>{fmt(bbKev)} – {fmt(bbG)}</div>
          </div>
          {BEST_BALL.map(match => (
            <BestBallCard
              key={match.id}
              match={match}
              scores={scores}
              onTap={m => { setEditMatch(m); setEditType('bb'); }}
            />
          ))}
        </div>
      )}

      {/* ── Singles Tab ─────────────────────────────────── */}
      {activeTab === 'singles' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div>
              <div style={S.sectionTitle}>Round 2 — Singles</div>
              <div style={S.sectionSub}>Turtle Creek · 18 Holes · Afternoon Round</div>
            </div>
            <div style={S.sectionScore}>{fmt(sKev)} – {fmt(sG)}</div>
          </div>
          <div style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}66`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#666', fontStyle: 'italic' }}>
              🕐 Singles matchups will be announced on the day. Placeholders shown below.
            </p>
          </div>
          {SINGLES.map(match => (
            <SinglesCard
              key={match.id}
              match={match}
              scores={scores}
              onTap={m => { setEditMatch(m); setEditType('singles'); }}
            />
          ))}
        </div>
      )}

      {/* ── Course Info Tab ──────────────────────────────── */}
      {activeTab === 'info' && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <div>
              <div style={S.sectionTitle}>Turtle Creek GC</div>
              <div style={S.sectionSub}>White Tees · Par 72 · 5,827 yards</div>
            </div>
          </div>
          {/* Scorecard */}
          {[
            { label: 'Front 9', range: [0, 9] },
            { label: 'Back 9',  range: [9, 18] },
          ].map(({ label, range }) => {
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
                        {hRange.map((_, idx) => (
                          <th key={idx} style={{ color: '#b8d4c0', padding: '6px 6px', textAlign: 'center', minWidth: 28 }}>{range[0] + idx + 1}</th>
                        ))}
                        <th style={{ color: GOLD, padding: '6px 8px', textAlign: 'center' }}>OUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>YARDS</td>
                        {yRange.map((y, idx) => (
                          <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', color: '#555' }}>{y}</td>
                        ))}
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#555' }}>
                          {yRange.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>PAR</td>
                        {hRange.map((p, idx) => (
                          <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: DARK_GREEN }}>{p}</td>
                        ))}
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 900, color: DARK_GREEN }}>{parTotal}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#555', fontSize: 10, letterSpacing: 1 }}>HCP</td>
                        {hcpRange.map((h, idx) => (
                          <td key={idx} style={{ padding: '5px 4px', textAlign: 'center', color: '#777' }}>{h}</td>
                        ))}
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#777' }}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Stroke chart */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DARK_GREEN, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Best Ball — Strokes</div>
            {BEST_BALL.map(match => {
              const allPlayers = [
                ...match.kev.map(p => ({ ...p, team: 'kev' })),
                ...match.g.map(p => ({ ...p, team: 'g' })),
              ];
              return (
                <div key={match.id} style={{ marginBottom: 10, background: '#fff', borderRadius: 8, padding: '8px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 5 }}>GROUP {match.group}</div>
                  {allPlayers.map(p => {
                    const ph = getStrokesPerHole(p.strokes);
                    const isScratch = p.strokes === 0;
                    return (
                      <div key={p.name} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: p.team === 'kev' ? KEV_COLOR : G_COLOR, marginBottom: 3 }}>
                          {p.name} — {isScratch ? <span style={{ color: '#888', fontWeight: 400 }}>scratch (giving strokes)</span> : `${p.strokes} stroke${p.strokes !== 1 ? 's' : ''}`}
                        </div>
                        {!isScratch && (
                          <div style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflowX: 'auto' }}>
                            {ph.map((s, i) => (
                              <div key={i} style={{
                                width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                                background: s > 0 ? (p.team === 'kev' ? KEV_COLOR : G_COLOR) : '#f0f0f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 700,
                                color: s > 0 ? '#fff' : '#ccc',
                              }}>
                                {i + 1}
                                {s > 1 && <sup style={{ fontSize: 7 }}>{s}</sup>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Score Modal ──────────────────────────────────── */}
      {editMatch && (
        <ScoreModal
          match={editMatch}
          matchType={editType}
          scores={scores}
          onSave={handleSave}
          onClose={() => setEditMatch(null)}
        />
      )}

      {/* ── Masters of Muni Ad ───────────────────────────── */}
      <a
        href="https://www.instagram.com/mastersofmuni"
        target="_blank"
        rel="noopener noreferrer"
        style={S.adBadge}
      >
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
