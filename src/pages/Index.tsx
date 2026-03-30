import React from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to reader page which handles auth state
  return <Navigate to="/reader" replace />;
};

export default Index;
