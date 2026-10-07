import { useEffect, useRef } from 'react';

interface MainMenuProps {
  onPlay: () => void;
  onOptions: () => void;
  onRanking: () => void;
  onHistory: () => void;
}

export default function MainMenu({ onPlay, onOptions, onRanking, onHistory }: MainMenuProps) {
  const playBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playBtnRef.current?.focus();
  }, []);

  return (
    <main
      role="main"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 20,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      {/* Title Banner */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <img
          src="/assets/png/default/ui/menu/title_pirate_battle.png"
          alt="Pirate Battle"
          style={{
            maxWidth: '90vw',
            width: 384,
            height: 'auto',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.8))',
          }}
        />
      </div>

      {/* Menu Panel */}
      <div
        style={{
          position: 'relative',
          width: 384,
          maxWidth: '92vw',
          backgroundImage: 'url(/assets/png/default/ui/menu/panel_menu.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '44px 24px 38px',
          boxSizing: 'border-box',
          gap: '14px',
          filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.7))',
        }}
      >
        {/* Play Button */}
        <MenuButton
          ref={playBtnRef}
          onClick={onPlay}
          variant="primary"
          ariaLabel="Start Battle"
        >
          ⚔ Play!
        </MenuButton>

        {/* Options Button */}
        <MenuButton
          onClick={onOptions}
          variant="secondary"
          ariaLabel="Game Options"
        >
          ⚙ Options
        </MenuButton>

        {/* Ranking Button */}
        <MenuButton
          onClick={onRanking}
          variant="secondary"
          ariaLabel="Ranking Hall of Fame"
        >
          🏆 Ranking
        </MenuButton>

        {/* Match History Button */}
        <MenuButton
          onClick={onHistory}
          variant="secondary"
          ariaLabel="Match History"
        >
          📜 History
        </MenuButton>
      </div>

      {/* Footer Info */}
      <footer
        style={{
          marginTop: 20,
          color: '#000000',
          fontSize: '0.85rem',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        <span>Controls: W/A/S/D or Arrows to Steer &middot; Space to Fire Bow &middot; Q/E for Broadsides</span>
      </footer>
    </main>
  );
}

function MenuButton({
  children,
  onClick,
  variant,
  ariaLabel,
  ref,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary';
  ariaLabel: string;
  ref?: React.RefObject<HTMLButtonElement | null>;
}) {
  const bg =
    variant === 'primary'
      ? '/assets/png/default/ui/menu/button_primary_normal.png'
      : '/assets/png/default/ui/menu/button_secondary_normal.png';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        width: 256,
        maxWidth: '100%',
        height: 64,
        background: `url(${bg}) no-repeat center / contain`,
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
}

