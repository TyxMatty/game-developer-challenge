import { useState } from 'react';
import GameCanvas  from './components/GameCanvas';

export type GameState = 'MENU' | 'PLAYING' | 'OPTIONS' | 'RESULTS';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', color: 'white', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {gameState === 'MENU' && (
        <div style={overlayStyle}>
          <h1 style={{ fontSize: '4rem', textShadow: '4px 4px #000' }}>PIRATE BATTLE</h1>
          <button style={btnStyle} onClick={() => setGameState('PLAYING')}>🕹️ Começar Batalha</button>
          <button style={btnStyle} onClick={() => setGameState('OPTIONS')}>⚙️ Opções</button>
          <button style={btnStyle} disabled>🏆 Ranking (Em breve)</button>
        </div>
      )}

      {gameState === 'OPTIONS' && (
        <div style={overlayStyle}>
          <h1>Opções do Jogo</h1>
          <p>Aqui colocaremos sliders de dificuldade e tempo de sessão.</p>
          <button style={btnStyle} onClick={() => setGameState('MENU')}>Voltar</button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <>
          <GameCanvas onGameOver={() => setGameState('RESULTS')} />
          <button 
            style={{ position: 'absolute', top: 70, right: 20, zIndex: 10 }}
            onClick={() => setGameState('RESULTS')}
          >
            Desistir
          </button>
        </>
      )}

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
