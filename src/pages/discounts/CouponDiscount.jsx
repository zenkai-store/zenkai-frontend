import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  Copy,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Users,
  Sparkles,
  ArrowUpRight,
  Check,
  X,
  MoreVertical,
  Filter,
  Search,
  Download,
  RefreshCw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";

const CouponDiscount = () => {
  const token =
    localStorage.getItem("mm_admin_token") ||
    localStorage.getItem("mm_staff_token");

  // States
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    sortBy: "newest",
  });

  // Add these state variables
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [segments, setSegments] = useState([]);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [showSegmentsModal, setShowSegmentsModal] = useState(false);

  // Add form states for create/edit
  const [couponForm, setCouponForm] = useState({
    coupon_code: "",
    discount_mode: "PERCENTAGE",
    value: "",
    expires_at: "",
    segment_ids: [],
  });

  const openSegmentsModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowSegmentsModal(true);
  };

  // Add confirmations
  const [confirmAction, setConfirmAction] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/api/discount/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const couponData = response.data.discounts || [];
      setCoupons(couponData);
      setFilteredCoupons(couponData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load coupon list. Please try again.",
      );
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = coupons;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (coupon) =>
          coupon.coupon_code.toLowerCase().includes(term) ||
          coupon.id.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (filters.status === "active") {
      result = result.filter((coupon) => coupon.is_active);
    } else if (filters.status === "inactive") {
      result = result.filter((coupon) => !coupon.is_active);
    }

    // Type filter
    if (filters.type === "percentage") {
      result = result.filter((coupon) => coupon.discount_mode === "PERCENTAGE");
    } else if (filters.type === "fixed") {
      result = result.filter((coupon) => coupon.discount_mode === "FIXED");
    }

    // Sort
    if (filters.sortBy === "newest") {
      result = [...result].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    } else if (filters.sortBy === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    } else if (filters.sortBy === "expiring") {
      result = [...result].sort(
        (a, b) => new Date(a.expires_at) - new Date(b.expires_at),
      );
    }

    setFilteredCoupons(result);
  }, [searchTerm, filters, coupons]);

  // Copy coupon code
  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // Toggle coupon status
  const toggleCouponStatus = async (coupon) => {
    try {
      setActionLoading(`toggle-${coupon.id}`);
      // API call will be implemented later
      setSuccess(
        `${coupon.coupon_code} ${coupon.is_active ? "deactivated" : "activated"} successfully!`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update coupon status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading("");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if coupon is expired
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // Get status color
  const getStatusColor = (isActive, expiresAt) => {
    if (!isActive) return "bg-gray-100 text-gray-700";
    if (isExpired(expiresAt)) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  // Get status text
  const getStatusText = (isActive, expiresAt) => {
    if (!isActive) return "Inactive";
    if (isExpired(expiresAt)) return "Expired";
    return "Active";
  };

  // ========================= FETCH SEGMENTS =========================
  const fetchSegments = async () => {
    try {
      setSegmentLoading(true);
      const response = await axios.get(`${BASE_URL}/api/segment/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSegments(response.data.segments || []);
    } catch (err) {
      console.error("Error fetching segments:", err);
    } finally {
      setSegmentLoading(false);
    }
  };

  // ========================= CREATE COUPON =========================
  const handleCreateCoupon = async () => {
    try {
      setActionLoading("create");
      setError("");

      const body = {
        coupon_code: couponForm.coupon_code.trim(),
        discount_mode: couponForm.discount_mode,
        value: parseFloat(couponForm.value),
        expires_at: new Date(couponForm.expires_at).toISOString(),
        segment_ids: couponForm.segment_ids,
      };

      const response = await axios.post(
        `${BASE_URL}/api/discount/coupon`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Coupon created successfully!");
      setShowCreateModal(false);
      resetCouponForm();
      fetchCoupons(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create coupon");
    } finally {
      setActionLoading("");
    }
  };

  // ========================= TOGGLE COUPON STATUS =========================
  const handleToggleStatus = async () => {
    try {
      setActionLoading(`status-${selectedCoupon.id}`);

      const body = {
        is_active: !selectedCoupon.is_active,
      };

      await axios.patch(
        `${BASE_URL}/api/discount/${selectedCoupon.id}/status`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess(
        `Coupon ${selectedCoupon.is_active ? "deactivated" : "activated"} successfully!`,
      );
      setShowStatusModal(false);
      setConfirmAction(false);
      fetchCoupons(); // Refresh list
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update coupon status",
      );
    } finally {
      setActionLoading("");
    }
  };

  // ========================= UPDATE COUPON =========================
  const handleUpdateCoupon = async () => {
    try {
      setActionLoading(`update-${selectedCoupon.id}`);

      const body = {
        value: parseFloat(couponForm.value),
        coupon_code: couponForm.coupon_code.trim(),
        expires_at: new Date(couponForm.expires_at).toISOString(),
      };

      await axios.patch(
        `${BASE_URL}/api/discount/coupon/${selectedCoupon.id}`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Coupon updated successfully!");
      setShowEditModal(false);
      resetCouponForm();
      fetchCoupons(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update coupon");
    } finally {
      setActionLoading("");
    }
  };

  // ========================= DELETE COUPON =========================
  const handleDeleteCoupon = async () => {
    try {
      setActionLoading(`delete-${selectedCoupon.id}`);

      await axios.delete(
        `${BASE_URL}/api/discount/coupon/${selectedCoupon.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Coupon deleted successfully!");
      setShowDeleteModal(false);
      setConfirmDelete(false);
      fetchCoupons(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete coupon");
    } finally {
      setActionLoading("");
    }
  };

  // ========================= EXPORT COUPONS =========================
  const exportCouponsToExcel = () => {
    try {
      // Prepare data for export
      const exportData = coupons.map((coupon) => ({
        "Coupon Code": coupon.coupon_code,
        "Discount Type": coupon.discount_mode,
        Value: coupon.value,
        Status: coupon.is_active ? "Active" : "Inactive",
        "Expires At": new Date(coupon.expires_at).toLocaleString(),
        "Created At": new Date(coupon.created_at).toLocaleString(),
        "Created By Role": coupon.created_by_role,
        "Coupon ID": coupon.id,
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((header) => `"${row[header]}"`).join(","),
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `coupons_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Coupons exported successfully!");
    } catch (err) {
      setError("Failed to export coupons");
      console.error("Export error:", err);
    }
  };

  // ========================= HELPER FUNCTIONS =========================
  const resetCouponForm = () => {
    setCouponForm({
      coupon_code: "",
      discount_mode: "PERCENTAGE",
      value: "",
      expires_at: "",
      segment_ids: [],
    });
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setCouponForm({
      coupon_code: coupon.coupon_code,
      discount_mode: coupon.discount_mode,
      value: coupon.value,
      expires_at: coupon.expires_at.split("T")[0], // Format for date input
      segment_ids: [], // You might need to fetch this separately
    });
    setShowEditModal(true);
  };

  const openStatusModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowStatusModal(true);
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Coupon Discount Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage discount coupons for customers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetCouponForm();
                fetchSegments(); // Fetch segments when opening modal
                setShowCreateModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Coupon
            </motion.button>
          </div>
        </div>

        {/* Instructions Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Important Instructions for Admin & Staff
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Coupon Types
                    </p>
                    <p className="text-sm text-gray-600">
                      Create coupons based on Percentage or Fixed amount with
                      unique coupon codes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Targeted Segments
                    </p>
                    <p className="text-sm text-gray-600">
                      Coupons are globally available but applicable only to
                      specified user segments.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Secure Sharing
                    </p>
                    <p className="text-sm text-gray-600">
                      Share coupon codes carefully only with intended users to
                      prevent misuse.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      4
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Activity Logging
                    </p>
                    <p className="text-sm text-gray-600">
                      All coupon activities by staff and admin are recorded for
                      security and audit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Feedback */}
      <div className="mb-6 space-y-3">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by coupon code or ID..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="expiring">Expiring Soon</option>
            </select>

            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCoupons}
              className="p-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  coupons.filter((c) => c.is_active && !isExpired(c.expires_at))
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.filter((c) => isExpired(c.expires_at)).length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Percentage Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.filter((c) => c.discount_mode === "PERCENTAGE").length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          <div className="col-span-2">COUPON CODE</div>
          <div className="col-span-2">DISCOUNT VALUE</div>
          <div className="col-span-2">EXPIRES AT</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">CREATED</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg">Loading coupons...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching discount data</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-600 text-lg mb-2">Failed to load coupons</p>
            <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCoupons}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCoupons.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Tag className="w-20 h-20 text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-2">No coupons found</p>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first coupon to get started"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Coupon
            </motion.button>
          </div>
        )}

        {/* Coupons List */}
        <AnimatePresence>
          {!loading && !error && filteredCoupons.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredCoupons.map((coupon) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-12 gap-4 p-5 hover:bg-gray-50 transition-colors"
                >
                  {/* Coupon Code */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${coupon.discount_mode === "PERCENTAGE" ? "bg-purple-100" : "bg-blue-100"}`}
                      >
                        {coupon.discount_mode === "PERCENTAGE" ? (
                          <Percent className="w-4 h-4 text-purple-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">
                            {coupon.coupon_code}
                          </span>
                          <button
                            onClick={() => copyCouponCode(coupon.coupon_code)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Copy coupon code"
                          >
                            {copiedCoupon === coupon.coupon_code ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
                          ID: {coupon.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Discount Value */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-bold ${coupon.discount_mode === "PERCENTAGE" ? "text-purple-600" : "text-blue-600"}`}
                      >
                        {coupon.discount_mode === "PERCENTAGE"
                          ? `${coupon.value}%`
                          : `$${coupon.value}`}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${coupon.discount_mode === "PERCENTAGE" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {coupon.discount_mode === "PERCENTAGE"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created by {coupon.created_by_role}
                    </p>
                  </div>

                  {/* Expires At */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(coupon.expires_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(coupon.expires_at)}
                        </p>
                      </div>
                    </div>
                    {isExpired(coupon.expires_at) && (
                      <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expired
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(coupon.is_active, coupon.expires_at)}`}
                      >
                        {getStatusText(coupon.is_active, coupon.expires_at)}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${coupon.is_active && !isExpired(coupon.expires_at) ? "bg-green-500" : "bg-gray-400"}`}
                      />
                    </div>
                    {coupon.is_active && !isExpired(coupon.expires_at) && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Available for use
                      </p>
                    )}
                  </div>

                  {/* Created */}
                  <div className="col-span-2">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">
                        {formatDate(coupon.created_at)}
                      </p>
                      <p className="text-gray-500">
                        {formatTime(coupon.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openSegmentsModal(coupon)}
                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="View eligible segments"
                      >
                        <Users className="w-4 h-4" />
                      </motion.button>
                      {/* Toggle Status */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openStatusModal(coupon)}
                        disabled={actionLoading === `toggle-${coupon.id}`}
                        className={`p-2 rounded-lg ${
                          coupon.is_active && !isExpired(coupon.expires_at)
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } transition-colors disabled:opacity-50`}
                        title={coupon.is_active ? "Deactivate" : "Activate"}
                      >
                        {actionLoading === `toggle-${coupon.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : coupon.is_active &&
                          !isExpired(coupon.expires_at) ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </motion.button>

                      {/* Edit */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(coupon)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(coupon)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        {!loading && filteredCoupons.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredCoupons.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {coupons.length}
                  </span>{" "}
                  coupons
                </span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                onClick={exportCouponsToExcel}
              >
                <Download className="w-4 h-4" />
                <span>Export List</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Create Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* ======================= VIEW SEGMENTS MODAL ======================= */}
      {showSegmentsModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Eligible Segments
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Segments that can use coupon: {selectedCoupon.coupon_code}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Coupon Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedCoupon.coupon_code}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedCoupon.discount_mode === "PERCENTAGE"
                          ? `${selectedCoupon.value}% off`
                          : `$${selectedCoupon.value} off`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedCoupon.is_active &&
                      !isExpired(selectedCoupon.expires_at)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getStatusText(
                      selectedCoupon.is_active,
                      selectedCoupon.expires_at,
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Expires: {formatDate(selectedCoupon.expires_at)}
                </p>
              </div>

              {/* Segments List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Eligible Customer Segments
                  </h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {selectedCoupon.segments?.length || 0} segments
                  </span>
                </div>

                {!selectedCoupon.segments ||
                selectedCoupon.segments.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      No Segments Assigned
                    </p>
                    <p className="text-sm text-gray-500">
                      This coupon is available to all customer segments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {selectedCoupon.segments.map((segment, index) => (
                      <motion.div
                        key={segment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-purple-600">
                            {segment.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {segment.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Segment ID: {segment.id.substring(0, 8)}...
                          </p>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full bg-green-500"
                          title="Active"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Note
                    </p>
                    <p className="text-sm text-blue-700">
                      {!selectedCoupon.segments ||
                      selectedCoupon.segments.length === 0
                        ? "This coupon is available to all customer segments without restrictions."
                        : "Only customers in these segments can use this coupon code."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowSegmentsModal(false)}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================= CREATE COUPON MODAL ======================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Create New Coupon
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Configure discount coupon for specific segments
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Coupon Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="e.g., NEWMM25"
                    value={couponForm.coupon_code}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        coupon_code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={couponForm.discount_mode}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discount_mode: e.target.value,
                      })
                    }
                  >
                    <option value="PERCENTAGE">Percentage Discount</option>
                    <option value="FIXED">Fixed Amount Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={
                      couponForm.discount_mode === "PERCENTAGE"
                        ? "e.g., 15 for 15%"
                        : "e.g., 50 for $50"
                    }
                    value={couponForm.value}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, value: e.target.value })
                    }
                    min="0"
                    max={couponForm.discount_mode === "PERCENTAGE" ? "100" : ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={couponForm.expires_at}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        expires_at: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Segments Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Segments{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                {segmentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : segments.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    No segments available
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-xl">
                    {segments.map((segment) => (
                      <label
                        key={segment.id}
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={couponForm.segment_ids.includes(segment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCouponForm({
                                ...couponForm,
                                segment_ids: [
                                  ...couponForm.segment_ids,
                                  segment.id,
                                ],
                              });
                            } else {
                              setCouponForm({
                                ...couponForm,
                                segment_ids: couponForm.segment_ids.filter(
                                  (id) => id !== segment.id,
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {segment.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to make coupon available to all segments
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCouponForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading === "create"}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoupon}
                disabled={
                  actionLoading === "create" ||
                  !couponForm.coupon_code ||
                  !couponForm.value ||
                  !couponForm.expires_at
                }
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === "create" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT COUPON MODAL ======================= */}
      {showEditModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">Edit Coupon</h2>
              <p className="text-blue-100 text-sm mt-1">
                Update coupon details
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={couponForm.coupon_code}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      coupon_code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={couponForm.value}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, value: e.target.value })
                  }
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Current type:{" "}
                  <span className="font-medium">
                    {selectedCoupon.discount_mode}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={couponForm.expires_at}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, expires_at: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetCouponForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading === `update-${selectedCoupon.id}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCoupon}
                disabled={
                  actionLoading === `update-${selectedCoupon.id}` ||
                  !couponForm.coupon_code ||
                  !couponForm.value ||
                  !couponForm.expires_at
                }
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === `update-${selectedCoupon.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Coupon"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= STATUS CONFIRMATION MODAL ======================= */}
      {showStatusModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div
              className={`p-6 ${selectedCoupon.is_active ? "bg-gradient-to-r from-amber-500 to-amber-600" : "bg-gradient-to-r from-green-500 to-green-600"}`}
            >
              <h2 className="text-xl font-bold text-white">
                {selectedCoupon.is_active
                  ? "Deactivate Coupon"
                  : "Activate Coupon"}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {selectedCoupon.is_active
                  ? "Temporarily disable this coupon"
                  : "Make this coupon available for use"}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Tag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedCoupon.coupon_code}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedCoupon.discount_mode === "PERCENTAGE"
                        ? `${selectedCoupon.value}% off`
                        : `$${selectedCoupon.value} off`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <input
                  type="checkbox"
                  id="confirmAction"
                  checked={confirmAction}
                  onChange={(e) => setConfirmAction(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="confirmAction"
                  className="text-sm text-gray-700"
                >
                  <span className="font-medium">I confirm:</span> I want to{" "}
                  {selectedCoupon.is_active ? "deactivate" : "activate"} this
                  coupon. This action will{" "}
                  {selectedCoupon.is_active ? "prevent" : "allow"} users from
                  using this coupon code.
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setConfirmAction(false);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading === `status-${selectedCoupon.id}`}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={
                  actionLoading === `status-${selectedCoupon.id}` ||
                  !confirmAction
                }
                className={`px-5 py-2.5 ${selectedCoupon.is_active ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"} text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {actionLoading === `status-${selectedCoupon.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedCoupon.is_active ? (
                  "Deactivate Coupon"
                ) : (
                  "Activate Coupon"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MODAL ======================= */}
      {showDeleteModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-xl font-bold text-white">Delete Coupon</h2>
              <p className="text-red-100 text-sm mt-1">
                This action cannot be undone
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Warning: Irreversible Action
                  </h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete the coupon "
                    {selectedCoupon.coupon_code}" and all associated data. This
                    action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Code:</span>
                    <span className="font-medium text-gray-900">
                      {selectedCoupon.coupon_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Value:</span>
                    <span className="font-medium text-gray-900">
                      {selectedCoupon.discount_mode === "PERCENTAGE"
                        ? `${selectedCoupon.value}%`
                        : `$${selectedCoupon.value}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedCoupon.expires_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <input
                  type="checkbox"
                  id="confirmDelete"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="confirmDelete"
                  className="text-sm text-gray-700"
                >
                  <span className="font-medium">I understand and confirm:</span>
                  I want to permanently delete this coupon and all associated
                  data.
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDelete(false);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading === `delete-${selectedCoupon.id}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                disabled={
                  actionLoading === `delete-${selectedCoupon.id}` ||
                  !confirmDelete
                }
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === `delete-${selectedCoupon.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Coupon"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponDiscount;
