// src/App.tsx
import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';

// os possíveis estados do jogo
export type GameState = 'MENU' | 'PLAYING' | 'OPTIONS' | 'RESULTS';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', color: 'white', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* TELA DE MENU */}
      {gameState === 'MENU' && (
        <div style={overlayStyle}>
          <h1 style={{ fontSize: '4rem', textShadow: '4px 4px #000' }}>PIRATE BATTLE</h1>
          <button style={btnStyle} onClick={() => setGameState('PLAYING')}>🕹️ Começar Batalha</button>
          <button style={btnStyle} onClick={() => setGameState('OPTIONS')}>⚙️ Opções</button>
          <button style={btnStyle} disabled>🏆 Ranking (Em breve)</button>
        </div>
      )}

      {/* TELA DE OPÇÕES */}
      {gameState === 'OPTIONS' && (
        <div style={overlayStyle}>
          <h1>Opções do Jogo</h1>
          <p>Aqui colocaremos sliders de dificuldade e tempo de sessão.</p>
          <button style={btnStyle} onClick={() => setGameState('MENU')}>Voltar</button>
        </div>
      )}

      {/* TELA DE GAMEPLAY (O jogo rodando de fato) */}
      {gameState === 'PLAYING' && (
        <>
          {/* O componente GameCanvas faz uma instance  do PixiJS e a Simulação */}
          <GameCanvas />
          
          {/* HUD: Heads-Up Display (Fica flutuando sobre o Canvas) */}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none', textShadow: '2px 2px #000' }}>
            <h2 style={{ margin: 0 }}>❤️ Vida: 100</h2>
            <h2 style={{ margin: 0 }}>⏱️ Tempo: 60s</h2>
            <h2 style={{ margin: 0 }}>🎯 Pontos: 0</h2>
          </div>
          
          <button 
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
            onClick={() => setGameState('RESULTS')}
          >
            Desistir
          </button>
        </>
      )}

      {/* TELA DE RESULTADOS */}
      {gameState === 'RESULTS' && (
        <div style={overlayStyle}>
          <h1 style={{ color: '#ff3333' }}>Fim de Jogo!</h1>
          <h2>Sua Pontuação: 0</h2>
          <button style={btnStyle} onClick={() => setGameState('MENU')}>Voltar ao Menu Principal</button>
        </div>
      )}

    </div>
  );
}

// Estilos básicos provisórios para organizar a tela
const overlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column', 
  alignItems: 'center', justifyContent: 'center',
  zIndex: 20, gap: '1rem'
};

const btnStyle: React.CSSProperties = {
  padding: '12px 24px', fontSize: '1.2rem', cursor: 'pointer',
  backgroundColor: '#333', color: 'white', border: '2px solid #555', borderRadius: '8px'
};