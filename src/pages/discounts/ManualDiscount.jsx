import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Tag,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  Eye,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Users,
  Sparkles,
  Check,
  X,
  Filter,
  Search,
  Download,
  RefreshCw,
  Info,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";

const ManualDiscount = () => {
  const token =
    localStorage.getItem("mm_admin_token") ||
    localStorage.getItem("mm_staff_token");

  // States
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [copiedUserId, setCopiedUserId] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    sortBy: "newest",
  });

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [showSegmentsModal, setShowSegmentsModal] = useState(false);

  // Confirmation states
  const [confirmAction, setConfirmAction] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch manual discounts
  const fetchManualDiscounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/api/discount/manual`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const discountData = response.data.discounts || [];
      setDiscounts(discountData);
      setFilteredDiscounts(discountData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load manual discounts. Please try again.",
      );
      console.error("Error fetching manual discounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManualDiscounts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = discounts;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (discount) =>
          discount.id.toLowerCase().includes(term) ||
          discount.assigned_users?.some((user) =>
            user.user_id.toLowerCase().includes(term),
          ) ||
          discount.segments?.some((segment) =>
            segment.name.toLowerCase().includes(term),
          ),
      );
    }

    // Status filter
    if (filters.status === "active") {
      result = result.filter((discount) => discount.is_active);
    } else if (filters.status === "inactive") {
      result = result.filter((discount) => !discount.is_active);
    }

    // Type filter
    if (filters.type === "percentage") {
      result = result.filter(
        (discount) => discount.discount_mode === "PERCENTAGE",
      );
    } else if (filters.type === "fixed") {
      result = result.filter((discount) => discount.discount_mode === "FIXED");
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

    setFilteredDiscounts(result);
  }, [searchTerm, filters, discounts]);

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

  // Check if discount is expired
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  // Copy user ID to clipboard
  const copyUserId = (userId) => {
    navigator.clipboard.writeText(userId);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
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

  // Toggle discount status
  const handleToggleStatus = async () => {
    try {
      setActionLoading(`status-${selectedDiscount.id}`);

      const body = {
        is_active: !selectedDiscount.is_active,
      };

      await axios.patch(
        `${BASE_URL}/api/discount/${selectedDiscount.id}/status`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess(
        `Manual discount ${selectedDiscount.is_active ? "deactivated" : "activated"} successfully!`,
      );
      setShowStatusModal(false);
      setConfirmAction(false);
      fetchManualDiscounts(); // Refresh list
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update discount status",
      );
    } finally {
      setActionLoading("");
    }
  };

  // Delete discount
  const handleDeleteDiscount = async () => {
    try {
      setActionLoading(`delete-${selectedDiscount.id}`);

      await axios.delete(
        `${BASE_URL}/api/discount/coupon/${selectedDiscount.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Manual discount deleted successfully!");
      setShowDeleteModal(false);
      setConfirmDelete(false);
      fetchManualDiscounts(); // Refresh list
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete discount");
    } finally {
      setActionLoading("");
    }
  };

  // Export discounts to Excel
  const exportDiscountsToExcel = () => {
    try {
      // Prepare data for export
      const exportData = discounts.map((discount) => ({
        "Discount ID": discount.id,
        Type: discount.discount_mode,
        Value: discount.value,
        Status: discount.is_active ? "Active" : "Inactive",
        "Expires At": new Date(discount.expires_at).toLocaleString(),
        "Created At": new Date(discount.created_at).toLocaleString(),
        "Created By Role": discount.created_by_role,
        "Assigned User IDs": discount.assigned_users
          ?.map((user) => user.user_id)
          .join(", "),
        Segments: discount.segments?.map((segment) => segment.name).join(", "),
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
        `manual_discounts_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Manual discounts exported successfully!");
    } catch (err) {
      setError("Failed to export discounts");
      console.error("Export error:", err);
    }
  };

  const openStatusModal = (discount) => {
    setSelectedDiscount(discount);
    setShowStatusModal(true);
  };

  const openDeleteModal = (discount) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const openSegmentsModal = (discount) => {
    setSelectedDiscount(discount);
    setShowSegmentsModal(true);
  };

  // Format assigned users display
  const formatAssignedUsers = (users) => {
    if (!users || users.length === 0) return "No users assigned";
    if (users.length === 1)
      return `User: ${users[0].user_id.substring(0, 8)}...`;
    return `${users.length} users`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manual Discount Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage manual discounts created in Order-Chat for specific
                  users
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Important Instructions for Admin & Staff
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Manual Discounts
                    </p>
                    <p className="text-sm text-gray-600">
                      These discounts are created directly in Order-Chat for
                      specific users and applied immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      User-Specific
                    </p>
                    <p className="text-sm text-gray-600">
                      Each manual discount is assigned to specific users only
                      and cannot be used by others.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Admin/Staff Control
                    </p>
                    <p className="text-sm text-gray-600">
                      Only admin/staff can create, activate/deactivate, or
                      delete these discounts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">
                      4
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Activity Logging
                    </p>
                    <p className="text-sm text-gray-600">
                      All manual discount activities are recorded for security
                      and audit purposes.
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
                placeholder="Search by discount ID, user ID, or segment..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
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
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
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
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>

            <select
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
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
              onClick={fetchManualDiscounts}
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
              <p className="text-sm text-gray-600">Total Manual Discounts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {discounts.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Tag className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm text-gray-600">Active Discounts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  discounts.filter(
                    (d) => d.is_active && !isExpired(d.expires_at),
                  ).length
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
              <p className="text-sm text-gray-600">Expired Discounts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {discounts.filter((d) => isExpired(d.expires_at)).length}
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
              <p className="text-sm text-gray-600">Percentage Discounts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  discounts.filter((d) => d.discount_mode === "PERCENTAGE")
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          <div className="col-span-2">DISCOUNT ID</div>
          <div className="col-span-2">DISCOUNT VALUE</div>
          <div className="col-span-2">ASSIGNED TO</div>
          <div className="col-span-2">EXPIRES AT</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg">Loading manual discounts...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching discount data</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-600 text-lg mb-2">
              Failed to load discounts
            </p>
            <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchManualDiscounts}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDiscounts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Tag className="w-20 h-20 text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-2">
              No manual discounts found
            </p>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Manual discounts will appear here when created in Order-Chat"}
            </p>
          </div>
        )}

        {/* Discounts List */}
        <AnimatePresence>
          {!loading && !error && filteredDiscounts.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredDiscounts.map((discount) => (
                <motion.div
                  key={discount.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-12 gap-4 p-5 hover:bg-gray-50 transition-colors"
                >
                  {/* Discount ID */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${discount.discount_mode === "PERCENTAGE" ? "bg-blue-100" : "bg-purple-100"}`}
                      >
                        {discount.discount_mode === "PERCENTAGE" ? (
                          <Percent className="w-4 h-4 text-blue-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {discount.id.substring(0, 8)}...
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {discount.discount_mode === "PERCENTAGE"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Discount Value */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-bold ${discount.discount_mode === "PERCENTAGE" ? "text-blue-600" : "text-purple-600"}`}
                      >
                        {discount.discount_mode === "PERCENTAGE"
                          ? `${discount.value}%`
                          : `$${discount.value}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created by {discount.created_by_role}
                    </p>
                  </div>

                  {/* Assigned Users */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatAssignedUsers(discount.assigned_users)}
                        </p>
                        {discount.assigned_users &&
                          discount.assigned_users.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {discount.assigned_users.length} user
                              {discount.assigned_users.length > 1 ? "s" : ""}
                            </p>
                          )}
                      </div>
                    </div>
                    {discount.segments && discount.segments.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {discount.segments.length} segment
                        {discount.segments.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Expires At */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(discount.expires_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(discount.expires_at)}
                        </p>
                      </div>
                    </div>
                    {isExpired(discount.expires_at) && (
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
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(discount.is_active, discount.expires_at)}`}
                      >
                        {getStatusText(discount.is_active, discount.expires_at)}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${discount.is_active && !isExpired(discount.expires_at) ? "bg-green-500" : "bg-gray-400"}`}
                      />
                    </div>
                    {discount.is_active && !isExpired(discount.expires_at) && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Available
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex justify-end gap-2">
                      {/* View Segments */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openSegmentsModal(discount)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="View segments and users"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      {/* Toggle Status */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openStatusModal(discount)}
                        disabled={actionLoading === `toggle-${discount.id}`}
                        className={`p-2 rounded-lg ${
                          discount.is_active && !isExpired(discount.expires_at)
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } transition-colors disabled:opacity-50`}
                        title={discount.is_active ? "Deactivate" : "Activate"}
                      >
                        {actionLoading === `toggle-${discount.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : discount.is_active &&
                          !isExpired(discount.expires_at) ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </motion.button>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteModal(discount)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete discount"
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
        {!loading && filteredDiscounts.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredDiscounts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {discounts.length}
                  </span>{" "}
                  manual discounts
                </span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-purple-600"
                onClick={exportDiscountsToExcel}
              >
                <Download className="w-4 h-4" />
                <span>Export List</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================= VIEW SEGMENTS & USERS MODAL ======================= */}
      {showSegmentsModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">Discount Details</h2>
              <p className="text-blue-100 text-sm mt-1">
                View assigned users and segments for this manual discount
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Discount Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedDiscount.discount_mode === "PERCENTAGE"
                          ? `${selectedDiscount.value}% off`
                          : `$${selectedDiscount.value} off`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Discount ID: {selectedDiscount.id.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedDiscount.is_active &&
                      !isExpired(selectedDiscount.expires_at)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getStatusText(
                      selectedDiscount.is_active,
                      selectedDiscount.expires_at,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Expires:</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedDiscount.expires_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By:</p>
                    <p className="font-medium text-gray-900">
                      {selectedDiscount.created_by_role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Users */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Assigned Users</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {selectedDiscount.assigned_users?.length || 0} users
                  </span>
                </div>

                {!selectedDiscount.assigned_users ||
                selectedDiscount.assigned_users.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      No Users Assigned
                    </p>
                    <p className="text-sm text-gray-500">
                      This discount is not assigned to any specific user
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedDiscount.assigned_users.map((user, index) => (
                      <motion.div
                        key={user.user_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              User ID
                            </h4>
                            <p className="text-xs text-gray-500 font-mono">
                              {user.user_id}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyUserId(user.user_id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy user ID"
                        >
                          {copiedUserId === user.user_id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Segments List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Eligible Segments
                  </h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {selectedDiscount.segments?.length || 0} segments
                  </span>
                </div>

                {!selectedDiscount.segments ||
                selectedDiscount.segments.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      No Segments Assigned
                    </p>
                    <p className="text-sm text-gray-500">
                      This discount is available to all segments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedDiscount.segments.map((segment, index) => (
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowSegmentsModal(false)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= STATUS CONFIRMATION MODAL ======================= */}
      {showStatusModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div
              className={`p-6 ${selectedDiscount.is_active ? "bg-gradient-to-r from-amber-500 to-amber-600" : "bg-gradient-to-r from-green-500 to-green-600"}`}
            >
              <h2 className="text-xl font-bold text-white">
                {selectedDiscount.is_active
                  ? "Deactivate Manual Discount"
                  : "Activate Manual Discount"}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {selectedDiscount.is_active
                  ? "Temporarily disable this discount"
                  : "Make this discount available for assigned users"}
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
                      {selectedDiscount.discount_mode === "PERCENTAGE"
                        ? `${selectedDiscount.value}% off`
                        : `$${selectedDiscount.value} off`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Assigned to {selectedDiscount.assigned_users?.length || 0}{" "}
                      users
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
                  {selectedDiscount.is_active ? "deactivate" : "activate"} this
                  manual discount. This action will{" "}
                  {selectedDiscount.is_active ? "prevent" : "allow"} assigned
                  users from using this discount.
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
                disabled={actionLoading === `status-${selectedDiscount.id}`}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={
                  actionLoading === `status-${selectedDiscount.id}` ||
                  !confirmAction
                }
                className={`px-5 py-2.5 ${selectedDiscount.is_active ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"} text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {actionLoading === `status-${selectedDiscount.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedDiscount.is_active ? (
                  "Deactivate Discount"
                ) : (
                  "Activate Discount"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MODAL ======================= */}
      {showDeleteModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Delete Manual Discount
              </h2>
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
                    This will permanently delete the manual discount and all
                    associated data. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ID:</span>
                    <span className="font-medium text-gray-900">
                      {selectedDiscount.id.substring(0, 12)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Value:</span>
                    <span className="font-medium text-gray-900">
                      {selectedDiscount.discount_mode === "PERCENTAGE"
                        ? `${selectedDiscount.value}%`
                        : `$${selectedDiscount.value}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Users:</span>
                    <span className="font-medium text-gray-900">
                      {selectedDiscount.assigned_users?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedDiscount.expires_at)}
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
                  I want to permanently delete this manual discount and all
                  associated data.
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
                disabled={actionLoading === `delete-${selectedDiscount.id}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDiscount}
                disabled={
                  actionLoading === `delete-${selectedDiscount.id}` ||
                  !confirmDelete
                }
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === `delete-${selectedDiscount.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Discount"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualDiscount;
