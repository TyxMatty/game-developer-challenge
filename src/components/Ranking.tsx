import { useState } from 'react';
import { useRanking } from '../api/queries';
import { loadLocalConfig } from '../config/GameConfig';

interface RankingProps {
  onBack: () => void;
}

export default function Ranking({ onBack }: RankingProps) {
  const currentConfig = loadLocalConfig();
  const [page, setPage] = useState<number>(1);
  const [sessionTime, setSessionTime] = useState<number>(currentConfig.sessionTime);
  const [spawnInterval, setSpawnInterval] = useState<number>(currentConfig.spawnInterval);

  const { data, isLoading, isError, error, refetch, isFetching } = useRanking({
    page,
    limit: 5,
    sessionTime,
    spawnInterval,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ranking-title"
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
          id="ranking-title"
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
          🏆 Hall of Fame
        </h2>

        {/* Configuration Filter Indicator */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: 12,
            border: '1px solid #795548',
            flexShrink: 0,
          }}
        >
          <span>
            Config: <strong>{sessionTime}s</strong> time / <strong>{spawnInterval.toFixed(1)}s</strong> spawn
          </span>
          <button
            type="button"
            onClick={() => {
              const fresh = loadLocalConfig();
              setSessionTime(fresh.sessionTime);
              setSpawnInterval(fresh.spawnInterval);
              setPage(1);
            }}
            style={{
              background: '#3e2723',
              border: '1px solid #a1887f',
              color: '#ffecb3',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Sync with Options
          </button>
        </div>

        {/* Status: Loading / Error / Empty / Data Table */}
        <div style={{ flex: 1, width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'auto' }}>
          {isLoading ? (
            <div role="status" style={{ textAlign: 'center', color: '#ffdf7e', fontSize: '1.2rem', padding: 20 }}>
              Loading leaderboard rankings...
            </div>
          ) : isError ? (
            <div role="alert" style={{ textAlign: 'center', padding: 16 }}>
              <p style={{ color: '#ff6b6b' }}>Failed to load rankings: {(error as Error)?.message || 'Network error'}</p>
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
                Retry Request
              </button>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#cfd8dc', padding: 24 }}>
              <p>No matches recorded yet for this configuration.</p>
              <p style={{ fontSize: '0.85rem', color: '#90a4ae' }}>
                Complete a battle to see your score on the leaderboard!
              </p>
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(0,0,0,0.45)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'rgba(40, 25, 15, 0.9)', color: '#ffdf7e', borderBottom: '2px solid #5d4037' }}>
                  <th scope="col" style={thStyle}>#</th>
                  <th scope="col" style={thStyle}>Captain</th>
                  <th scope="col" style={thStyle}>Score</th>
                  <th scope="col" style={thStyle}>Duration</th>
                  <th scope="col" style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((entry) => {
                  const isPlayer = entry.playerId === 'player_me';
                  return (
                    <tr
                      key={entry.id}
                      style={{
                        backgroundColor: isPlayer ? 'rgba(76, 175, 80, 0.25)' : 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <td style={tdStyle}>
                        <strong>{entry.rank}</strong>
                      </td>
                      <td style={tdStyle}>
                        {isPlayer ? <strong>⭐ {entry.playerName} (You)</strong> : entry.playerName}
                      </td>
                      <td style={{ ...tdStyle, color: '#ffdf7e', fontWeight: 'bold' }}>
                        {entry.score}
                      </td>
                      <td style={tdStyle}>{entry.duration}s</td>
                      <td style={{ ...tdStyle, fontSize: '0.75rem', color: '#b0bec5' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
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

