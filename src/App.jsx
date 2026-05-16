import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import Admin from "./pages/Admin";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import Expenses from "./pages/expenses/Expense";
import NewArrivals from "./pages/admin/featuredProducts/NewArrivals";
import AboutProduct from "./pages/products/AboutProduct";
import Categories from "./pages/admin/categories/Categories";
import CategoryProducts from "./pages/products/CategoryProducts";
import ListProducts from "./pages/products/ListProducts";
import ProductsList from "./pages/products/ProductList";
import Wishlist from "./pages/order/Wishlist";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";

import { CartProvider } from "./context/CartContext";

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      // Only check if we have the adminLoggedIn flag (set after login)
      const adminLoggedIn = localStorage.getItem("adminLoggedIn");

      if (adminLoggedIn === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CartProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/product/:slug" element={<AboutProduct />} />
        <Route path="/category/:slug" element={<CategoryProducts />} />
        <Route path="/products" element={<ListProducts />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cart" element={<Cart />} />

        {/* Protected Admin Routes - All wrapped in Admin Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        >
          {/* Dashboard - Index Route */}
          <Route index element={<Dashboard />} />

          <Route path="products/list" element={<ProductsList />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="expense/list" element={<Expenses />} />
          <Route path="featured/arrivals/list" element={<NewArrivals />} />
          <Route path="categories/list" element={<Categories />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="w-full h-screen flex justify-center items-center uppercase text-3xl font-bold">
              404! Page Not Found
            </div>
          }
        />
      </Routes>
    </CartProvider>
  );
}

export default App;
