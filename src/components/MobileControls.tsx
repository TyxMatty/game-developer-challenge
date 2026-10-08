import { type RefObject } from 'react';
import { type Simulation } from '../game/Simulation';

interface MobileControlsProps {
  simulationRef: RefObject<Simulation | null>;
}

export default function MobileControls({ simulationRef }: MobileControlsProps) {
  const setInput = (key: keyof Simulation['input'], value: boolean) => {
    simulationRef.current?.setInput(key, value);
  };

  const bindButton = (key: keyof Simulation['input']) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointer events do not have an active pointer to capture.
      }
      setInput(key, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      setInput(key, false);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      setInput(key, false);
    },
    onLostPointerCapture: () => setInput(key, false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div
      className="mobile-touch-controls"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        userSelect: 'none',
        touchAction: 'none',
        '--control-size': '56px',
        '--control-gap': '8px',
        '--control-offset': '24px',
        '--control-icon-size': '30px',
      } as React.CSSProperties}
      aria-label="Mobile Touch Controls"
    >
      {/* Bottom Left: Navigation cluster (Steer & Thrust) */}
      <div
        className="mobile-control-cluster mobile-navigation-controls"
        style={{
          position: 'absolute',
          bottom: 'var(--control-offset)',
          left: 'var(--control-offset)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, var(--control-size))',
          gridTemplateRows: 'repeat(2, var(--control-size))',
          gap: 'var(--control-gap)',
          pointerEvents: 'auto',
        }}
      >
        {/* Forward */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_forward.png"
            label="Thrust Forward"
            {...bindButton('up')}
          />
        </div>
        {/* Turn Left */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_turn_left.png"
            label="Turn Port / Left"
            {...bindButton('left')}
          />
        </div>
        {/* Reverse / Brake */}
        <div style={{ gridColumn: 2, gridRow: 2 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_minus.png"
            label="Reverse"
            {...bindButton('down')}
          />
        </div>
        {/* Turn Right */}
        <div style={{ gridColumn: 3, gridRow: 2 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_turn_right.png"
            label="Turn Starboard / Right"
            {...bindButton('right')}
          />
        </div>
      </div>

      {/* Bottom Right: Cannons cluster (Front, Port, Starboard) */}
      <div
        className="mobile-control-cluster mobile-attack-controls"
        style={{
          position: 'absolute',
          bottom: 'var(--control-offset)',
          right: 'var(--control-offset)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, var(--control-size))',
          gridTemplateRows: 'repeat(2, var(--control-size))',
          gap: 'var(--control-gap)',
          pointerEvents: 'auto',
        }}
      >
        {/* Fire Front */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_fire_front.png"
            label="Fire Bow Cannons"
            highlight
            {...bindButton('shootFront')}
          />
        </div>
        {/* Fire Port Broadside */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_fire_left.png"
            label="Fire Port Broadside"
            {...bindButton('shootLeft')}
          />
        </div>
        {/* Fire Starboard Broadside */}
        <div style={{ gridColumn: 3, gridRow: 2 }}>
          <ControlButton
            icon="/assets/png/default/ui/controls/icon_fire_right.png"
            label="Fire Starboard Broadside"
            {...bindButton('shootRight')}
          />
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  icon,
  label,
  highlight,
  ...props
}: {
  icon: string;
  label: string;
  highlight?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{
        width: 'var(--control-size)',
        height: 'var(--control-size)',
        position: 'relative',
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        filter: highlight ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))' : undefined,
      }}
      {...props}
    >
      <img
        src="/assets/png/default/ui/controls/button_round_normal.png"
        alt=""
        style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      <img
        src={icon}
        alt=""
        style={{ width: 'var(--control-icon-size)', height: 'var(--control-icon-size)', zIndex: 1, pointerEvents: 'none' }}
      />
    </button>
  );
}

