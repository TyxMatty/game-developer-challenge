import React, { useState } from 'react'; // React import for component and hooks
import { type MockScenario, getScenario, setScenario, resetScenarioState } from '../mocks/scenarios'; 

const SCENARIOS: { value: MockScenario; label: string }[] = [ // List of available network scenarios, will be used in Network Simulator
  { value: 'success', label: 'Success (Normal)' }, 
  { value: 'empty_lists', label: 'Empty Lists (Ranking/History)' },
  { value: 'slow_variable', label: 'Slow, Reproducible Variable Latency' },
  { value: 'out_of_order', label: 'Out-of-Order Ranking/History Responses' },
  { value: 'error_500', label: '500 Internal Server Error' },
  { value: 'error_400', label: '400 Bad Request' },
  { value: 'error_ranking_only', label: 'Ranking Endpoint Failure' },
  { value: 'error_history_only', label: 'History Endpoint Failure' },
  { value: 'network_error', label: 'Network Error (Immediate)' },
  { value: 'timeout_match_post', label: 'Timeout on Match POST' },
];

export const NetworkSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<MockScenario>(() => getScenario());

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MockScenario;
    setCurrentScenario(val);
    setScenario(val);
  };

  const handleReset = () => {
    resetScenarioState();
    setCurrentScenario('success');
    window.location.reload(); // Reload to clear react-query cache and state
  };

  if (!isOpen) {
    return (
      <button 
        className="network-simulator-trigger"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#333',
          color: '#fff',
          border: '1px solid #666',
          padding: '8px 12px',
          borderRadius: '4px',
          zIndex: 9999,
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        📡 MSW DevTools
      </button>
    );
  }

  return (
    <div className="network-simulator-panel" style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#222',
      color: '#fff',
      border: '1px solid #444',
      padding: '16px',
      borderRadius: '8px',
      zIndex: 9999,
      width: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#4ade80' }}>📡 Network Simulator</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}
        >
          ✖
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="network-scenario" style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#aaa' }}>
          Select Scenario
        </label>
        <select 
          id="network-scenario"
          value={currentScenario} 
          onChange={handleChange}
          style={{ width: '100%', padding: '6px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
        >
          {SCENARIOS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px 0', lineHeight: 1.4 }}>
        Changes apply immediately to new requests. React Query will handle retries based on its config.
      </p>

      <button 
        onClick={handleReset}
        style={{
          width: '100%',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        Reset State & Reload
      </button>
    </div>
  );
};

