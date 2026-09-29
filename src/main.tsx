import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UnitProvider } from './context/UnitContext';
import './index.css';

// PWA auto-update registration
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('New content available, auto-updating...');
    },
    onOfflineReady() {
      console.log('GymLog ready for offline operation.');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <UnitProvider>
        <App />
      </UnitProvider>
    </AuthProvider>
  </React.StrictMode>
);

