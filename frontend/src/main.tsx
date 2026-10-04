import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { CommuniqProvider } from './hooks/useCommuniq';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CommuniqProvider>
      <App />
    </CommuniqProvider>
  </StrictMode>,
);
