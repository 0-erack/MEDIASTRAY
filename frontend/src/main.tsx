import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, HashRouter } from 'react-router-dom';

const rootElement = document.getElementById('root')!; 
const root = createRoot(rootElement);

const isElectron = navigator.userAgent.toLowerCase().includes('electron');

const Router = isElectron ? HashRouter : BrowserRouter;

root.render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);