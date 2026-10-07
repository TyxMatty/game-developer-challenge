interface HUDProps {
  health: number;
  maxHealth: number;
  time: number;
  score: number;
}

export default function HUD({ health, maxHealth, time, score }: HUDProps) {
  const timeString = `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', zIndex: 10 }}>
      {/* Canto Superior Esquerdo: Vida */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center' }}>
        <img src="/assets/png/default/ui/hud/icon_heart.png" alt="Life" style={{ width: 40, height: 40, zIndex: 2 }} />
        <div style={{ position: 'relative', marginLeft: '-20px', width: 256, height: 48 }}>
          <img src="/assets/png/default/ui/hud/health_frame.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
          
          <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2,
            clipPath: `inset(0 ${100 - hpPercent}% 0 0)`
          }}>
            <img src="/assets/png/default/ui/hud/health_fill_green.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          </div>

          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '2px 2px 2px black', zIndex: 3 }}>
            {Math.ceil(health)} / {maxHealth}
          </span>
        </div>
      </div>

      {/* Canto Superior Direito: Placar e Relógio */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src="/assets/png/default/ui/hud/icon_score.png" alt="Score" style={{ width: 40, height: 40, zIndex: 2, marginRight: '-20px' }} />
          <div style={{ position: 'relative', width: 160, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/png/default/ui/hud/counter_panel.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '2px 2px 2px black', zIndex: 2 }}>{score}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src="/assets/png/default/ui/hud/icon_time.png" alt="Time" style={{ width: 40, height: 40, zIndex: 2, marginRight: '-20px' }} />
          <div style={{ position: 'relative', width: 160, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/png/default/ui/hud/counter_panel.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '2px 2px 2px black', zIndex: 2 }}>{timeString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
