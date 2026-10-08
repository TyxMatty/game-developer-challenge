import axios from 'axios';
import {
  type MatchRecord,
  type RankingEntry,
  type PaginatedResponse,
  type RankingParams,
  type HistoryParams
} from '../types/match';

export const apiClient = axios.create({ // axios instance for API requests
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const matchApi = { // API methods for match-related operations, like rankings and match history
  getRanking: async (params: RankingParams = {}): Promise<PaginatedResponse<RankingEntry>> => {
    const response = await apiClient.get<PaginatedResponse<RankingEntry>>('/ranking', { params });
    return response.data;
  },

  getHistory: async (params: HistoryParams = {}): Promise<PaginatedResponse<MatchRecord>> => {
    const response = await apiClient.get<PaginatedResponse<MatchRecord>>('/history', { params });
    return response.data;
  },

  recordMatch: async (match: MatchRecord): Promise<MatchRecord> => {
    const response = await apiClient.post<MatchRecord>('/match', match);
    return response.data;
  }
};

// Pending matches queue for offline / failed submission resilience
const PENDING_MATCHES_KEY = 'pirate_pending_matches_queue';

export function getPendingMatches(): MatchRecord[] { // this function retrieves the list of pending matches from local storage
  try {
    const data = localStorage.getItem(PENDING_MATCHES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read pending matches:', e); // catch to avoid breaking if local storage is inaccessible
  }
  return [];
}

export function queuePendingMatch(match: MatchRecord) { // this function adds a match to the pending matches queue in local storage
  const pending = getPendingMatches();
  if (!pending.some(m => m.id === match.id)) {
    pending.push(match);
    try {
      localStorage.setItem(PENDING_MATCHES_KEY, JSON.stringify(pending));
    } catch (e) {
      console.warn('Failed to queue pending match:', e);
    }
  }
}

export function removePendingMatch(matchId: string) {
  const pending = getPendingMatches().filter(m => m.id !== matchId);
  try {
    localStorage.setItem(PENDING_MATCHES_KEY, JSON.stringify(pending));
  } catch (e) {
    console.warn('Failed to remove pending match:', e);
  }
}

