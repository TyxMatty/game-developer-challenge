import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { enableMocking } from './mocks/browser';

async function bootstrap() {
  try {
    await enableMocking();
  } catch (e) {
    console.warn('MSW mock worker init warning (continuing normally):', e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
