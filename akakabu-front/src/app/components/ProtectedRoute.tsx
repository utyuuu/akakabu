import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./../hooks/useAuth";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>読み込み中</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
