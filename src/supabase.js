import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Score helpers ─────────────────────────────────────────

export async function fetchScores(matchId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('match_id', matchId);
  if (error) console.error('fetchScores', error);
  return data || [];
}

export async function upsertScore(matchId, hole, team, score) {
  const { error } = await supabase
    .from('scores')
    .upsert(
      { match_id: matchId, hole, team, score, updated_at: new Date().toISOString() },
      { onConflict: 'match_id,hole,team' }
    );
  if (error) console.error('upsertScore', error);
}

export function subscribeToMatch(matchId, callback) {
  return supabase
    .channel(`scores:${matchId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'scores', filter: `match_id=eq.${matchId}` },
      callback
    )
    .subscribe();
}
