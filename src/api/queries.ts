import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi, queuePendingMatch, removePendingMatch, getPendingMatches } from './client';
import { type RankingParams, type HistoryParams, type MatchRecord } from '../types/match';

export function useRanking(params: RankingParams = {}) {
  return useQuery({
    queryKey: ['ranking', params],
    queryFn: () => matchApi.getRanking(params),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useMatchHistory(params: HistoryParams = {}) {
  return useQuery({
    queryKey: ['history', params],
    queryFn: () => matchApi.getHistory(params),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useRecordMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (match: MatchRecord) => {
      try {
        const result = await matchApi.recordMatch(match);
        removePendingMatch(match.id);
        return result;
      } catch (err) {
        // Guarantee pending match resilience on network failure
        queuePendingMatch(match);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate both ranking and history queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: (err) => {
      console.warn('Match record deferred to pending queue due to API failure:', err);
    }
  });
}

export function useFlushPendingMatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const pending = getPendingMatches();
      const results: MatchRecord[] = [];
      for (const match of pending) {
        try {
          const res = await matchApi.recordMatch(match);
          removePendingMatch(match.id);
          results.push(res);
        } catch (e) {
          console.warn(`Could not sync pending match ${match.id}:`, e);
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });
}

