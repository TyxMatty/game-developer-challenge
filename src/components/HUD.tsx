import { useEffect, useRef, useState } from 'react';

interface HUDProps {
  health: number;
  maxHealth: number;
  time: number;
  score: number;
  onPause?: () => void;
}

export default function HUD({ health, maxHealth, time, score, onPause }: HUDProps) { // Heads-Up Display component for showing player health, time, and score
  const isCompact = window.innerWidth <= 600;
  const timeString = `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  // Keep announcements useful without speaking on every HUD update.
  const lastAnnouncedTimeRef = useRef<number>(Math.floor(time));
  const lastAnnouncedHealthRef = useRef(health);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const currentSec = Math.floor(time);
    const becameLowHealth = health <= maxHealth * 0.2 && lastAnnouncedHealthRef.current > maxHealth * 0.2;
    if ((currentSec !== lastAnnouncedTimeRef.current && currentSec % 15 === 0) || becameLowHealth) {
      lastAnnouncedTimeRef.current = currentSec;
      setAnnouncement(`Time remaining: ${currentSec} seconds. Score: ${score}. Health: ${Math.ceil(health)} of ${maxHealth}.`);
    }
    lastAnnouncedHealthRef.current = health;
  }, [time, score, health, maxHealth]);

  return ( // styled header containing the HUD elements
    <header
      role="banner"
      aria-label="Combat Heads-Up Display"
      className="combat-hud"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        padding: isCompact ? 8 : '12px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: isCompact ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: isCompact ? 6 : 0,
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
        {announcement}
      </div>

      {/* Top Left: Health Bar */}
      <div
        className="hud-health"
        style={{ display: 'flex', alignItems: 'center' }}
        role="meter"
        aria-label="Player health"
        aria-valuemin={0}
        aria-valuemax={maxHealth}
        aria-valuenow={Math.ceil(health)}
      >
        <img
          src="/assets/png/default/ui/hud/icon_heart.png"
          alt=""
          style={{ width: isCompact ? 34 : 42, height: isCompact ? 34 : 42, zIndex: 2 }}
        />
        <div style={{ position: 'relative', marginLeft: isCompact ? -14 : -18, width: isCompact ? 210 : 240, height: 44 }}>
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
      <div
        className="hud-counters"
        style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 6 : 12, alignSelf: isCompact ? 'flex-end' : undefined }}
      >
        {/* Score Panel */}
        <div
          className="hud-score"
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          role="group"
          aria-label={`Score: ${score}`}
        >
          <img
            src="/assets/png/default/ui/hud/icon_score.png"
            alt=""
            style={{ width: isCompact ? 28 : 38, height: isCompact ? 28 : 38, zIndex: 2, marginRight: isCompact ? -14 : -18 }}
          />
          <div
            style={{
              position: 'relative',
              width: isCompact ? 100 : 130,
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
                fontSize: isCompact ? '1rem' : '1.3rem',
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
          className="hud-time"
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          role="group"
          aria-label={`Time remaining: ${timeString}`}
        >
          <img
            src="/assets/png/default/ui/hud/icon_time.png"
            alt=""
            style={{ width: isCompact ? 28 : 38, height: isCompact ? 28 : 38, zIndex: 2, marginRight: isCompact ? -14 : -18 }}
          />
          <div
            style={{
              position: 'relative',
              width: isCompact ? 100 : 130,
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
                fontSize: isCompact ? '1rem' : '1.3rem',
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
              width: isCompact ? 40 : 44,
              height: isCompact ? 40 : 44,
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
