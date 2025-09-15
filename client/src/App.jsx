import React from "react";
import { Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';

import Navbar from "./components/Other/Navbar";
import Hero from "./Pages/Hero";
import { useTheme } from "./components/context/ThemeContext";
import EnhancedTravelForm from "./Pages/TravelForm";
import TripPlanDisplay from "./Pages/TripPlanDisplay";
import Chat from "./Pages/Chat";

const App = () => {
  const { theme } = useTheme();

  return (
    <div data-theme={theme} className="w-screen h-screen overflow-x-hidden">
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route
          path="/sign-in/*"
          element={
            <div className="flex justify-center items-center h-screen">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="flex justify-center items-center h-screen">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />

        <Route
          path="/travel-preferences"
          element={
            <SignedIn>
              <EnhancedTravelForm />
            </SignedIn>
          }
        />
        <Route
          path="/chat"
          element={<Chat />}
        />
        <Route
          path="/trip-display/:tripId"
          element={
            <SignedIn>
              <TripPlanDisplay />
            </SignedIn>
          }
        />

        {/* Redirect users who are not signed in */}
        <Route
          path="/*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
