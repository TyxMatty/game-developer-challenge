import { http, HttpResponse, delay } from 'msw';
import { type MatchRecord, type RankingEntry, type PaginatedResponse } from '../types/match';
import { PIRATE_FIXTURES } from './fixtures';
import { getScenario } from './scenarios';

const MATCHES_STORAGE_KEY = 'pirate_matches_db';

function getStoredMatches(): MatchRecord[] { // Final function to retrieve stored matches from localStorage
  try {
    const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read matches from localStorage:', e);
  }
  return [];
}

function saveStoredMatches(matches: MatchRecord[]) { // Final function to save matches to localStorage
  try {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  } catch (e) {
    console.warn('Failed to save matches to localStorage:', e);
  }
}

// Deterministic ranking sorting
function sortDeterministic(a: { score: number; duration: number; date: string; id: string }, b: { score: number; duration: number; date: string; id: string }): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.duration !== b.duration) return a.duration - b.duration;
  const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return a.id.localeCompare(b.id);
}

async function applyScenarioEffects( // VFX function to simulate network and server effects based on the current scenario
  method: 'GET' | 'POST',
  endpoint: 'ranking' | 'history' | 'match',
  request: Request,
) {
  const scenario = getScenario(); // Retrieve the current mock scenario

  if (scenario === 'error_500'
    || (scenario === 'error_ranking_only' && endpoint === 'ranking')
    || (scenario === 'error_history_only' && endpoint === 'history')) {
    await delay(100);
    return HttpResponse.json({ message: 'Simulated server error.' }, { status: 500 });
  }

  if (scenario === 'error_400') {
    return HttpResponse.json({ message: 'Simulated bad request.' }, { status: 400 });
  }

  if (scenario === 'network_error') {
    await delay(50);
    return HttpResponse.error();
  }

  if (scenario === 'out_of_order' && method === 'GET') {
    await delay(endpoint === 'ranking' ? 800 : 100);
    return;
  }

  if (scenario === 'slow_variable') {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const endpointOffset = endpoint === 'history' ? 1 : endpoint === 'match' ? 2 : 0;
    const stableDelay = 250 + ((page + endpointOffset) % 3) * 250;
    await delay(stableDelay);
  } else {
    // default realistic latency
    await delay(method === 'GET' ? 120 : 150);
  }
}

export const handlers = [ // Array of request handlers for the mock service worker
  // 1. Ranking endpoint
  http.get('/api/ranking', async ({ request }) => {
    const errorResponse = await applyScenarioEffects('GET', 'ranking', request);
    if (errorResponse) return errorResponse;

    const scenario = getScenario();
    if (scenario === 'empty_lists') {
      return HttpResponse.json({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '10', 10)));
    const sessionTime = url.searchParams.has('sessionTime') ? parseFloat(url.searchParams.get('sessionTime')!) : 60;
    const spawnInterval = url.searchParams.has('spawnInterval') ? parseFloat(url.searchParams.get('spawnInterval')!) : 3.0;

    const stored = getStoredMatches();
    const allMatches = [...PIRATE_FIXTURES, ...stored];

    const filtered = allMatches.filter(m => {
      const matchSessionTime = m.config?.sessionTime ?? 60;
      const matchSpawnInterval = m.config?.spawnInterval ?? 3.0;
      return matchSessionTime === sessionTime && matchSpawnInterval === spawnInterval;
    });

    filtered.sort(sortDeterministic);

    const rankingEntries: RankingEntry[] = filtered.map((m, idx) => ({
      id: m.id,
      rank: idx + 1,
      playerId: m.playerId,
      playerName: m.playerName,
      score: m.score,
      duration: m.duration,
      date: m.date,
      config: {
        sessionTime: m.config?.sessionTime ?? 60,
        spawnInterval: m.config?.spawnInterval ?? 3.0,
      }
    }));

    const total = rankingEntries.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const items = rankingEntries.slice(start, start + limit);

    const response: PaginatedResponse<RankingEntry> = {
      items,
      total,
      page,
      limit,
      totalPages
    };

    return HttpResponse.json(response);
  }),

  // 2. Match History endpoint
  http.get('/api/history', async ({ request }) => {
    const errorResponse = await applyScenarioEffects('GET', 'history', request);
    if (errorResponse) return errorResponse;

    const scenario = getScenario();
    if (scenario === 'empty_lists') {
      return HttpResponse.json({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '10', 10)));
    const playerId = url.searchParams.get('playerId') || 'player_me';

    const stored = getStoredMatches();
    const userMatches = stored.filter(m => m.playerId === playerId);

    userMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = userMatches.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const items = userMatches.slice(start, start + limit);

    const response: PaginatedResponse<MatchRecord> = {
      items,
      total,
      page,
      limit,
      totalPages
    };

    return HttpResponse.json(response);
  }),

  // 3. Register completed match
  http.post('/api/match', async ({ request }) => {
    const matchData = (await request.json()) as MatchRecord;

    if (!matchData || !matchData.id) {
      return new HttpResponse('Missing match ID', { status: 400 });
    }

    const stored = getStoredMatches();
    const existing = stored.find(m => m.id === matchData.id);

    if (existing) {
      return HttpResponse.json(existing, { status: 200 });
    }

    if (getScenario() === 'timeout_match_post') {
      stored.push(matchData);
      saveStoredMatches(stored);
      try {
        localStorage.setItem('pirate_last_completed_match', JSON.stringify(matchData));
      } catch (e) {
        console.warn('Failed to save last completed match:', e);
      }
      await delay(6000);
      return HttpResponse.json(matchData, { status: 201 });
    }

    const errorResponse = await applyScenarioEffects('POST', 'match', request);
    if (errorResponse) return errorResponse;

    const latest = getStoredMatches();
    const duplicate = latest.find(m => m.id === matchData.id);
    if (duplicate) {
      return HttpResponse.json(duplicate, { status: 200 });
    }

    latest.push(matchData);
    saveStoredMatches(latest);

    try {
      localStorage.setItem('pirate_last_completed_match', JSON.stringify(matchData));
    } catch (e) {
      console.warn('Failed to save last completed match:', e);
    }

    return HttpResponse.json(matchData, { status: 201 });
  })
];
