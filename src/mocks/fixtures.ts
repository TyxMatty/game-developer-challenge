import { type MatchRecord } from '../types/match';
import { DEFAULT_CONFIG } from '../config/GameConfig';

export const PIRATE_FIXTURES: MatchRecord[] = [ // Fixed mock data for pirate matches, can be removed or edited
  {
    id: 'fix-1',
    playerId: 'p_blackbeard',
    playerName: 'Edward "Blackbeard" Teach',
    date: '2026-10-01T12:00:00.000Z',
    score: 180,
    duration: 60,
    reason: 'time_out',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-2',
    playerId: 'p_anne_bonny',
    playerName: 'Anne Bonny',
    date: '2026-10-02T14:30:00.000Z',
    score: 150,
    duration: 55,
    reason: 'time_out',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-3',
    playerId: 'p_calico_jack',
    playerName: 'Calico Jack Rackham',
    date: '2026-10-03T16:15:00.000Z',
    score: 120,
    duration: 48,
    reason: 'defeat',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-4',
    playerId: 'p_captain_kidd',
    playerName: 'William Kidd',
    date: '2026-10-04T09:45:00.000Z',
    score: 110,
    duration: 60,
    reason: 'time_out',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-5',
    playerId: 'p_henry_morgan',
    playerName: 'Sir Henry Morgan',
    date: '2026-10-05T18:20:00.000Z',
    score: 90,
    duration: 40,
    reason: 'defeat',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-6',
    playerId: 'p_mary_read',
    playerName: 'Mary Read',
    date: '2026-10-06T11:10:00.000Z',
    score: 80,
    duration: 60,
    reason: 'time_out',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-7',
    playerId: 'p_bart_roberts',
    playerName: 'Black Bart Roberts',
    date: '2026-10-06T15:00:00.000Z',
    score: 60,
    duration: 35,
    reason: 'defeat',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  },
  {
    id: 'fix-8',
    playerId: 'p_francis_drake',
    playerName: 'Sir Francis Drake',
    date: '2026-10-07T08:00:00.000Z',
    score: 50,
    duration: 30,
    reason: 'defeat',
    config: { ...DEFAULT_CONFIG, sessionTime: 60, spawnInterval: 3.0 }
  }
];

