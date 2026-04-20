import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);