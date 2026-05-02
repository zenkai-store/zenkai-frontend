import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Users,
  Tag,
  User,
  Download,
  RefreshCw,
  Info,
  FileText,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";

const DiscountActivity = () => {
  const token = localStorage.getItem("mm_admin_token");

  // States
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch discount activities
  const fetchDiscountActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/api/discount/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const activityData = response.data.logs || [];
      // Get top 50 most recent activities
      const recentActivities = activityData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);

      setActivities(recentActivities);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load discount activities. Please try again.",
      );
      console.error("Error fetching discount activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountActivities();
  }, []);

  // Copy ID to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
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
      second: "2-digit",
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  // Get action type color and icon
  const getActionTypeInfo = (actionType) => {
    switch (actionType) {
      case "CREATED":
        return {
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "UPDATED":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: <FileText className="w-4 h-4" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "ACTIVATED":
        return {
          color: "bg-emerald-100 text-emerald-700",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      case "DEACTIVATED":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      case "DELETED":
        return {
          color: "bg-red-100 text-red-700",
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: <Activity className="w-4 h-4" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  // Get discount type color
  const getDiscountTypeColor = (type) => {
    switch (type) {
      case "MANUAL":
        return "bg-purple-100 text-purple-700";
      case "COUPON":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get discount mode icon
  const getDiscountModeIcon = (mode) => {
    return mode === "PERCENTAGE" ? (
      <Percent className="w-3 h-3" />
    ) : (
      <DollarSign className="w-3 h-3" />
    );
  };

  // Open detail modal
  const openDetailModal = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  // Export activities to Excel
  const exportActivitiesToExcel = () => {
    try {
      // Prepare data for export
      const exportData = activities.map((activity) => ({
        "Activity ID": activity.id,
        "Discount ID": activity.discount_id,
        "Action Type": activity.action_type,
        "Performed By": activity.performed_by,
        "Performed By Role": activity.performed_by_role,
        "Affected User ID": activity.affected_user_id || "N/A",
        "Discount Type":
          activity.new_value?.type || activity.old_value?.type || "N/A",
        "Discount Value":
          activity.new_value?.value || activity.old_value?.value || "N/A",
        "Discount Mode":
          activity.new_value?.discount_mode ||
          activity.old_value?.discount_mode ||
          "N/A",
        "Coupon Code":
          activity.new_value?.coupon_code ||
          activity.old_value?.coupon_code ||
          "N/A",
        "Status Change":
          activity.old_value?.is_active !== undefined &&
          activity.new_value?.is_active !== undefined
            ? `${activity.old_value?.is_active ? "Active" : "Inactive"} → ${activity.new_value?.is_active ? "Active" : "Inactive"}`
            : "N/A",
        "Activity Timestamp": new Date(activity.created_at).toLocaleString(),
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
        `discount_activities_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Discount activities exported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to export activities");
      console.error("Export error:", err);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Discount Activity Logs
                </h1>
                <p className="text-gray-600 mt-1">
                  Audit trail of all staff and admin actions on discounts
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportActivitiesToExcel}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center gap-2 font-medium shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export All Activities
            </motion.button>

            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDiscountActivities}
              className="p-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Instructions Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Admin-Only Activity Monitoring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Activity Tracking
                    </p>
                    <p className="text-sm text-gray-600">
                      All staff/admin actions on discounts (create, update,
                      activate/deactivate, delete) are logged here.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Admin-Only Access
                    </p>
                    <p className="text-sm text-gray-600">
                      This page is only accessible to Admin users for security
                      and audit purposes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Top 50 Recent Activities
                    </p>
                    <p className="text-sm text-gray-600">
                      Displaying the 50 most recent activities. Export to view
                      complete history.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600">
                      4
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Complete Audit Trail
                    </p>
                    <p className="text-sm text-gray-600">
                      Each log includes who performed the action, what changed,
                      and when it happened.
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
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activities.length}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Activity className="w-6 h-6 text-indigo-600" />
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
              <p className="text-sm text-gray-600">Creation Activities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activities.filter((a) => a.action_type === "CREATED").length}
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
              <p className="text-sm text-gray-600">Status Changes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  activities.filter(
                    (a) =>
                      a.action_type === "ACTIVATED" ||
                      a.action_type === "DEACTIVATED",
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">
                Manual Discount Activities
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  activities.filter(
                    (a) =>
                      a.new_value?.type === "MANUAL" ||
                      a.old_value?.type === "MANUAL",
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          <div className="col-span-3">ACTIVITY</div>
          <div className="col-span-2">DISCOUNT</div>
          <div className="col-span-2">PERFORMED BY</div>
          <div className="col-span-3">TIMESTAMP</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg">Loading activities...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching audit logs</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-600 text-lg mb-2">
              Failed to load activities
            </p>
            <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDiscountActivities}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Activity className="w-20 h-20 text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-2">No activities found</p>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              Discount activities will appear here when staff or admin perform
              actions
            </p>
          </div>
        )}

        {/* Activities List */}
        <AnimatePresence>
          {!loading && !error && activities.length > 0 && (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => {
                const actionInfo = getActionTypeInfo(activity.action_type);
                const discountValue = activity.new_value || activity.old_value;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-12 gap-4 p-5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Activity */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${actionInfo.bgColor} ${actionInfo.borderColor} border`}
                        >
                          {actionInfo.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${actionInfo.color}`}
                            >
                              {activity.action_type}
                            </span>
                            {discountValue && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getDiscountTypeColor(discountValue.type)}`}
                              >
                                {discountValue.type}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Discount ID: {activity.discount_id.substring(0, 8)}
                            ...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Discount Details */}
                    <div className="col-span-2">
                      {discountValue ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {discountValue.discount_mode === "PERCENTAGE"
                                ? `${discountValue.value}%`
                                : `$${discountValue.value}`}
                            </span>
                            <div className="p-1 bg-gray-100 rounded">
                              {getDiscountModeIcon(discountValue.discount_mode)}
                            </div>
                          </div>
                          {discountValue.coupon_code && (
                            <p className="text-sm text-gray-600 mt-1">
                              Code: {discountValue.coupon_code}
                            </p>
                          )}
                          {activity.affected_user_id && (
                            <div className="flex items-center gap-1 mt-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                User assigned
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No discount data
                        </p>
                      )}
                    </div>

                    {/* Performed By */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between gap-2 group">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${activity.performed_by_role === "ADMIN" ? "bg-red-100" : "bg-blue-100"}`}
                          >
                            <span
                              className={`text-xs font-semibold ${activity.performed_by_role === "ADMIN" ? "text-red-700" : "text-blue-700"}`}
                            >
                              {activity.performed_by_role.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.performed_by_role}
                            </p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-gray-500 truncate max-w-[100px]">
                                ID: {activity.performed_by.substring(0, 8)}...
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(activity.performed_by)
                                }
                                className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy staff ID"
                              >
                                {copiedId === activity.performed_by ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(activity.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Activity ID: {activity.id.substring(0, 8)}...
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex justify-end gap-2">
                        {/* Copy Discount ID */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(activity.discount_id)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Copy discount ID"
                        >
                          {copiedId === activity.discount_id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </motion.button>

                        {/* View Details */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openDetailModal(activity)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        {!loading && activities.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {activities.length}
                  </span>{" "}
                  most recent activities
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs">
                  Top 50 Recent Activities
                </span>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                onClick={exportActivitiesToExcel}
              >
                <Download className="w-4 h-4" />
                <span>Export Complete History</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================= ACTIVITY DETAIL MODAL ======================= */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
              <h2 className="text-xl font-bold text-white">Activity Details</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Complete audit log for this discount activity
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Activity Summary */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${getActionTypeInfo(selectedActivity.action_type).bgColor}`}
                    >
                      {getActionTypeInfo(selectedActivity.action_type).icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {selectedActivity.action_type}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Discount Activity Log
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Activity ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-gray-900">
                        {selectedActivity.id.substring(0, 16)}...
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedActivity.id)}
                        className="text-gray-400 hover:text-indigo-600"
                        title="Copy activity ID"
                      >
                        {copiedId === selectedActivity.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Performed By</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${selectedActivity.performed_by_role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {selectedActivity.performed_by_role}
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedActivity.performed_by.substring(0, 12)}...
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedActivity.performed_by)
                        }
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy staff ID"
                      >
                        {copiedId === selectedActivity.performed_by ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Timestamp</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(selectedActivity.created_at)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Discount ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedActivity.discount_id.substring(0, 12)}...
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedActivity.discount_id)
                        }
                        className="text-gray-400 hover:text-indigo-600"
                        title="Copy discount ID"
                      >
                        {copiedId === selectedActivity.discount_id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Discount Information
                </h4>
                {selectedActivity.new_value ? (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Discount Type
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getDiscountTypeColor(selectedActivity.new_value.type)}`}
                        >
                          {selectedActivity.new_value.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Discount Value
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            {selectedActivity.new_value.discount_mode ===
                            "PERCENTAGE"
                              ? `${selectedActivity.new_value.value}%`
                              : `$${selectedActivity.new_value.value}`}
                          </span>
                          <div className="p-1.5 bg-gray-100 rounded">
                            {getDiscountModeIcon(
                              selectedActivity.new_value.discount_mode,
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedActivity.new_value.coupon_code && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Coupon Code
                          </p>
                          <p className="text-lg font-mono font-bold text-gray-900">
                            {selectedActivity.new_value.coupon_code}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedActivity.new_value.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {selectedActivity.new_value.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                    {selectedActivity.affected_user_id && (
                      <div className="mt-4 pt-4 border-t border-indigo-100">
                        <p className="text-sm text-gray-600 mb-2">
                          Affected User
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="font-mono text-sm text-gray-900">
                              {selectedActivity.affected_user_id}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(selectedActivity.affected_user_id)
                            }
                            className="text-gray-400 hover:text-indigo-600"
                            title="Copy user ID"
                          >
                            {copiedId === selectedActivity.affected_user_id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No discount information available for this activity</p>
                  </div>
                )}
              </div>

              {/* Change Details */}
              {(selectedActivity.old_value || selectedActivity.new_value) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                    Changes Made
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Old Value */}
                    <div
                      className={`rounded-xl p-5 border ${selectedActivity.old_value ? "bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <h5 className="font-medium text-gray-900">
                          Before Change
                        </h5>
                      </div>
                      {selectedActivity.old_value ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${selectedActivity.old_value.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {selectedActivity.old_value.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Value</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedActivity.old_value.discount_mode ===
                              "PERCENTAGE"
                                ? `${selectedActivity.old_value.value}%`
                                : `$${selectedActivity.old_value.value}`}
                            </p>
                          </div>
                          {selectedActivity.old_value.coupon_code && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Coupon Code
                              </p>
                              <p className="font-mono text-gray-900">
                                {selectedActivity.old_value.coupon_code}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No previous state</p>
                          <p className="text-sm">(Newly created)</p>
                        </div>
                      )}
                    </div>

                    {/* New Value */}
                    <div className="rounded-xl p-5 border bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <h5 className="font-medium text-gray-900">
                          After Change
                        </h5>
                      </div>
                      {selectedActivity.new_value ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${selectedActivity.new_value.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {selectedActivity.new_value.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Value</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedActivity.new_value.discount_mode ===
                              "PERCENTAGE"
                                ? `${selectedActivity.new_value.value}%`
                                : `$${selectedActivity.new_value.value}`}
                            </p>
                          </div>
                          {selectedActivity.new_value.coupon_code && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Coupon Code
                              </p>
                              <p className="font-mono text-gray-900">
                                {selectedActivity.new_value.coupon_code}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>No current state</p>
                          <p className="text-sm">(Deleted)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Info */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-800 mb-1">
                      Audit Information
                    </p>
                    <p className="text-sm text-indigo-700">
                      This activity log is part of the discount management audit
                      trail. All actions performed by staff and admin users are
                      recorded for security, compliance, and troubleshooting
                      purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
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

export default DiscountActivity;
