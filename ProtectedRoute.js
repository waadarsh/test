import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, user, ...rest }) => {
  const location = useLocation();

  return user ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
