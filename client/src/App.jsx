
import  { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { dark } from "@clerk/themes";

import Navbar from "./components/Other/Navbar";
import Hero from "./Pages/Hero";
import { useTheme } from "./components/context/ThemeContext";
import EnhancedTravelForm from "./Pages/TravelForm";
import TripPlanDisplay from "./Pages/TripPlanDisplay";
import Chat from "./Pages/Chat";
import useAxios from "./components/Axios/axios";

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
        <Route
          path="/sign-in/*"
          element={
            <div className="flex justify-center items-center h-screen">
              <SignIn
                routing="path"
                path="/sign-in"
                appearance={{
                  baseTheme: theme === "dark" ? dark : undefined,
                  variables: {
                    colorPrimary: '#6C47FF',
                    colorText: theme === "dark" ? '#ffffff' : '#000000',
                    colorBackground: theme === "dark" ? '#1d232a' : '#ffffff',
                    colorInputBackground: theme === "dark" ? '#2a323c' : '#f9fafb',
                    colorInputText: theme === "dark" ? '#ffffff' : '#000000'
                  },
                }}
              />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="flex justify-center items-center h-screen">
              <SignUp
                routing="path"
                path="/sign-up"
                appearance={{
                  baseTheme: theme === "dark" ? dark : undefined,
                  variables: {
                    colorPrimary: '#6C47FF',
                    colorText: theme === "dark" ? '#ffffff' : '#000000',
                    colorBackground: theme === "dark" ? '#1d232a' : '#ffffff',
                    colorInputBackground: theme === "dark" ? '#2a323c' : '#f9fafb',
                    colorInputText: theme === "dark" ? '#ffffff' : '#000000'
                  },
                }}
              />
            </div>
          }
        />

        <Route
          path="/travel-preferences"
          element={
            <>
              <SignedIn>
                <EnhancedTravelForm />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/chat"
          element={<Chat />}
        />
        <Route
          path="/trip-display/:tripId"
          element={
            <>
              <SignedIn>
                <TripPlanDisplay />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
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
