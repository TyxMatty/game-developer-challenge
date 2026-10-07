import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import Options from './components/Options';
import Ranking from './components/Ranking';
import MatchHistory from './components/MatchHistory';
import ResultsModal from './components/ResultsModal';
import { loadLocalConfig, type GameConfig } from './config/GameConfig';
import { type MatchRecord } from './types/match';
import { NetworkSimulator } from './components/NetworkSimulator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

export type AppScreen = 'MENU' | 'PLAYING' | 'OPTIONS' | 'RANKING' | 'HISTORY' | 'RESULTS';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MENU');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('MENU');

  // Active match snapshot and result
  const [activeConfigSnapshot, setActiveConfigSnapshot] = useState<GameConfig | null>(null);
  const [completedMatch, setCompletedMatch] = useState<MatchRecord | null>(null);

  const startNewMatch = useCallback(() => {
    // Snapshot active config at the instant match begins
    const snapshot = loadLocalConfig();
    setActiveConfigSnapshot(snapshot);
    setCompletedMatch(null);
    setCurrentScreen('PLAYING');
  }, []);

  const handleGameOver = useCallback((record: MatchRecord) => {
    setCompletedMatch(record);
    setCurrentScreen('RESULTS');
  }, []);

  const handleQuitCombat = useCallback(() => {
    // Leaving combat early = match abandoned. NOT registered in history or ranking.
    setActiveConfigSnapshot(null);
    setCompletedMatch(null);
    setCurrentScreen('MENU');
  }, []);

  const openOptions = useCallback(() => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('OPTIONS');
  }, [currentScreen]);

  const closeOptions = useCallback(() => {
    setCurrentScreen(previousScreen === 'PLAYING' ? 'PLAYING' : 'MENU');
  }, [previousScreen]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#071626',
          backgroundImage: 'url(/assets/ui_scene_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Main Menu */}
        {currentScreen === 'MENU' && (
          <MainMenu
            onPlay={startNewMatch}
            onOptions={openOptions}
            onRanking={() => setCurrentScreen('RANKING')}
            onHistory={() => setCurrentScreen('HISTORY')}
          />
        )}

        {/* Combat Canvas */}
        {currentScreen === 'PLAYING' && activeConfigSnapshot && (
          <GameCanvas
            config={activeConfigSnapshot}
            onGameOver={handleGameOver}
            onQuit={handleQuitCombat}
            onOpenOptions={openOptions}
          />
        )}

        {/* Options Modal */}
        {currentScreen === 'OPTIONS' && (
          <Options onBack={closeOptions} />
        )}

        {/* Ranking Modal */}
        {currentScreen === 'RANKING' && (
          <Ranking onBack={() => setCurrentScreen('MENU')} />
        )}

        {/* Match History Modal */}
        {currentScreen === 'HISTORY' && (
          <MatchHistory onBack={() => setCurrentScreen('MENU')} />
        )}

        {/* Match Results Modal */}
        {currentScreen === 'RESULTS' && completedMatch && (
          <ResultsModal
            matchResult={completedMatch}
            onPlayAgain={startNewMatch}
            onMainMenu={() => {
              setCompletedMatch(null);
              setCurrentScreen('MENU');
            }}
          />
        )}

        {/* Network Mock Simulator Widget */}
        <NetworkSimulator />
      </div>
    </QueryClientProvider>
  );
}
