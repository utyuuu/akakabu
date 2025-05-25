import { Navigate } from "react-router-dom";
import useAuth from "./../hooks/useAuth";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, load } = useAuth();

  if (load) return <div>読み込み中</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
