import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../utils/auth";

const RedirectIfAdmin = ({ children }) => {
  if (isAdminLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default RedirectIfAdmin;
