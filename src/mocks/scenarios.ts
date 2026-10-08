export type MockScenario = 
  | 'success'
  | 'empty_lists'
  | 'slow_variable'
  | 'out_of_order'
  | 'error_500'
  | 'error_400'
  | 'error_ranking_only'
  | 'error_history_only'
  | 'network_error'
  | 'timeout_match_post';

const SCENARIO_STORAGE_KEY = 'pirate_mock_scenario';

export function getScenario(): MockScenario {
  try {
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (raw) {
      return raw as MockScenario;
    }
  } catch (e) {
    console.warn('Failed to read mock scenario', e);
  }
  return 'success';
}

export function setScenario(scenario: MockScenario) {
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, scenario);
    // Reload to apply new service worker rules immediately (optional but helps ensure clear state)
    // Actually, MSW evaluates per request, so no reload is strictly necessary.
  } catch (e) {
    console.warn('Failed to set mock scenario', e);
  }
}

export function resetScenarioState() {
  setScenario('success');
  localStorage.removeItem('pirate_matches_db');
  localStorage.removeItem('pirate_last_completed_match');
  localStorage.removeItem('pirate_pending_matches_queue');
}

