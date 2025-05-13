import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContextProvider';

// GuestRoute is the opposite of ProtectedRoute
// It redirects authenticated users to the home page
// Only non-authenticated users can access these routes
const GuestRoute = ({ children }) => {
  const firebase = useFirebase();

  // If user is already logged in, redirect to home
  if (firebase.user) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the requested page (login/signup)
  return children;
};

export default GuestRoute; 