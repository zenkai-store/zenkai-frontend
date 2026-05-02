import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import BASEURL from "../config/baseURL";

const AdminLogin = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const ADMIN_LOGIN_URL = `${BASEURL}/api/admin/login`;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // 🔥 REQUIRED

      if (response.ok) {
        localStorage.setItem("adminLoggedIn", "true");

        if (data.admin) {
          localStorage.setItem("adminData", JSON.stringify(data.admin));
        }

        window.location.href = "/admin";
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-white font-lufga">
      {/* LEFT PANEL - Branding Section with HomePage aesthetic */}
      <aside className="hidden md:flex md:w-1/2 lg:w-1/2 flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <img
            src={Logo}
            alt="Zenkai.co Logo"
            className="w-[350px] h-auto object-contain mx-auto"
          />
          <div className="w-24 h-1 bg-red-500 mx-auto mt-8 rounded-full"></div>
          <h2 className="mt-8 text-white font-extrabold text-[96px] leading-[1] tracking-tighter">
            Admin
          </h2>
          <p className="mt-4 text-gray-300 text-lg text-center max-w-md">
            Platform Management Portal
          </p>
        </div>
      </aside>

      {/* RIGHT PANEL - Login Form */}
      <main className="flex-1 w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-lg w-full">
          {/* Go Back Button - HomePage style */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-sm text-gray-600 hover:text-black mb-10 transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 group-hover:border-gray-900 transition-colors">
              <svg
                className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            Go Back
          </button>

          {/* Title Section - Clean white/black theme */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-red-500 rounded"></div>
              <h1 className="text-3xl font-bold text-black tracking-tight">
                Admin Login
              </h1>
            </div>
            <p className="text-gray-600">
              Secure access to the Zenkai administration dashboard
            </p>
          </header>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleAdminLogin}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="admin@zenkai.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
                {errorMsg}
              </div>
            )}

            {/* Login Button - Black/Red theme from HomePage */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-black text-white font-semibold text-base hover:bg-gray-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Admin Login"
              )}
            </button>
          </form>

          {/* Footer Message */}
          <p className="mt-8 text-sm text-gray-600 text-center">
            Forgot your password?{" "}
            <button className="font-medium text-black hover:text-gray-700 hover:underline">
              Contact System Administrator
            </button>
          </p>
        </div>
      </main>

      {/* MOBILE VIEW - Branding Section (visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 text-center py-8 bg-black">
        <img src={Logo} className="w-48 mx-auto mb-4" alt="Zenkai.co" />
        <div className="w-16 h-0.5 bg-red-500 mx-auto mb-4 rounded-full"></div>
        <h2 className="text-white font-extrabold text-3xl">Admin Portal</h2>
      </div>
    </div>
  );
};

export default AdminLogin;
