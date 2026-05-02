import { Navigate } from "react-router-dom";
import { isStaffLoggedIn } from "../utils/auth";

const StaffProtectedRoute = ({ children }) => {
  if (!isStaffLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default StaffProtectedRoute;
