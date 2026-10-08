import React, { useRef } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface PauseMenuProps {
  onResume: () => void;
  onOptions: () => void;
  onQuit: () => void;
  isAutoPaused?: boolean;
}

export default function PauseMenu({ onResume, onOptions, onQuit, isAutoPaused }: PauseMenuProps) {
  const resumeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>({
    initialFocusRef: resumeBtnRef,
    onEscape: onResume,
  });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      tabIndex={-1}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 384,
          minHeight: 400,
          backgroundImage: 'url(/assets/png/default/ui/menu/panel_menu.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          boxSizing: 'border-box',
          gap: '16px',
        }}
      >
        <h2
          id="pause-title"
          style={{
            margin: '0 0 8px 0',
            color: '#ffdf7e',
            fontSize: '2.2rem',
            textShadow: '3px 3px 5px #000',
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {isAutoPaused ? 'Game Paused' : 'Paused'}
        </h2>

        {isAutoPaused && (
          <p
            style={{
              margin: '0 0 8px 0',
              color: '#d6e8ff',
              fontSize: '0.95rem',
              textAlign: 'center',
              textShadow: '1px 1px 2px #000',
            }}
          >
            Tab was hidden or lost focus. Click Resume to continue fighting!
          </p>
        )}

        {/* Resume Button */}
        <MenuButton ref={resumeBtnRef} onClick={onResume} variant="primary">
          ▶ Resume    
        </MenuButton>

        {/* Options Button */}
        <MenuButton onClick={onOptions} variant="secondary">
          ⚙ Options
        </MenuButton>

        {/* Quit Match Button */}
        <MenuButton onClick={onQuit} variant="secondary">
          ✖ Give Up
        </MenuButton>
      </div>
    </div>
  );
}

const MenuButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
>(({ children, onClick, variant = 'primary' }, ref) => {
  const bgNormal =
    variant === 'primary'
      ? '/assets/png/default/ui/menu/button_primary_normal.png'
      : '/assets/png/default/ui/menu/button_secondary_normal.png';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        width: 256,
        height: 64,
        background: `url(${bgNormal}) no-repeat center / contain`,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 800,
        fontSize: '1.25rem',
        textShadow: '2px 2px 3px #000000',
        letterSpacing: '0.5px',
        transition: 'transform 0.1s ease, filter 0.1s ease',
        outlineOffset: 3,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      {children}
    </button>
  );
});

