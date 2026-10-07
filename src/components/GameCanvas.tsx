// src/components/GameCanvas.tsx
import { useEffect, useRef } from 'react';
import { Simulation } from '../game/Simulation';
import { Renderer } from '../game/Renderer';

export function GameCanvas() {
  // Referência para a div container do PixiJS
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let isInitialized = false;

    const simulation = new Simulation();
    const renderer = new Renderer(simulation);

    renderer.init(containerRef.current).then(() => {
      // Se o componente foi desmontado no meio do carregamento, descarta esse PixiJS
      if (!mounted) {
        renderer.destroy();
        return;
      }
      
      isInitialized = true;
      simulation.start();
    }).catch(err => {
      console.error("Falha ao inicializar PixiJS:", err);
    });

    return () => {
      mounted = false;
      simulation.stop();
      if (isInitialized) {
        renderer.destroy();
      }
    };
  }, []);

  // Div que vai acomodar o PixiJS
  return (
    <div 
      ref={containerRef} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000' }} 
    />
  );
}