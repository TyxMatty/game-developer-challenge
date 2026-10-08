import { useState } from 'react';
import { useMatchHistory, useFlushPendingMatches } from '../api/queries';
import { getPendingMatches } from '../api/client';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface MatchHistoryProps {
  onBack: () => void;
}

export default function MatchHistory({ onBack }: MatchHistoryProps) {
  const [page, setPage] = useState<number>(1);
  const pending = getPendingMatches();
  const dialogRef = useDialogFocus<HTMLDivElement>({ onEscape: onBack });

  const { data, isLoading, isError, error, refetch, isFetching } = useMatchHistory({
    page,
    limit: 5,
    playerId: 'player_me',
  });

  const { mutate: flushPending, isPending: isSyncing } = useFlushPendingMatches();

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'victory':
        return <span style={{ color: '#4caf50', fontWeight: 'bold' }}>⭐ Victory</span>;
      case 'time_out':
        return <span style={{ color: '#ffb74d', fontWeight: 'bold' }}>⌛ Time Out</span>;
      case 'defeat':
      default:
        return <span style={{ color: '#ef5350', fontWeight: 'bold' }}>💀 Defeat</span>;
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      tabIndex={-1}
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
          width: 600,
          height: 520,
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundImage: 'url(/assets/png/default/ui/menu/panel_menu.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '52px 64px 44px',
          boxSizing: 'border-box',
          color: '#ffffff',
        }}
      >
        <h2
          id="history-title"
          style={{
            margin: '0 0 10px 0',
            color: '#ffdf7e',
            fontSize: '1.8rem',
            textShadow: '3px 3px 5px #000',
            fontWeight: 900,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          📜 Battle Log
        </h2>

        {/* Offline / Pending Matches Status Alert */}
        {pending.length > 0 && (
          <div
            role="status"
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 152, 0, 0.25)',
              border: '1px solid #ff9800',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <span>
              ⚠️ <strong>{pending.length}</strong> unsynced match(es) pending upload.
            </span>
            <button
              type="button"
              onClick={() => flushPending()}
              disabled={isSyncing}
              style={{
                backgroundColor: '#e65100',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isSyncing ? 'Syncing...' : 'Retry Upload'}
            </button>
          </div>
        )}

        {/* Content Section */}
        <div style={{ flex: 1, width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'auto' }}>
          {isLoading ? (
            <div role="status" style={{ textAlign: 'center', color: '#ffdf7e', fontSize: '1.2rem', padding: 20 }}>
              Loading match logs...
            </div>
          ) : isError ? (
            <div role="alert" style={{ textAlign: 'center', padding: 16 }}>
              <p style={{ color: '#ff6b6b' }}>Failed to load match history: {(error as Error)?.message || 'Network error'}</p>
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#c62828',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Retry
              </button>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#cfd8dc', padding: 24 }}>
              <p>No completed battles on record yet, Captain.</p>
              <p style={{ fontSize: '0.85rem', color: '#90a4ae' }}>
                Fight an enemy fleet to the end to record your voyage!
              </p>
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
                backgroundColor: 'rgba(0,0,0,0.45)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'rgba(40, 25, 15, 0.9)', color: '#ffdf7e', borderBottom: '2px solid #5d4037' }}>
                  <th scope="col" style={thStyle}>Date</th>
                  <th scope="col" style={thStyle}>Result</th>
                  <th scope="col" style={thStyle}>Score</th>
                  <th scope="col" style={thStyle}>Duration</th>
                  <th scope="col" style={thStyle}>Config</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((m) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <td style={tdStyle}>
                      {new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={tdStyle}>{getReasonBadge(m.reason)}</td>
                    <td style={{ ...tdStyle, color: '#ffdf7e', fontWeight: 'bold' }}>{m.score}</td>
                    <td style={tdStyle}>{m.duration}s</td>
                    <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#b0bec5' }}>
                      {m.config?.sessionTime}s / {m.config?.spawnInterval}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 12,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              style={paginationBtnStyle}
            >
              ◀ Prev
            </button>
            <span>
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages || isFetching}
              style={paginationBtnStyle}
            >
              Next ▶
            </button>
          </div>
        )}

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            marginTop: 12,
            position: 'relative',
            width: 180,
            height: 44,
            background: 'url(/assets/png/default/ui/menu/button_primary_normal.png) no-repeat center / contain',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            textShadow: '2px 2px 3px #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
};

const paginationBtnStyle: React.CSSProperties = {
  backgroundColor: '#4e342e',
  border: '1px solid #8d6e63',
  color: '#ffffff',
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
};

