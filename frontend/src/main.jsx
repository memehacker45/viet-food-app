import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { initNative } from './capacitor.js';

// Native-Setup (StatusBar, SplashScreen) – nur auf echtem Geraet aktiv.
initNative();

// HashRouter: zuverlaessig in der Capacitor-WebView (kein Server-Fallback noetig).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </React.StrictMode>
);
