import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User does not have the required role
  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    if (user.role === "DONOR") {
      return <Navigate to="/my-donations" replace />;
    }

    if (user.role === "NGO") {
      return <Navigate to="/donations" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;