import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker if supported
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

// Ativando o Armazenamento Persistente Seguro no Navegador do Cliente
if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((isPersistent) => {
    if (isPersistent) {
      console.log("🔒 [NutrinK] Proteção Ativa: O navegador prometeu NUNCA apagar os dados do app automaticamente.");
    } else {
      console.log("⚠️ [NutrinK] O navegador recusou a persistência automática de dados.");
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

