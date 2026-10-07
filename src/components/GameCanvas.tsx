import { useEffect, useRef, useState, useCallback } from 'react';
import { Simulation } from '../game/Simulation';
import { Renderer } from '../game/Renderer';
import HUD from './HUD';
import PauseMenu from './PauseMenu';
import MobileControls from './MobileControls';
import { type GameConfig } from '../config/GameConfig';
import { type MatchRecord } from '../types/match';

interface GameCanvasProps {
  config: GameConfig;
  onGameOver: (record: MatchRecord) => void;
  onQuit: () => void;
  onOpenOptions: () => void;
}

export default function GameCanvas({ config, onGameOver, onQuit, onOpenOptions }: GameCanvasProps) { // Main game canvas component that handles the simulation, rendering, and game state
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true); // Indicates if the game assets are currently loading
  const [loadProgress, setLoadProgress] = useState<number>(0); // Tracks the progress of asset loading
  const [loadError, setLoadError] = useState<string | null>(null); // Stores any error that occurs during asset loading
  const [loadAttempt, setLoadAttempt] = useState<number>(0); // Tracks the number of asset load attempts
  const [isPaused, setIsPaused] = useState<boolean>(false); // Indicates if the game is currently paused
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false); // Indicates if the game is auto-paused due to blur or tab hidden

  const [gameState, setGameState] = useState(() => ({
    health: config.player.maxHealth,
    maxHealth: config.player.maxHealth,
    time: config.sessionTime,
    score: 0,
  }));

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const handlePause = useCallback((auto = false) => { // This method handles pausing the game, either manually or automatically
    if (simulationRef.current && simulationRef.current.isRunning && !simulationRef.current.isPaused) {
      simulationRef.current.pause();
      setIsPaused(true);
      setIsAutoPaused(auto);
    }
  }, []);

  const handleResume = useCallback(() => { // This method handles resuming the game from a paused state
    if (simulationRef.current && simulationRef.current.isPaused) {
      simulationRef.current.resume();
      setIsPaused(false);
      setIsAutoPaused(false);
    }
  }, []);

  useEffect(() => { // Method for VFX initialization and game loop setup
    if (!containerRef.current) return;

    // Create match simulation with immutable snapshot
    const simulation = new Simulation(config);
    const renderer = new Renderer(simulation);

    simulationRef.current = simulation;
    rendererRef.current = renderer;
    let mounted = true;

    simulation.onStateChange = (state) => {
      if (!mounted) return;
      setGameState(state);
    };

    simulation.onGameOver = (result) => {
      if (!mounted) return;
      const record: MatchRecord = {
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        playerId: 'player_me',
        playerName: 'Captain Player',
        date: new Date().toISOString(),
        score: result.score,
        duration: result.duration,
        reason: result.reason,
        config: result.config,
      };
      onGameOver(record);
    };

    // Asset loading with progress feedback
    renderer
      .init(containerRef.current, (progress) => {
        if (mounted) {
          setLoadProgress(Math.min(100, Math.round(progress * 100)));
        }
      })
      .then(() => {
        if (!mounted) {
          renderer.destroy();
          return;
        }
        setIsLoading(false);
        simulation.start();
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setIsLoading(false);
        setLoadError(error instanceof Error ? error.message : 'Unable to load game assets.');
      });

    // Auto-pause handlers (blur and tab hidden)
    const handleBlur = () => {
      handlePause(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePause(true);
      }
    };

    // Escape key manual pause
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (simulationRef.current?.isPaused) {
          handleResume();
        } else {
          handlePause(false);
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      mounted = false;
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);

      simulation.destroy();
      renderer.destroy();
      simulationRef.current = null;
      rendererRef.current = null;
    };
  }, [config, onGameOver, handlePause, handleResume, loadAttempt]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1099bb',
      }}
    >
      {/* Loading Screen with Progress Bar */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#071626',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            color: '#ffdf7e',
          }}
        >
          <img
            src="/assets/png/default/ui/menu/title_pirate_battle.png"
            alt="Pirate Battle"
            style={{ width: 320, maxWidth: '80vw', marginBottom: 24 }}
          />
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 800 }}>
            Preparing the Fleet... {loadProgress}%
          </h2>
          <div
            style={{
              width: 280,
              maxWidth: '80vw',
              height: 20,
              backgroundColor: '#1c2d3d',
              borderRadius: 10,
              overflow: 'hidden',
              border: '2px solid #5d4037',
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                backgroundColor: '#4caf50',
                transition: 'width 0.15s ease-out',
              }}
            />
          </div>
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            backgroundColor: '#071626',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <h2>Failed to load game assets</h2>
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              setLoadProgress(0);
              setIsLoading(true);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Retry
          </button>
          <button type="button" onClick={onQuit}>Main Menu</button>
        </div>
      )}

      {/* PIXI Canvas Container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* HUD Header */}
      {!isLoading && (
        <HUD
          health={gameState.health}
          maxHealth={gameState.maxHealth}
          time={gameState.time}
          score={gameState.score}
          onPause={() => handlePause(false)}
        />
      )}

      {/* Mobile Touch Controls */}
      {!isLoading && isTouchDevice && (
        <MobileControls
          simulation={simulationRef.current}
        />
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <PauseMenu
          onResume={handleResume}
          onOptions={onOpenOptions}
          onQuit={onQuit}
          isAutoPaused={isAutoPaused}
        />
      )}
    </div>
  );
}
