// Runs the Playwright suite against the production preview build (cross-platform, no extra dependency).
import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, E2E_TARGET: 'preview' },
});
process.exit(result.status ?? 1);
