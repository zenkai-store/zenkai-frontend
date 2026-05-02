import { Navigate } from "react-router-dom";
import { isStaffLoggedIn } from "../utils/auth";

const RedirectIfStaff = ({ children }) => {
  console.log("Checking staff redirect:", isStaffLoggedIn());
  if (isStaffLoggedIn()) {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return children;
};

export default RedirectIfStaff;
