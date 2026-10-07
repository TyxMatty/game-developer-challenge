import { useEffect, useRef } from 'react';
import { type MatchRecord } from '../types/match';
import { useRecordMatch } from '../api/queries';

interface ResultsModalProps {
  matchResult: MatchRecord;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export default function ResultsModal({ matchResult, onPlayAgain, onMainMenu }: ResultsModalProps) {
  const { mutate: recordMatch, isPending, isSuccess, isError, error } = useRecordMatch();
  const hasSubmittedRef = useRef(false);
  const playAgainBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playAgainBtnRef.current?.focus();

    // Submit once upon opening modal
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      recordMatch(matchResult);
    }
  }, [matchResult, recordMatch]);

  const isVictory = matchResult.reason === 'victory';
  const isTimeOut = matchResult.reason === 'time_out';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(3px)',
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
          width: 420,
          maxWidth: '95vw',
          backgroundImage: 'url(/assets/png/default/ui/menu/panel_menu.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 32px 36px',
          boxSizing: 'border-box',
          color: '#ffffff',
          gap: 16,
        }}
      >
        <h2
          id="results-title"
          style={{
            margin: 0,
            fontSize: '2.4rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: isVictory ? '#ffd54f' : isTimeOut ? '#81d4fa' : '#ef5350',
            textShadow: '3px 3px 6px #000',
            textAlign: 'center',
          }}
        >
          {isVictory ? 'Victory!' : isTimeOut ? 'Time Expired!' : 'Ship Sunk!'}
        </h2>

        {/* Score & Duration Overview */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid #6d4c41',
            borderRadius: 8,
            width: '100%',
            padding: '14px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
            <span style={{ color: '#ffecb3', fontWeight: 600 }}>Final Score:</span>
            <span style={{ color: '#ffd54f', fontWeight: 900 }}>{matchResult.score}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
            <span style={{ color: '#d7ccc8' }}>Combat Duration:</span>
            <span style={{ fontWeight: 700 }}>{matchResult.duration}s</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#b0bec5' }}>
            <span>Config:</span>
            <span>{matchResult.config.sessionTime}s limit / {matchResult.config.spawnInterval}s spawn</span>
          </div>
        </div>

        {/* API Recording Feedback */}
        <div style={{ minHeight: '1.4rem', fontSize: '0.82rem', textAlign: 'center' }}>
          {isPending && <span style={{ color: '#ffecb3' }}>Recording combat log to server...</span>}
          {isSuccess && <span style={{ color: '#81c784' }}>✓ Recorded in Hall of Fame & Battle Log!</span>}
          {isError && (
            <div style={{ color: '#e57373' }}>
              <span>⚠️ Could not upload ({ (error as Error)?.message || 'offline' }). Saved locally!</span>
              <button
                type="button"
                onClick={() => recordMatch(matchResult)}
                style={{
                  marginLeft: 8,
                  background: 'none',
                  border: 'none',
                  color: '#ffeb3b',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', alignItems: 'center' }}>
          <button
            ref={playAgainBtnRef}
            type="button"
            onClick={onPlayAgain}
            style={{
              position: 'relative',
              width: 256,
              height: 60,
              background: 'url(/assets/png/default/ui/menu/button_primary_normal.png) no-repeat center / contain',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              textShadow: '2px 2px 3px #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚔ Play Again
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            style={{
              position: 'relative',
              width: 256,
              height: 60,
              background: 'url(/assets/png/default/ui/menu/button_secondary_normal.png) no-repeat center / contain',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.15rem',
              textShadow: '2px 2px 3px #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

