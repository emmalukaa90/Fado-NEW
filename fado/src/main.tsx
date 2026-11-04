import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import { App } from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary label="Gra" visible>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

requestAnimationFrame(() => document.getElementById('splash')?.remove());
