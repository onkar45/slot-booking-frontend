import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { role } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to appropriate dashboard based on actual role
    if (role === 'super_admin') return <Navigate to="/super-admin" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'user') return <Navigate to="/user" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
