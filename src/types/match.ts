import { type GameConfig } from '../config/GameConfig';

export type TerminationReason = 'victory' | 'defeat' | 'time_out';

export interface MatchRecord {
  id: string; // Unique match identifier
  playerId: string;
  playerName: string;
  date: string; // ISO 8601 string
  score: number;
  duration: number; // Effective duration in seconds
  reason: TerminationReason;
  config: GameConfig; // Immutable snapshot of config used
}

export interface RankingEntry {
  id: string;
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  duration: number;
  date: string;
  config: {
    sessionTime: number;
    spawnInterval: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RankingParams {
  page?: number;
  limit?: number;
  sessionTime?: number;
  spawnInterval?: number;
}

export interface HistoryParams {
  page?: number;
  limit?: number;
  playerId?: string;
}

