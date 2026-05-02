import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  DollarSign,
  Percent,
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
  ArrowLeft,
  Users,
  User,
  Tag,
  Copy,
  Check,
  Info,
  ShoppingBag,
  Truck,
  XCircle,
  PackageCheck,
  Image as ImageIcon,
  MessageCircle,
  Hash,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";

const TemplateDetails = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const token =
    localStorage.getItem("mm_admin_token") ||
    localStorage.getItem("mm_staff_token");

  // States
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedId, setCopiedId] = useState(null);

  // Fetch template details
  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${BASE_URL}/api/order-templates/${templateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setTemplate(response.data.template);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load template details. Please try again.",
      );
      console.error("Error fetching template details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails();
    }
  }, [templateId]);

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

  // Format date time
  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          color: "bg-amber-100 text-amber-700",
          icon: <Edit className="w-4 h-4" />,
          label: "Draft",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: <Clock className="w-4 h-4" />,
          label: "In Progress",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-700",
          icon: <XCircle className="w-4 h-4" />,
          label: "Cancelled",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: <FileText className="w-4 h-4" />,
          label: status,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  // Get item status color
  const getItemStatusInfo = (status) => {
    switch (status) {
      case "ADDED":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: <Package className="w-3 h-3" />,
          label: "Added",
        };
      case "CONFIRMED":
        return {
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Confirmed",
        };
      case "DELIVERING":
        return {
          color: "bg-purple-100 text-purple-700",
          icon: <Truck className="w-3 h-3" />,
          label: "Delivering",
        };
      case "DELIVERED":
        return {
          color: "bg-emerald-100 text-emerald-700",
          icon: <PackageCheck className="w-3 h-3" />,
          label: "Delivered",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-700",
          icon: <XCircle className="w-3 h-3" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: <Package className="w-3 h-3" />,
          label: status,
        };
    }
  };

  // Calculate total cost from items
  const calculateTotalCost = () => {
    if (!template?.items?.length) return "0.00";

    return template.items
      .reduce((total, item) => {
        const itemTotal =
          parseFloat(item.unit_price_snapshot || 0) * (item.quantity || 1);
        return total + itemTotal;
      }, 0)
      .toFixed(2);
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

  // Get sender color
  const getSenderColor = (senderRole) => {
    switch (senderRole) {
      case "STAFF":
        return "bg-blue-100 text-blue-700";
      case "USER":
        return "bg-purple-100 text-purple-700";
      case "ADMIN":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    navigate("/orderchat/list/all");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading template details...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching template data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToList}
              className="p-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Template Details
            </h1>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-center py-10">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {error ? "Failed to load template" : "Template not found"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {error || "The requested template could not be found."}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Templates
                </button>
                <button
                  onClick={fetchTemplateDetails}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(template.status);
  const totalCost = calculateTotalCost();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToList}
              className="p-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Back to templates"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {template.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color} flex items-center gap-1`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getCreatedByColor(template.created_by)}`}
                    >
                      Created by {template.created_by}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>ID: {template.id.substring(0, 8)}...</span>
                      <button
                        onClick={() => copyToClipboard(template.id)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Copy template ID"
                      >
                        {copiedId === template.id ? (
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
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTemplateDetails}
              className="p-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`px-5 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "items"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Items ({template.items?.length || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`px-5 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "chats"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat ({template.chats?.length || 0})
                {template.unread_messages > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {template.unread_messages}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-5 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "timeline"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
            </button>
          </div>
        </div>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Template Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Template Summary
                  </h3>

                  {template.description && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {template.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Total Cost</p>
                      <div className="text-3xl font-bold text-emerald-600">
                        {formatCurrency(totalCost)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Calculated from {template.items?.length || 0} items
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} flex items-center gap-2`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        {template.finalized_at && (
                          <div className="text-sm text-gray-600">
                            Finalized: {formatDate(template.finalized_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {template.items?.length || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Chat Messages</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {template.chats?.length || 0}
                        </p>
                        {template.unread_messages > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {template.unread_messages} unread
                          </p>
                        )}
                      </div>
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Created By</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {template.created_by}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Created</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(template.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Last Updated
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(template.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {template.finalized_at && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Finalized
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(template.finalized_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Items Tab */}
            {activeTab === "items" && (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Items ({template.items?.length || 0})
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Total value: {formatCurrency(totalCost)}
                    </p>
                  </div>

                  {!template.items || template.items.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        No items added yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        This template doesn't contain any products
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {template.items.map((item, index) => {
                        const itemStatusInfo = getItemStatusInfo(item.status);
                        const itemTotal =
                          parseFloat(item.unit_price_snapshot || 0) *
                          (item.quantity || 1);

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Product Info */}
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                                      {item.product_name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${itemStatusInfo.color} flex items-center gap-1`}
                                      >
                                        {itemStatusInfo.icon}
                                        {itemStatusInfo.label}
                                      </span>
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                        Qty: {item.quantity}
                                      </span>
                                      {item.brand_name && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                          {item.brand_name}
                                        </span>
                                      )}
                                    </div>

                                    {/* Product Codes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Product Code
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-sm text-gray-900">
                                            {item.product_code}
                                          </span>
                                          <button
                                            onClick={() =>
                                              copyToClipboard(item.product_code)
                                            }
                                            className="text-gray-400 hover:text-emerald-600 transition-colors"
                                            title="Copy product code"
                                          >
                                            {copiedId === item.product_code ? (
                                              <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Sub Code
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-sm text-gray-900">
                                            {item.sub_code}
                                          </span>
                                          <button
                                            onClick={() =>
                                              copyToClipboard(item.sub_code)
                                            }
                                            className="text-gray-400 hover:text-emerald-600 transition-colors"
                                            title="Copy sub code"
                                          >
                                            {copiedId === item.sub_code ? (
                                              <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      {(item.colour_name ||
                                        item.finish_name) && (
                                        <div className="space-y-2">
                                          {item.colour_name && (
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Color
                                              </p>
                                              <p className="text-sm font-medium text-gray-900">
                                                {item.colour_name}
                                              </p>
                                            </div>
                                          )}
                                          {item.finish_name && (
                                            <div>
                                              <p className="text-xs text-gray-500">
                                                Finish
                                              </p>
                                              <p className="text-sm font-medium text-gray-900">
                                                {item.finish_name}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Unit Price
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                          {formatCurrency(
                                            item.unit_price_snapshot,
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Current MRP:{" "}
                                          {formatCurrency(item.current_mrp)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Item Total */}
                                  <div className="lg:text-right">
                                    <p className="text-2xl font-bold text-emerald-600">
                                      {formatCurrency(itemTotal)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {item.quantity} ×{" "}
                                      {formatCurrency(item.unit_price_snapshot)}
                                    </p>
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Added By
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${item.added_by === "STAFF" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                                      >
                                        {item.added_by}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {formatDate(item.added_at)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Last Status Update
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatDateTime(item.last_status_date)}
                                    </p>
                                  </div>
                                </div>

                                {/* Notes */}
                                {item.notes && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">
                                      Notes
                                    </p>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl">
                                      {item.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Chats Tab */}
            {activeTab === "chats" && (
              <motion.div
                key="chats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Chat Messages ({template.chats?.length || 0})
                        </h3>
                        {template.unread_messages > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {template.unread_messages} unread messages
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!template.chats || template.chats.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        No chat messages yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Start a conversation by sending a message
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {template.chats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-6 ${chat.sender_role === "USER" ? "bg-blue-50/30" : ""}`}
                        >
                          <div className="flex gap-4">
                            {/* Sender Avatar */}
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${getSenderColor(chat.sender_role).replace("text-", "bg-").replace("-700", "-600")} text-white`}
                              >
                                {chat.sender_name.charAt(0)}
                              </div>
                            </div>

                            {/* Message Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {chat.sender_name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${getSenderColor(chat.sender_role)}`}
                                  >
                                    {chat.sender_role}
                                  </span>
                                  {!chat.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDateTime(chat.created_at)}
                                </div>
                              </div>

                              {/* Message */}
                              <div className="mb-3">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                  {chat.message}
                                </p>
                              </div>

                              {/* Attachments */}
                              {chat.attachments &&
                                chat.attachments.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">
                                      Attachments
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {chat.attachments.map(
                                        (attachment, idx) => (
                                          <div
                                            key={idx}
                                            className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
                                          >
                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                              {attachment.filename ||
                                                `Attachment ${idx + 1}`}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Message Type */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                  Type: {chat.message_type}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    ID: {chat.id.substring(0, 8)}...
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(chat.id)}
                                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                                    title="Copy message ID"
                                  >
                                    {copiedId === chat.id ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Complete Timeline
                  </h3>

                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-8">
                      {/* Template Creation */}
                      <div className="relative pl-16">
                        <div className="absolute left-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">
                              Template Created
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(template.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            Template "{template.title}" was created by{" "}
                            {template.created_by}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${getCreatedByColor(template.created_by)}`}
                            >
                              Created by {template.created_by}
                            </span>
                            <span className="text-xs text-gray-500">
                              Template ID: {template.id.substring(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Staff Assignment (if assigned) */}
                      {template.staff_id && (
                        <div className="relative pl-16">
                          <div className="absolute left-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">
                                Staff Assigned
                              </h4>
                              <span className="text-sm text-gray-500">
                                Assigned to staff
                              </span>
                            </div>
                            <p className="text-gray-600">
                              Template assigned to {template.staff_name} (
                              {template.staff_email})
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                Staff ID: {template.staff_id.substring(0, 12)}
                                ...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items Added */}
                      {template.items &&
                        template.items.map((item, index) => (
                          <div key={item.id} className="relative pl-16">
                            <div className="absolute left-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600" />
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-900">
                                  Item Added
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(item.added_at)}
                                </span>
                              </div>
                              <p className="text-gray-600">
                                {item.quantity} × {item.product_name} added by{" "}
                                {item.added_by}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${getItemStatusInfo(item.status).color}`}
                                >
                                  {item.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Code: {item.product_code}
                                </span>
                                <span className="text-xs font-medium text-gray-900">
                                  {formatCurrency(
                                    parseFloat(item.unit_price_snapshot) *
                                      item.quantity,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Chat Messages Count */}
                      {template.chats && template.chats.length > 0 && (
                        <div className="relative pl-16">
                          <div className="absolute left-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-indigo-600" />
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">
                                Chat Activity
                              </h4>
                              <span className="text-sm text-gray-500">
                                {template.chats.length} messages
                              </span>
                            </div>
                            <p className="text-gray-600">
                              {template.chats.length} chat messages exchanged
                            </p>
                            {template.unread_messages > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-sm text-red-600">
                                  {template.unread_messages} unread messages
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Template Finalized */}
                      {template.finalized_at && (
                        <div className="relative pl-16">
                          <div className="absolute left-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-gray-900">
                                Template Finalized
                              </h4>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(template.finalized_at)}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              Template marked as {template.status}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.color}`}
                              >
                                Status: {template.status}
                              </span>
                              <span className="text-sm text-gray-900 font-medium">
                                Total: {formatCurrency(totalCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Last Update */}
                      <div className="relative pl-16">
                        <div className="absolute left-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">
                              Last Updated
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(template.updated_at)}
                            </span>
                          </div>
                          <p className="text-gray-600">Template last updated</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* User Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">
                  {template.user_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {template.user_email || "N/A"}
                </p>
              </div>
              {template.user_phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">
                    {template.user_phone}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">User ID</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-900 truncate">
                    {template.user_id.substring(0, 16)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(template.user_id)}
                    className="text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                    title="Copy user ID"
                  >
                    {copiedId === template.user_id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Information
            </h3>
            {template.staff_id ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">
                    {template.staff_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">
                    {template.staff_email || "N/A"}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Staff ID</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900 truncate">
                      {template.staff_id.substring(0, 16)}...
                    </span>
                    <button
                      onClick={() => copyToClipboard(template.staff_id)}
                      className="text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                      title="Copy staff ID"
                    >
                      {copiedId === template.staff_id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No staff assigned</p>
                <p className="text-sm text-gray-500 mt-1">
                  This template is not assigned to any staff member
                </p>
              </div>
            )}
          </div>

          {/* Template Metadata Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Template Metadata
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Template ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-900">
                    {template.id.substring(0, 12)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(template.id)}
                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Copy template ID"
                  >
                    {copiedId === template.id ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created By</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getCreatedByColor(template.created_by)}`}
                >
                  {template.created_by}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.color}`}
                >
                  {template.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="font-medium text-gray-900">
                  {template.items?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Chat Messages</span>
                <span className="font-medium text-gray-900">
                  {template.chats?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800 mb-1">
              Template Details Information
            </p>
            <p className="text-sm text-emerald-700">
              • This page shows complete details of the order-chat template
              <br />
              • Switch between tabs to view Overview, Items, Chat, and Timeline
              <br />
              • All costs are displayed in Indian Rupees (₹)
              <br />• Click on any ID to copy it to clipboard for reference
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetails;
