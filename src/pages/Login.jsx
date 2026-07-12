import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import BASEURL from "../config/baseURL";
import {
  setCachedUserData,
  getCachedUserData,
  setStoredUserData,
  clearCachedUserData,
  clearStoredUserData,
} from "../utils/auth";
import { Mail, Lock, User, Eye, EyeOff, Chrome, ArrowLeft } from "lucide-react";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Check if already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASEURL}/api/auth/me`, {
          credentials: "include", // Important: This sends the cookie
        });

        if (response.ok) {
          const data = await response.json();
          setCachedUserData(data.user);
          setStoredUserData(data.user); // Persist to localStorage
          setIsLoggedIn(true);
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, [navigate, setIsLoggedIn]);

  // Listen for OAuth messages from popup
  useEffect(() => {
    const handleOAuthMessage = async (event) => {
      // Accept messages only from our backend origin
      if (event.origin !== BASEURL) return;

      if (event.data.type === "AUTH_SUCCESS") {
        try {
          const response = await fetch(`${BASEURL}/api/auth/me`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setCachedUserData(data.user);
            setStoredUserData(data.user);
            setIsLoggedIn(true);
            navigate("/");
          } else {
            // If token invalid/expired, clear cache and redirect to login
            clearStoredUserData();
            clearCachedUserData();
            setError("Authentication failed. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching user after OAuth:", error);
          setError("Authentication failed. Please try again.");
        }
      } else if (event.data.type === "AUTH_FAILURE") {
        setError("Google login failed. Please try again.");
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [navigate, setIsLoggedIn]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(`${BASEURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Important: This allows cookies to be set and sent
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // After successful login/signup, get user data
        const meResponse = await fetch(`${BASEURL}/api/auth/me`, {
          credentials: "include",
        });

        if (meResponse.ok) {
          const userData = await meResponse.json();
          setCachedUserData(userData.user);
          setStoredUserData(userData.user); // Persist to localStorage
          setIsLoggedIn(true);
          navigate("/");
        } else {
          // If can't get user data, still consider logged in
          const userData = {
            email: formData.email,
            name: formData.name || "User",
          };
          setCachedUserData(userData);
          setStoredUserData(userData); // Persist to localStorage
          setIsLoggedIn(true);
          navigate("/");
        }
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Open Google OAuth in a popup window
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${BASEURL}/api/auth/google`,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Check if popup was blocked
    if (!popup) {
      setError("Please allow popups for this website to login with Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors z-20 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to Home</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 transform transition-all duration-500 hover:shadow-2xl">
        {/* Header with brand */}
        <div className="bg-gradient-to-r from-black to-gray-800 px-8 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"></div>
          <h1 className="text-4xl font-bold text-white tracking-tight relative z-10">
            Zenkai<span className="text-red-500">.co</span>
          </h1>
          <p className="text-gray-300 text-sm mt-2 relative z-10">
            {isLogin
              ? "Welcome back to the dojo!"
              : "Start your journey with us"}
          </p>
        </div>

        <div className="px-8 py-8">
          {/* Toggle buttons */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className={`flex-1 py-2.5 rounded-md font-semibold transition-all duration-200 ${
                isLogin
                  ? "bg-black text-white shadow-md transform scale-[1.02]"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className={`flex-1 py-2.5 rounded-md font-semibold transition-all duration-200 ${
                !isLogin
                  ? "bg-black text-white shadow-md transform scale-[1.02]"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                />
              </div>
            )}

            <div className="relative group">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-600 transition-colors hover:underline"
                  onClick={() => alert("Password reset feature coming soon!")}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isLogin ? "Logging in..." : "Creating account..."}
                    </span>
                  </div>
                ) : (
                  <span>{isLogin ? "Login" : "Create Account"}</span>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button - Production Level */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Chrome
              size={20}
              className="text-gray-600 group-hover:scale-110 transition-transform duration-200 relative z-10"
            />
            <span className="text-gray-700 font-medium relative z-10">
              Continue with Google
            </span>
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="text-black hover:underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-black hover:underline font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
