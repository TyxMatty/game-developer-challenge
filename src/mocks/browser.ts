import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function enableMocking() { // Function to enable API mocking using MSW
  return worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
