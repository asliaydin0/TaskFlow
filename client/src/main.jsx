import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import QueryProvider from './providers/QueryProvider.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
