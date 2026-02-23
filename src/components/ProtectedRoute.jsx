import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { role } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // If not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role not allowed
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;