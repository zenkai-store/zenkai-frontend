import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import {
  getStoredUserData,
  getUserData,
  clearStoredUserData,
  clearCachedUserData,
} from "../../utils/auth";

import Logo from "../../assets/logo.png";

import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  Building,
  Map,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Loader,
  Star,
  Navigation,
} from "lucide-react";

// Leaflet imports for map
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon (Leaflet bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Address = () => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Auth
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    addressType: "home",
    isDefault: false,
    latitude: "",
    longitude: "",
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    addressType: "home",
    isDefault: false,
    latitude: "",
    longitude: "",
  });

  // Action states
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  // ======================= CHECK USER AUTH =======================
  useEffect(() => {
    const checkUserAuth = () => {
      const storedData = getStoredUserData();
      const userData = getUserData();

      if (
        (storedData || userData) &&
        storedData?.role !== "admin" &&
        userData?.role !== "admin" &&
        userData?.user?.role !== "admin"
      ) {
        setIsUserLoggedIn(true);
        setUserName(
          storedData?.name || userData?.name || userData?.user?.name || "User",
        );
      } else {
        setIsUserLoggedIn(false);
        setUserName("");
      }
    };
    checkUserAuth();
  }, []);

  // ======================= FETCH ADDRESSES =======================
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${BASEURL}/api/address`, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Sort: default first, then by createdAt desc
        const sorted = response.data.data.sort((a, b) => {
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setAddresses(sorted);
        setTotalItems(sorted.length);
        setTotalPages(1); // pagination not provided by API, we'll just show all
      } else {
        setError("Failed to load addresses");
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      if (err.response?.status === 401) {
        clearStoredUserData();
        clearCachedUserData();
        setIsUserLoggedIn(false);
        setUserName("");
        setError("Your session has expired. Please login again.");
      } else {
        setError(err.response?.data?.message || "Failed to load addresses");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isUserLoggedIn]);

  // ======================= GEOCODING =======================
  const handleGeocode = async () => {
    const {
      addressLine1,
      addressLine2,
      landmark,
      city,
      district,
      state,
      pincode,
    } = formData;
    const query =
      `${addressLine1}, ${addressLine2}, ${landmark}, ${city}, ${district}, ${state}, ${pincode}`.trim();

    if (!query) {
      showNotification(
        "Please fill in at least address line 1, city, and state.",
        "error",
      );
      return;
    }

    try {
      setGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        }));
        showNotification("Location found! Coordinates updated.", "success");
      } else {
        showNotification(
          "Could not find location. Please check your address.",
          "error",
        );
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      showNotification(
        "Geocoding failed. Please enter coordinates manually.",
        "error",
      );
    } finally {
      setGeocoding(false);
    }
  };

  // ======================= ADDRESS CRUD =======================
  const handleAddAddress = async (e) => {
    e.preventDefault();
    // Basic validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      showNotification(
        "Please fill in all required fields (Name, Phone, Address Line 1, City, State, Pincode).",
        "error",
      );
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      showNotification("Please fetch location coordinates first.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone.toString(),
        pincode: formData.pincode.toString(),
      };

      const response = await axios.post(`${BASEURL}/api/address`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        showNotification("Address added successfully!", "success");
        setShowAddModal(false);
        resetForm();
        fetchAddresses();
      }
    } catch (err) {
      console.error("Add address error:", err);
      showNotification(
        err.response?.data?.message || "Failed to add address.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!editingAddress) return;

    try {
      setSubmitting(true);
      const payload = {
        ...editFormData,
        latitude: parseFloat(editFormData.latitude),
        longitude: parseFloat(editFormData.longitude),
        phone: editFormData.phone.toString(),
        pincode: editFormData.pincode.toString(),
      };

      const response = await axios.patch(
        `${BASEURL}/api/address/${editingAddress._id}`,
        payload,
        { withCredentials: true },
      );

      if (response.data.success) {
        showNotification("Address updated successfully!", "success");
        setShowEditModal(false);
        setEditingAddress(null);
        fetchAddresses();
      }
    } catch (err) {
      console.error("Update address error:", err);
      showNotification(
        err.response?.data?.message || "Failed to update address.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      setDeletingId(id);
      const response = await axios.delete(`${BASEURL}/api/address/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        showNotification("Address deleted successfully!", "success");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Delete address error:", err);
      showNotification(
        err.response?.data?.message || "Failed to delete address.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await axios.patch(
        `${BASEURL}/api/address/${id}/default`,
        {},
        { withCredentials: true },
      );

      if (response.data.success) {
        showNotification("Default address updated!", "success");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Set default error:", err);
      showNotification(
        err.response?.data?.message || "Failed to set default.",
        "error",
      );
    }
  };

  // ======================= HELPERS =======================
  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      addressType: "home",
      isDefault: false,
      latitude: "",
      longitude: "",
    });
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setEditFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      district: address.district || "",
      state: address.state || "",
      pincode: address.pincode || "",
      addressType: address.addressType || "home",
      isDefault: address.isDefault || false,
      latitude: address.latitude || "",
      longitude: address.longitude || "",
    });
    setShowEditModal(true);
  };

  const handleEditGeocode = async () => {
    const {
      addressLine1,
      addressLine2,
      landmark,
      city,
      district,
      state,
      pincode,
    } = editFormData;
    const query =
      `${addressLine1}, ${addressLine2}, ${landmark}, ${city}, ${district}, ${state}, ${pincode}`.trim();

    if (!query) {
      showNotification(
        "Please fill in at least address line 1, city, and state.",
        "error",
      );
      return;
    }

    try {
      setGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setEditFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        }));
        showNotification("Location found! Coordinates updated.", "success");
      } else {
        showNotification(
          "Could not find location. Please check your address.",
          "error",
        );
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      showNotification(
        "Geocoding failed. Please enter coordinates manually.",
        "error",
      );
    } finally {
      setGeocoding(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  const AddressCard = ({ address }) => {
    const isDefault = address.isDefault;
    const isDeleting = deletingId === address._id;

    return (
      <div
        onClick={() => {
          setSelectedAddress(address);
          setShowDetailModal(true);
        }}
        className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      >
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500">
                {address.addressType === "home" ? (
                  <Home size={18} />
                ) : address.addressType === "work" ? (
                  <Building size={18} />
                ) : (
                  <MapPin size={18} />
                )}
              </span>
              <span className="font-medium text-gray-900 capitalize">
                {address.addressType}
              </span>
              {isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  <Star size={12} fill="currentColor" />
                  Default
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 truncate">
              {address.fullName}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {address.addressLine1}, {address.city}, {address.state} -{" "}
              {address.pincode}
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Phone size={12} />
              {address.phone}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSetDefault(address._id);
              }}
              className={`p-2 rounded-full border transition ${
                isDefault
                  ? "bg-yellow-50 border-yellow-300 text-yellow-600"
                  : "bg-gray-50 border-gray-200 text-gray-400 hover:border-yellow-300 hover:text-yellow-600"
              }`}
              title="Set as default"
            >
              <Star size={16} fill={isDefault ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(address);
              }}
              className="p-2 bg-gray-50 border border-gray-200 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAddress(address._id);
              }}
              disabled={isDeleting}
              className="p-2 bg-gray-50 border border-gray-200 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 animate-pulse p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
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
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Login Required
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Please login to view and manage your saved addresses.
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

      {/* ======================= ADDRESS HEADER ======================= */}
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
            <span className="text-gray-900 font-medium">My Addresses</span>
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
                <MapPin className="w-8 h-8 text-red-500" />
                My Addresses
              </h1>
              <p className="text-gray-500 mt-2">
                {totalItems} address{totalItems !== 1 ? "es" : ""} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAddresses}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition active:scale-95"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 active:scale-95"
              >
                <Plus size={18} />
                Add Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= ADDRESSES LIST ======================= */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
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
                onClick={fetchAddresses}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-14 h-14 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Addresses Saved
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Add your first address to make checkout faster and easier.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
              >
                <Plus size={18} />
                Add Address
              </button>
            </div>
          </div>
        )}

        {!loading && !error && addresses.length > 0 && (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard key={address._id} address={address} />
            ))}
          </div>
        )}
      </main>

      {/* ======================= ADD ADDRESS MODAL ======================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Address
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine1: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine2: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData({ ...formData, landmark: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Type
                  </label>
                  <select
                    value={formData.addressType}
                    onChange={(e) =>
                      setFormData({ ...formData, addressType: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Set as default address
                  </label>
                </div>
              </div>

              {/* Geocoding Section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {geocoding ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} />
                    )}
                    {geocoding ? "Fetching..." : "Get Coordinates"}
                  </button>
                  <span className="text-xs text-gray-400">
                    Auto-fill latitude & longitude from address
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 -mb-6 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition font-medium shadow-lg shadow-red-500/25"
                  >
                    {submitting ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT ADDRESS MODAL ======================= */}
      {showEditModal && editingAddress && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Address
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAddress(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.addressLine1}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        addressLine1: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={editFormData.addressLine2}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        addressLine2: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={editFormData.landmark}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        landmark: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        district: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        state: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.pincode}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pincode: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address Type
                  </label>
                  <select
                    value={editFormData.addressType}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        addressType: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="editDefault"
                    checked={editFormData.isDefault}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="editDefault"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleEditGeocode}
                    disabled={geocoding}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {geocoding ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} />
                    )}
                    {geocoding ? "Fetching..." : "Get Coordinates"}
                  </button>
                  <span className="text-xs text-gray-400">
                    Auto-fill latitude & longitude from address
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editFormData.latitude}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          latitude: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editFormData.longitude}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          longitude: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 -mb-6 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAddress(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition font-medium shadow-lg shadow-red-500/25"
                  >
                    {submitting ? "Saving..." : "Update Address"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADDRESS DETAIL MODAL ======================= */}
      {showDetailModal && selectedAddress && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Address Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAddress(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Full Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedAddress.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Phone
                  </p>
                  <p className="text-gray-900">{selectedAddress.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Address
                  </p>
                  <p className="text-gray-900">
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 &&
                      `, ${selectedAddress.addressLine2}`}
                    {selectedAddress.landmark &&
                      `, ${selectedAddress.landmark}`}
                  </p>
                  <p className="text-gray-700">
                    {selectedAddress.city}, {selectedAddress.district},{" "}
                    {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Address Type
                  </p>
                  <p className="text-gray-900 capitalize">
                    {selectedAddress.addressType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Default
                  </p>
                  <p className="text-gray-900">
                    {selectedAddress.isDefault ? "Yes" : "No"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Coordinates
                  </p>
                  <p className="text-gray-900 font-mono">
                    {selectedAddress.latitude}, {selectedAddress.longitude}
                  </p>
                </div>
              </div>

              {/* Map */}
              {selectedAddress.latitude && selectedAddress.longitude && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 h-64">
                  <MapContainer
                    center={[
                      selectedAddress.latitude,
                      selectedAddress.longitude,
                    ]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[
                        selectedAddress.latitude,
                        selectedAddress.longitude,
                      ]}
                    >
                      <Popup>
                        {selectedAddress.fullName}
                        <br />
                        {selectedAddress.addressLine1}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAddress(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
