import BASEURL from "../../config/baseURL";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import { getStoredUserData, getAuthHeader } from "../../utils/auth";

import Logo from "../../assets/logo.png";

import {
  User,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  LogOut,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const storedData = getStoredUserData();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    () => !!storedData && storedData?.role !== "admin"
  );
  const [userName, setUserName] = useState(
    () => (storedData?.role !== "admin" ? storedData?.name || "User" : "")
  );

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ======================= FETCH PROFILE =======================
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(`/api/user/profile`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setEditName(response.data.data.name || "");
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isUserLoggedIn]);

  // ======================= UPDATE PROFILE =======================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showNotification("Name cannot be empty.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosClient.put(
        `/api/user/profile`,
        { name: editName.trim() },
        { withCredentials: true },
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setUserName(response.data.data.name);
        showNotification("Profile updated successfully!", "success");
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showNotification(
        err.response?.data?.message || "Failed to update profile.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================= LOGOUT =======================
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASEURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeader(),
      });

      if (response.ok) {
        setIsUserLoggedIn(false);
        setUserName("");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsUserLoggedIn(false);
      setUserName("");
      navigate("/");
    }
  };

  // ======================= HELPERS =======================
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================= COMPONENTS =======================
  const Notification = () => {
    if (!notification) return null;
    return (
      <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
        <div
          className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-900 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      </div>
    );
  };

  const SkeletonRow = () => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 animate-pulse">
      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  // ======================= NOT LOGGED IN =======================
  if (!isUserLoggedIn) {
    return (
      <div className="w-full min-h-screen bg-white font-lufga">
        <Notification />

        {/* Top Header */}
        <div className="bg-black text-white text-sm py-2 px-6 flex justify-center items-center">
          <div className="flex items-center gap-2 justify-center text-center">
            <span>
              Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
            </span>
            <button
              onClick={() => navigate("/products")}
              className="underline font-semibold ml-2 hover:text-gray-300"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Navbar */}
        <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-black border-b border-gray-800 sticky top-0 z-40">
          <img
            src={Logo}
            alt="Zenkai.co"
            className="w-20 md:w-24 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-600 transition text-sm flex items-center gap-2"
          >
            <User size={16} />
            Login
          </button>
        </nav>

        <div className="flex items-center justify-center py-32 px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Login Required
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Please login to view and manage your profile.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* Top Header */}
      <div className="bg-black text-white text-sm py-2 px-6 flex justify-center items-center">
        <div className="flex items-center gap-2 justify-center text-center">
          <span>
            Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
          </span>
          <button
            onClick={() => navigate("/products")}
            className="underline font-semibold ml-2 hover:text-gray-300"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* ======================= PROFILE HEADER ======================= */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate("/")}
              className="hover:text-red-500 transition"
            >
              Home
            </button>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">My Profile</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition mb-3 group"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-8 h-8 text-red-500" />
                My Profile
              </h1>
              <p className="text-gray-500 mt-2">Manage your account details</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfile}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition active:scale-95"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 active:scale-95"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= PROFILE CONTENT ======================= */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-500 mb-8">{error}</p>
              <button
                onClick={fetchProfile}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.name}
                  </h2>
                  <p className="text-gray-500">{profile.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">
                      Email
                    </p>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">
                      Role
                    </p>
                    <p className="text-gray-900 capitalize">
                      {profile.role || "User"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">
                      Member Since
                    </p>
                    <p className="text-gray-900">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================= EDIT PROFILE MODAL ======================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 -mb-6 rounded-b-2xl flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition font-medium shadow-lg shadow-red-500/25"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
