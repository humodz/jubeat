import React from 'react';
import ReactDOM from 'react-dom/client';
import 'simpledotcss';
import { App } from './App';
import './index.css';
import './simpledotcss-tweaks.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
