import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';

import Navbar from "./components/Other/Navbar";
import Hero from "./Pages/Hero";
import { useTheme } from "./components/context/ThemeContext";
import EnhancedTravelForm from "./Pages/TravelForm";
import TripPlanDisplay from "./Pages/TripPlanDisplay";
import Chat from "./Pages/Chat";
import useAxios from "./components/Axios/axios";
import SignInPage from "./Pages/SignInPage";
import SignUpPage from "./Pages/SignUpPage";

const App = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const axiosInstance = useAxios();

  useEffect(() => {
    const syncUserToDb = async () => {
      if (user) {
        try {
          const response = await axiosInstance.post('/user/sync', {
            userId: user.id,
            email: user.primaryEmailAddress.emailAddress,
            username: user.username,
          });

          if (response.status !== 200 && response.status !== 201) {
            console.error('Failed to sync user');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUserToDb();
  }, [user, axiosInstance]);

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
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

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
