
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Context from "./components/context/Context.jsx";
import TripContext from "./components/context/TripContext.jsx";
import ThemeProvider from "./components/context/ThemeContext.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <Context>
          <TripContext>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TripContext>
        </Context>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>
);
