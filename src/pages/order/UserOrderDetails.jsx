import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../utils/axiosClient";
import { getStoredUserData } from "../../utils/auth";

import {
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ShoppingBag,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  Home,
  CreditCard,
  DollarSign,
  Box,
  Hash,
  Layers,
  ArrowRight,
  Eye,
} from "lucide-react";

const UserOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => !!getStoredUserData());

  // ======================= FETCH ORDER =======================
  useEffect(() => {
    const fetchOrder = async () => {
      if (!loggedIn || !orderId) return;
      try {
        setLoading(true);
        setError("");
        const response = await axiosClient.get(`/api/orders/${orderId}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.error("Order details fetch error:", err);
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [loggedIn, orderId, navigate]);

  // ======================= FORMAT FUNCTIONS =======================
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: {
        label: "Pending",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgLight: "bg-yellow-50",
      },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgLight: "bg-blue-50",
      },
      processing: {
        label: "Processing",
        color: "bg-purple-500",
        textColor: "text-purple-700",
        bgLight: "bg-purple-50",
      },
      shipped: {
        label: "Shipped",
        color: "bg-indigo-500",
        textColor: "text-indigo-700",
        bgLight: "bg-indigo-50",
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgLight: "bg-green-50",
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-500",
        textColor: "text-red-700",
        bgLight: "bg-red-50",
      },
      returned: {
        label: "Returned",
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgLight: "bg-gray-50",
      },
    };
    return (
      map[status] || {
        label: status,
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgLight: "bg-gray-50",
      }
    );
  };

  const getPaymentBadge = (status) => {
    const map = {
      pending: {
        label: "Pending",
        textColor: "text-yellow-600",
        bgLight: "bg-yellow-50",
      },
      paid: {
        label: "Paid",
        textColor: "text-green-600",
        bgLight: "bg-green-50",
      },
      failed: {
        label: "Failed",
        textColor: "text-red-600",
        bgLight: "bg-red-50",
      },
      refunded: {
        label: "Refunded",
        textColor: "text-orange-600",
        bgLight: "bg-orange-50",
      },
    };
    return (
      map[status] || {
        label: status,
        textColor: "text-gray-600",
        bgLight: "bg-gray-50",
      }
    );
  };

  // ======================= SKELETON =======================
  const Skeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // ======================= MAIN RENDER =======================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500 mb-8">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
          >
            <ShoppingBag size={18} />
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.orderStatus);
  const paymentBadge = getPaymentBadge(order.paymentStatus);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Build status history steps
  const statusHistory = order.statusHistory || [];
  const statusSteps = [
    { key: "pending", label: "Order Placed", date: order.createdAt },
    {
      key: "confirmed",
      label: "Confirmed",
      date:
        statusHistory.find((s) => s.newStatus === "confirmed")?.createdAt ||
        null,
    },
    {
      key: "processing",
      label: "Processing",
      date:
        statusHistory.find((s) => s.newStatus === "processing")?.createdAt ||
        null,
    },
    {
      key: "shipped",
      label: "Shipped",
      date:
        statusHistory.find((s) => s.newStatus === "shipped")?.createdAt || null,
    },
    {
      key: "delivered",
      label: "Delivered",
      date:
        statusHistory.find((s) => s.newStatus === "delivered")?.createdAt ||
        null,
    },
  ];

  // Determine current step index
  let currentStepIndex = statusSteps.findIndex(
    (s) => s.key === order.orderStatus,
  );
  if (currentStepIndex === -1) {
    // If status is not in the list (e.g., cancelled), map it manually
    if (order.orderStatus === "cancelled") {
      currentStepIndex = -1; // We'll show a special state
    } else {
      currentStepIndex = 0;
    }
  }

  // For cancelled, we'll show a special message
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 font-lufga py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ======================= HEADER ======================= */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition group"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Order #{order.orderNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.textColor} ${statusBadge.bgLight}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusBadge.color}`}
              ></span>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* ======================= ORDER SUMMARY ======================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} className="text-red-500" />
              Order Summary
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Placed: {formatDate(order.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Package size={14} />
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                Total: {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="p-6 space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <img
                  src={item.variantId?.media?.[0]?.url || "/placeholder.png"}
                  alt={item.productId?.name || "Product"}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/100x100?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {item.productId?.name || "Product"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.variantColor?.code }}
                    />
                    <span className="text-xs text-gray-500">
                      {item.variantColor?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      SKU: {item.variantSku}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                    <span className="text-xs text-gray-400">
                      (₹{formatPrice(item.unitPrice)} each)
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Order Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">
                  {formatPrice(order.tax || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-red-500">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= ADDRESS & PAYMENT ======================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-red-500" />
              Delivery Address
            </h3>
            {order.addressSnapshot ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {order.addressSnapshot.fullName}
                </p>
                <p>{order.addressSnapshot.addressLine1}</p>
                {order.addressSnapshot.addressLine2 && (
                  <p>{order.addressSnapshot.addressLine2}</p>
                )}
                <p>
                  {order.addressSnapshot.city}, {order.addressSnapshot.state} -{" "}
                  {order.addressSnapshot.pincode}
                </p>
                <p className="flex items-center gap-1">
                  <Phone size={14} />
                  {order.addressSnapshot.phone}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Address not available</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-blue-500" />
              Payment Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${paymentBadge.textColor}`}>
                  {paymentBadge.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900">
                  {order.paymentMethod === "razorpay"
                    ? "Razorpay"
                    : order.paymentMethod}
                </span>
              </div>
              {order.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Razorpay Order ID</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {order.razorpayOrderId}
                  </span>
                </div>
              )}
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {order.paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= ORDER PROGRESS ======================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Clock size={18} className="text-purple-500" />
            Order Progress
          </h3>

          {isCancelled ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-700 font-medium">Order Cancelled</p>
              {order.cancellationReason && (
                <p className="text-sm text-gray-500 mt-1">
                  Reason: {order.cancellationReason}
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8 relative">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  const Icon =
                    step.key === "pending"
                      ? Clock
                      : step.key === "confirmed"
                        ? CheckCircle
                        : step.key === "processing"
                          ? RefreshCw
                          : step.key === "shipped"
                            ? Truck
                            : step.key === "delivered"
                              ? Package
                              : Package;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                          isActive
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </span>
                          {isCompleted && (
                            <CheckCircle size={14} className="text-green-500" />
                          )}
                        </div>
                        {step.date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ======================= TRACKING (if available) ======================= */}
        {order.trackingNumber && order.trackingUrl && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Track your order
                </p>
                <p className="text-xs text-gray-500">
                  AWB: {order.trackingNumber}
                </p>
              </div>
            </div>
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Track Now
              <ArrowRight size={14} />
            </a>
          </div>
        )}

        {/* ======================= STATUS HISTORY (optional) ======================= */}
        {statusHistory.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock size={18} className="text-gray-400" />
              Status History
            </h3>
            <div className="space-y-3">
              {statusHistory.map((history, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                >
                  <span className="text-gray-500 w-24 flex-shrink-0">
                    {formatDate(history.createdAt)}
                  </span>
                  <span className="font-medium text-gray-900">
                    {history.newStatus.charAt(0).toUpperCase() +
                      history.newStatus.slice(1)}
                  </span>
                  {history.notes && (
                    <span className="text-gray-500 text-xs">
                      – {history.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= ACTIONS ======================= */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition font-medium"
          >
            <ShoppingBag size={18} />
            All Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition shadow-lg shadow-red-500/25 font-medium"
          >
            <Home size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
