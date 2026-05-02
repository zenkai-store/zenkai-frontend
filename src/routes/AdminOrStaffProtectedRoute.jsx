// src/routes/AdminOrStaffProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import Admin from "../pages/Admin";
import Staff from "../pages/Staff";

const AdminOrStaffProtectedRoute = () => {
  const adminToken = localStorage.getItem("mm_admin_token");
  const staffToken = localStorage.getItem("mm_staff_token");

  if (!adminToken && !staffToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminToken) {
    return <Admin />;
  }

  if (staffToken) {
    return <Staff />;
  }

  return <Navigate to="/login" replace />;
};

export default AdminOrStaffProtectedRoute;
