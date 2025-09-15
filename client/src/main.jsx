
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import ThemeProvider from './components/context/ThemeContext';
import TripProvider from './components/context/TripContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <ThemeProvider>
          <TripProvider>
            <App />
          </TripProvider>
        </ThemeProvider>
      </Router>
    </ClerkProvider>
  </React.StrictMode>
);
