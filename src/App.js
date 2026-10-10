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
        const entered = ks != null && gs !=
