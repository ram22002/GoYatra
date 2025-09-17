import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import App from './App';
import './index.css';
import ThemeProvider, { useTheme } from './components/context/ThemeContext';
import PlanProvider from './components/context/PlanContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// A new component that wraps the ClerkProvider and passes the theme
const ClerkProviderWithTheme = ({ children }) => {
  const { theme } = useTheme();

  // Define the colors for the "coffee" theme
  const coffeeThemeColors = {
    colorBackground: '#1f1624',
    colorText: '#d8d8d8',
    colorPrimary: '#DB924B',
    colorInputBackground: '#2a2031',
    colorInputText: '#d8d8d8',
  };

  const clerkAppearance = {
    baseTheme: theme === 'coffee' ? dark : undefined,
    variables: theme === 'coffee' ? coffeeThemeColors : {},
    elements: {
      userButtonPopoverFooter: {
        "display": "none"
      }
    }
  };

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkProviderWithTheme>
        <PlanProvider>
          <Router>
            <App />
          </Router>
        </PlanProvider>
      </ClerkProviderWithTheme>
    </ThemeProvider>
  </React.StrictMode>
);
