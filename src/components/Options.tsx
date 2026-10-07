import { useState, useEffect, useRef } from 'react';
import { loadLocalConfig, saveLocalConfig, CONFIG_LIMITS, type GameConfig } from '../config/GameConfig';

interface OptionsProps {
  onBack: () => void;
}

export default function Options({ onBack }: OptionsProps) {
  const [config, setConfig] = useState<GameConfig>(() => loadLocalConfig());
  const [savedMessage, setSavedMessage] = useState<string>('');
  const backBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backBtnRef.current?.focus();
  }, []);

  const handleSessionTimeChange = (delta: number) => {
    const limits = CONFIG_LIMITS.sessionTime;
    const newVal = Math.max(limits.min, Math.min(limits.max, config.sessionTime + delta));
    const updated = saveLocalConfig({ sessionTime: newVal });
    setConfig(updated);
    setSavedMessage(`Session time updated to ${newVal}s`);
  };

  const handleSpawnIntervalChange = (delta: number) => {
    const limits = CONFIG_LIMITS.spawnInterval;
    const newVal = Math.max(limits.min, Math.min(limits.max, Math.round((config.spawnInterval + delta) * 10) / 10));
    const updated = saveLocalConfig({ spawnInterval: newVal });
    setConfig(updated);
    setSavedMessage(`Spawn interval updated to ${newVal}s`);
  };

  const handleResetDefaults = () => {
    const updated = saveLocalConfig({
      sessionTime: CONFIG_LIMITS.sessionTime.default,
      spawnInterval: CONFIG_LIMITS.spawnInterval.default,
    });
    setConfig(updated);
    setSavedMessage('Defaults restored.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="options-title"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 440,
          maxWidth: '95vw',
          backgroundImage: 'url(/assets/png/default/ui/menu/panel_menu.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 32px 36px',
          boxSizing: 'border-box',
          gap: '18px',
          color: '#ffffff',
        }}
      >
        <h2
          id="options-title"
          style={{
            margin: 0,
            color: '#ffdf7e',
            fontSize: '2rem',
            textShadow: '3px 3px 5px #000',
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Battle Options
        </h2>

        {/* Live region for feedback */}
        <div
          role="status"
          aria-live="polite"
          style={{
            fontSize: '0.85rem',
            color: '#85ff85',
            minHeight: '1.2rem',
            textShadow: '1px 1px 2px #000',
          }}
        >
          {savedMessage}
        </div>

        {/* Setting 1: Game Session Time */}
        <div style={settingRowStyle}>
          <div style={{ flex: 1 }}>
            <label id="session-time-label" style={labelStyle}>
              Session Time
            </label>
            <div style={descStyle}>{CONFIG_LIMITS.sessionTime.description}</div>
          </div>
          <div style={stepperStyle}>
            <button
              type="button"
              onClick={() => handleSessionTimeChange(-CONFIG_LIMITS.sessionTime.step)}
              disabled={config.sessionTime <= CONFIG_LIMITS.sessionTime.min}
              aria-label="Decrease session time by 15s"
              style={stepperBtnStyle}
            >
              -
            </button>
            <span
              aria-labelledby="session-time-label"
              style={valueStyle}
            >
              {config.sessionTime}s
            </span>
            <button
              type="button"
              onClick={() => handleSessionTimeChange(CONFIG_LIMITS.sessionTime.step)}
              disabled={config.sessionTime >= CONFIG_LIMITS.sessionTime.max}
              aria-label="Increase session time by 15s"
              style={stepperBtnStyle}
            >
              +
            </button>
          </div>
        </div>

        {/* Setting 2: Enemy Spawn Time */}
        <div style={settingRowStyle}>
          <div style={{ flex: 1 }}>
            <label id="spawn-interval-label" style={labelStyle}>
              Spawn Interval
            </label>
            <div style={descStyle}>{CONFIG_LIMITS.spawnInterval.description}</div>
          </div>
          <div style={stepperStyle}>
            <button
              type="button"
              onClick={() => handleSpawnIntervalChange(-CONFIG_LIMITS.spawnInterval.step)}
              disabled={config.spawnInterval <= CONFIG_LIMITS.spawnInterval.min}
              aria-label="Decrease spawn interval by 0.5s"
              style={stepperBtnStyle}
            >
              -
            </button>
            <span
              aria-labelledby="spawn-interval-label"
              style={valueStyle}
            >
              {config.spawnInterval.toFixed(1)}s
            </span>
            <button
              type="button"
              onClick={() => handleSpawnIntervalChange(CONFIG_LIMITS.spawnInterval.step)}
              disabled={config.spawnInterval >= CONFIG_LIMITS.spawnInterval.max}
              aria-label="Increase spawn interval by 0.5s"
              style={stepperBtnStyle}
            >
              +
            </button>
          </div>
        </div>

        {/* Reset & Back Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center', marginTop: 8 }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              background: 'none',
              border: 'none',
              color: '#d6e8ff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Reset to Default Settings
          </button>

          <button
            ref={backBtnRef}
            type="button"
            onClick={onBack}
            style={{
              position: 'relative',
              width: 230,
              height: 56,
              background: 'url(/assets/png/default/ui/menu/button_primary_normal.png) no-repeat center / contain',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.2rem',
              textShadow: '2px 2px 3px #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

const settingRowStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  padding: '10px 14px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
  gap: '12px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '1.05rem',
  color: '#ffdf7e',
  textShadow: '1px 1px 2px #000',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: '#cfd8dc',
  marginTop: '2px',
};

const stepperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const stepperBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '6px',
  backgroundColor: '#5d4037',
  border: '2px solid #8d6e63',
  color: '#ffffff',
  fontSize: '1.3rem',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const valueStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1.15rem',
  minWidth: '55px',
  textAlign: 'center',
  color: '#ffffff',
  textShadow: '1px 1px 2px #000',
};

