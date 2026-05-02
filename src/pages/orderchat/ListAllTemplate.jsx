import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  User,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Shield,
  MessageSquare,
  Package,
  Edit,
  Eye,
  RefreshCw,
  ArrowRight,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";

const ListAllTemplates = () => {
  const token =
    localStorage.getItem("mm_admin_token") ||
    localStorage.getItem("mm_staff_token");

  // States
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
    has_next_page: false,
    has_prev_page: false,
    next_page: null,
    prev_page: null,
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [staffIdInput, setStaffIdInput] = useState("");
  const [assignType, setAssignType] = useState("self");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = !!localStorage.getItem("mm_admin_token");

  // Decode JWT token to get user info
  const getCurrentUserInfo = () => {
    try {
      const token =
        localStorage.getItem("mm_admin_token") ||
        localStorage.getItem("mm_staff_token");
      if (!token) return null;

      const decoded = jwtDecode(token);
      return {
        id: decoded.userId || decoded.id || decoded.sub,
        role:
          decoded.role ||
          (localStorage.getItem("mm_admin_token") ? "ADMIN" : "STAFF"),
        name: decoded.name || decoded.email || "User",
      };
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  // Fetch all templates
  const fetchAllTemplates = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${BASE_URL}/api/order-templates/admin/all?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const templateData = response.data.date || [];
      setTemplates(templateData);
      setPagination(
        response.data.pagination || {
          current_page: 1,
          per_page: 20,
          total_items: templateData.length,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
          next_page: null,
          prev_page: null,
        },
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load order templates. Please try again.",
      );
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTemplates();
  }, []);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: <Edit className="w-3 h-3" />,
          label: "Draft",
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: <Clock className="w-3 h-3" />,
          label: "In Progress",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-700",
          icon: <AlertCircle className="w-3 h-3" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: <FileText className="w-3 h-3" />,
          label: status,
        };
    }
  };

  // Get created by color
  const getCreatedByColor = (createdBy) => {
    switch (createdBy) {
      case "STAFF":
        return "bg-blue-100 text-blue-700";
      case "USER":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.total_pages) {
      fetchAllTemplates(page);
    }
  };

  // Handle assign/transfer action
  const handleAssignTransfer = (template) => {
    setSelectedTemplate(template);
    setStaffIdInput("");
    setAssignType("self");
    setAcceptTerms(false);
    setShowAssignModal(true);
  };

  // Assign staff to template
  const handleAssignStaff = async () => {
    try {
      if (!selectedTemplate) return;

      setActionLoading("assign");

      const currentUser = getCurrentUserInfo();
      if (!currentUser) {
        throw new Error("Unable to get user information");
      }

      let staffIdToAssign;

      if (assignType === "self") {
        // For staff: assign to themselves
        if (currentUser.role === "STAFF") {
          staffIdToAssign = currentUser.id;
        } else {
          // For admin assigning to themselves (if needed)
          staffIdToAssign = currentUser.id;
        }
      } else {
        // For admin: use input staff ID
        if (!staffIdInput.trim()) {
          setError("Please enter a valid Staff ID");
          return;
        }
        staffIdToAssign = staffIdInput.trim();
      }

      const response = await axios.post(
        `${BASE_URL}/api/order-templates/${selectedTemplate.id}/assign-staff`,
        {
          staff_id: staffIdToAssign,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSuccess(`Template successfully assigned to staff!`);
      setShowAssignModal(false);
      fetchAllTemplates(pagination.current_page); // Refresh list
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to assign staff to template",
      );
    } finally {
      setActionLoading("");
    }
  };

  // Handle view details
  const handleViewDetails = (template) => {
    navigate(`/orderchat/template/details/${template.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order-Chat Templates
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all order templates created by staff and customers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAllTemplates(pagination.current_page)}
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
          className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                About Order-Chat Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Collaborative Templates
                    </p>
                    <p className="text-sm text-gray-600">
                      These templates help users create orders and can be edited
                      by both staff and customers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Platform Templates
                    </p>
                    <p className="text-sm text-gray-600">
                      All templates on Modern Mahal platform created by STAFF or
                      CUSTOMER with status and details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Staff Assignment
                    </p>
                    <p className="text-sm text-gray-600">
                      Templates can be assigned to any staff. If already
                      assigned, use TRANSFER button.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">
                      4
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Admin-Only Features
                    </p>
                    <p className="text-sm text-gray-600">
                      Details button is visible only to ADMIN users for
                      additional control and monitoring.
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
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination.total_items}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <FileText className="w-6 h-6 text-emerald-600" />
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
              <p className="text-sm text-gray-600">Draft Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {templates.filter((t) => t.status === "DRAFT").length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Edit className="w-6 h-6 text-amber-600" />
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
              <p className="text-sm text-gray-600">Completed Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {templates.filter((t) => t.status === "COMPLETED").length}
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
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {templates.filter((t) => !t.staff_id).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg">Loading order templates...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching template data</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-600 text-lg mb-2">
              Failed to load templates
            </p>
            <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAllTemplates(1)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && templates.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <FileText className="w-20 h-20 text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-2">No templates found</p>
            <p className="text-gray-500 mb-6 max-w-md text-center">
              No order-chat templates have been created yet
            </p>
          </div>
        )}

        {/* Templates List */}
        <AnimatePresence>
          {!loading && !error && templates.length > 0 && (
            <div className="divide-y divide-gray-100">
              {templates.map((template) => {
                const statusInfo = getStatusInfo(template.status);
                const isAssigned = !!template.staff_id;

                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Section - Template Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {template.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} flex items-center gap-1`}
                                >
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getCreatedByColor(template.created_by)}`}
                                >
                                  {template.created_by}
                                </span>
                              </div>
                            </div>

                            {template.description && (
                              <p className="text-gray-600 mb-3">
                                {template.description}
                              </p>
                            )}

                            {/* Template ID */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-sm text-gray-500">
                                Template ID:
                              </span>
                              <span className="font-mono text-sm text-gray-700">
                                {template.id.substring(0, 16)}...
                              </span>
                              <button
                                onClick={() => copyToClipboard(template.id)}
                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                                title="Copy template ID"
                              >
                                {copiedId === template.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Cost and Items */}
                          <div className="flex flex-col items-end">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              {formatCurrency(template.total_cost)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>{template.item_count} items</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{template.chat_count} messages</span>
                              </div>
                              {template.unread_messages > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                  <span className="text-red-600 font-medium">
                                    {template.unread_messages} unread
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* User and Staff Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          {/* User Information */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Customer
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Order created for
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">
                                  {template.user_name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">
                                  {template.user_email || "N/A"}
                                </p>
                              </div>
                              {template.user_phone && (
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="font-medium text-gray-900">
                                    {template.user_phone}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                  User ID:
                                </span>
                                <span className="text-xs font-mono text-gray-700">
                                  {template.user_id.substring(0, 12)}...
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(template.user_id)
                                  }
                                  className="text-gray-400 hover:text-purple-600 transition-colors"
                                  title="Copy user ID"
                                >
                                  {copiedId === template.user_id ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Staff Information */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {isAssigned ? "Assigned Staff" : "Unassigned"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {isAssigned
                                    ? "Currently handling this order"
                                    : "No staff assigned yet"}
                                </p>
                              </div>
                            </div>
                            {isAssigned ? (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">Name</p>
                                  <p className="font-medium text-gray-900">
                                    {template.staff_name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="font-medium text-gray-900">
                                    {template.staff_email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                  <span className="text-xs text-gray-500">
                                    Staff ID:
                                  </span>
                                  <span className="text-xs font-mono text-gray-700">
                                    {template.staff_id.substring(0, 12)}...
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(template.staff_id)
                                    }
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Copy staff ID"
                                  >
                                    {copiedId === template.staff_id ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium mb-1">
                                  No staff assigned
                                </p>
                                <p className="text-sm">
                                  This template is not assigned to any staff
                                  member
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(template.created_at)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(template.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Clock className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Last Updated
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDate(template.updated_at)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(template.updated_at)}
                              </p>
                            </div>
                          </div>

                          {template.finalized_at && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Finalized
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(template.finalized_at)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(template.finalized_at)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Action Buttons */}
                      <div className="lg:w-48 flex flex-col gap-3">
                        {/* Assign/Transfer Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAssignTransfer(template)}
                          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                            isAssigned
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                          }`}
                        >
                          {isAssigned ? (
                            <>
                              <ArrowRight className="w-4 h-4" />
                              TRANSFER
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4" />
                              ASSIGN
                            </>
                          )}
                        </motion.button>

                        {/* Details Button (Admin Only) */}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleViewDetails(template)}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            DETAILS
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Pagination Footer */}
        {!loading && templates.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {(pagination.current_page - 1) * pagination.per_page + 1}-
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total_items,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.total_items}
                </span>{" "}
                templates
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev_page}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    pagination.has_prev_page
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.current_page >=
                        pagination.total_pages - 2
                      ) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }

                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                            pagination.current_page === pageNum
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    },
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next_page}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    pagination.has_next_page
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </motion.button>
              </div>

              <div className="text-sm text-gray-600">
                Page{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.current_page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.total_pages}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800 mb-1">
              Template Management Notes
            </p>
            <p className="text-sm text-emerald-700">
              • ASSIGN button appears for unassigned templates to assign them to
              staff
              <br />
              • TRANSFER button appears for assigned templates to transfer them
              to another staff
              <br />
              • DETAILS button is only visible to ADMIN users for additional
              control
              <br />• Use the refresh button to get the latest template status
              and updates
            </p>
          </div>
        </div>
      </div>
      {/* ======================= ASSIGN STAFF MODAL ======================= */}
      {showAssignModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
              <h2 className="text-xl font-bold text-white">Assign Template</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {selectedTemplate.staff_id
                  ? "Transfer to another staff"
                  : "Assign to staff member"}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Template Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {selectedTemplate.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ID: {selectedTemplate.id.substring(0, 12)}...
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">
                      {selectedTemplate.user_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusInfo(selectedTemplate.status).color}`}
                    >
                      {getStatusInfo(selectedTemplate.status).label}
                    </span>
                  </div>
                  {selectedTemplate.staff_id && (
                    <div className="flex justify-between">
                      <span>Currently Assigned:</span>
                      <span className="font-medium">
                        {selectedTemplate.staff_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Type (Only for Admin) */}
              {isAdmin && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Assignment Type</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAssignType("self")}
                      className={`p-4 rounded-xl border-2 transition-all ${assignType === "self" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${assignType === "self" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                        >
                          {assignType === "self" && (
                            <Check className="w-3 h-3 text-white mx-auto mt-0.5" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Self Assign
                          </p>
                          <p className="text-xs text-gray-500">
                            Assign to yourself
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setAssignType("other")}
                      className={`p-4 rounded-xl border-2 transition-all ${assignType === "other" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${assignType === "other" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                        >
                          {assignType === "other" && (
                            <Check className="w-3 h-3 text-white mx-auto mt-0.5" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Other Staff
                          </p>
                          <p className="text-xs text-gray-500">
                            Assign to another staff
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Staff ID Input (Only for Other Staff option) */}
                  {assignType === "other" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        placeholder="Enter staff ID (e.g., f897e278-c6cc-4e04-a196...)"
                        value={staffIdInput}
                        onChange={(e) => setStaffIdInput(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the exact Staff ID you want to assign this
                        template to
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info for Staff */}
              {!isAdmin && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Staff Assignment
                      </p>
                      <p className="text-sm text-blue-700">
                        This order-chat template will be assigned to you. You
                        will be responsible for managing this customer's order
                        and communications.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-700"
                  >
                    <span className="font-medium">I confirm and accept:</span> I
                    understand that by assigning this template,
                    {isAdmin
                      ? " I am assigning responsibility to the selected staff member."
                      : " I am taking responsibility for managing this customer's order and communications."}{" "}
                    This action will notify the customer.
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAcceptTerms(false);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading === "assign"}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                disabled={
                  actionLoading === "assign" ||
                  !acceptTerms ||
                  (isAdmin && assignType === "other" && !staffIdInput.trim())
                }
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === "assign" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedTemplate.staff_id ? (
                  "Transfer Template"
                ) : (
                  "Assign Template"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListAllTemplates;
