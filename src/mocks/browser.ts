import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function enableMocking() { // Function to enable API mocking using MSW
  return worker.start({
    onUnhandledRequest: 'bypass', // Non-API requests (e.g. hosting tooling) pass through without console warnings
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
