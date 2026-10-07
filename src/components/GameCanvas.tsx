// src/components/GameCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import { Simulation } from '../game/Simulation';
import { Renderer } from '../game/Renderer';
import HUD from './HUD';
import { loadLocalConfig } from '../config/GameConfig';

interface GameProps {
  onGameOver?: (score: number) => void;
}

export default function GameCanvas({ onGameOver }: GameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const [gameState, setGameState] = useState(() => {
    const c = loadLocalConfig();
    return { health: c.player.maxHealth, maxHealth: c.player.maxHealth, time: c.sessionTime, score: 0 };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const simulation = new Simulation();
    const renderer = new Renderer(simulation);
    let mounted = true;

    simulation.onStateChange = (state) => {
      if (!mounted) return;
      setGameState(state);

      if ((state.health <= 0 || state.time <= 0) && onGameOverRef.current) {
        onGameOverRef.current(state.score);
      }
    };

    renderer.init(containerRef.current).then(() => {
      if (!mounted) {
        renderer.destroy();
        return;
      }
      simulation.start();
    });

    return () => {
      mounted = false;
      simulation.destroy();
      renderer.destroy();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD health={gameState.health} maxHealth={gameState.maxHealth} time={gameState.time} score={gameState.score} />
    </div>
  );
}
