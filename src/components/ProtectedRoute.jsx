import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContextProvider';

const ProtectedRoute = ({ children }) => {
  const firebase = useFirebase();

  if (!firebase.user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
