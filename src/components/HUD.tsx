import { useEffect, useRef } from 'react';

interface HUDProps {
  health: number;
  maxHealth: number;
  time: number;
  score: number;
  onPause?: () => void;
}

export default function HUD({ health, maxHealth, time, score, onPause }: HUDProps) {
  const timeString = `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  // Throttled accessibility announcements (every 10s or when low health)
  const lastAnnouncedTimeRef = useRef<number>(Math.floor(time));
  const announcementRef = useRef<string>('');

  useEffect(() => {
    const currentSec = Math.floor(time);
    if (currentSec !== lastAnnouncedTimeRef.current && currentSec % 15 === 0) {
      lastAnnouncedTimeRef.current = currentSec;
      announcementRef.current = `Time remaining: ${currentSec} seconds. Score: ${score}. Health: ${Math.ceil(health)} of ${maxHealth}.`;
    }
  }, [time, score, health, maxHealth]);

  return (
    <header
      role="banner"
      aria-label="Combat Heads-Up Display"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        padding: '12px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      {/* Screen Reader Semantic Live Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
        }}
      >
        {announcementRef.current}
      </div>

      {/* Top Left: Health Bar */}
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        aria-label={`Player Health: ${Math.ceil(health)} of ${maxHealth}`}
      >
        <img
          src="/assets/png/default/ui/hud/icon_heart.png"
          alt=""
          style={{ width: 42, height: 42, zIndex: 2 }}
        />
        <div style={{ position: 'relative', marginLeft: '-18px', width: 240, height: 44 }}>
          <img
            src="/assets/png/default/ui/hud/health_frame.png"
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
              clipPath: `inset(0 ${100 - hpPercent}% 0 0)`,
              transition: 'clip-path 0.15s ease-out',
            }}
          >
            <img
              src="/assets/png/default/ui/hud/health_fill_green.png"
              alt=""
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>

          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              textShadow: '2px 2px 3px rgba(0,0,0,0.9)',
              zIndex: 3,
              userSelect: 'none',
            }}
          >
            {Math.ceil(health)} / {maxHealth}
          </span>
        </div>
      </div>

      {/* Top Right: Score, Time & Pause button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Score Panel */}
        <div
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          aria-label={`Score: ${score}`}
        >
          <img
            src="/assets/png/default/ui/hud/icon_score.png"
            alt=""
            style={{ width: 38, height: 38, zIndex: 2, marginRight: '-18px' }}
          />
          <div
            style={{
              position: 'relative',
              width: 130,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/assets/png/default/ui/hud/counter_panel.png"
              alt=""
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
            />
            <span
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.3rem',
                textShadow: '2px 2px 3px rgba(0,0,0,0.9)',
                zIndex: 2,
                userSelect: 'none',
              }}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Time Panel */}
        <div
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          aria-label={`Time remaining: ${timeString}`}
        >
          <img
            src="/assets/png/default/ui/hud/icon_time.png"
            alt=""
            style={{ width: 38, height: 38, zIndex: 2, marginRight: '-18px' }}
          />
          <div
            style={{
              position: 'relative',
              width: 130,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/assets/png/default/ui/hud/counter_panel.png"
              alt=""
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
            />
            <span
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.3rem',
                textShadow: '2px 2px 3px rgba(0,0,0,0.9)',
                zIndex: 2,
                userSelect: 'none',
              }}
            >
              {timeString}
            </span>
          </div>
        </div>

        {/* Pause Button */}
        {onPause && (
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause game (or press Escape)"
            style={{
              position: 'relative',
              width: 44,
              height: 44,
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outlineOffset: 2,
            }}
          >
            <img
              src="/assets/png/default/ui/controls/button_round_normal.png"
              alt=""
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <img
              src="/assets/png/default/ui/controls/icon_pause.png"
              alt=""
              style={{ width: 22, height: 22, zIndex: 1 }}
            />
          </button>
        )}
      </div>
    </header>
  );
}
