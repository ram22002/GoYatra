
import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react';

import Navbar from "./components/Other/Navbar";
import Hero from "./Pages/Hero";
import { useTheme } from "./components/context/ThemeContext";
import EnhancedTravelForm from "./Pages/TravelForm";
import TripPlanDisplay from "./Pages/TripPlanDisplay";
import Chat from "./Pages/Chat";

const App = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUserToDb = async () => {
      if (user) {
        try {
          const token = await getToken();
          const response = await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.primaryEmailAddress.emailAddress,
              username: user.username,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync user');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUserToDb();
  }, [user, getToken]);

  return (
    <div data-theme={theme} className="w-screen h-screen overflow-x-hidden">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <SignedIn>
              <Navigate to="/travel-preferences" />
            </SignedIn>
            <SignedOut>
              <Hero />
            </SignedOut>
          </>
        } />
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
