import { type Simulation } from '../game/Simulation';

interface MobileControlsProps {
  simulation: Simulation | null;
  onPause: () => void;
}

export default function MobileControls({ simulation, onPause }: MobileControlsProps) {
  if (!simulation) return null;

  const setInput = (key: keyof Simulation['input'], value: boolean) => {
    if (simulation && simulation.isRunning && !simulation.isPaused) {
      simulation.input[key] = value;
    }
  };

  const bindButton = (key: keyof Simulation['input']) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
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
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        userSelect: 'none',
        touchAction: 'none',
      }}
      aria-label="Mobile Touch Controls"
    >
      {/* Top Center-Right: Mobile Pause Button */}
      <button
        type="button"
        onClick={onPause}
        aria-label="Pause game"
        style={{
          position: 'absolute',
          top: 16,
          right: '50%',
          transform: 'translateX(50%)',
          width: 52,
          height: 52,
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/assets/png/default/ui/controls/button_round_normal.png"
          alt=""
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <img
          src="/assets/png/default/ui/controls/icon_pause.png"
          alt="Pause"
          style={{ width: 28, height: 28, zIndex: 1 }}
        />
      </button>

      {/* Bottom Left: Navigation cluster (Steer & Thrust) */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 56px)',
          gridTemplateRows: 'repeat(2, 56px)',
          gap: 8,
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
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 56px)',
          gridTemplateRows: 'repeat(2, 56px)',
          gap: 8,
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
        width: 56,
        height: 56,
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
        style={{ width: 30, height: 30, zIndex: 1, pointerEvents: 'none' }}
      />
    </button>
  );
}

