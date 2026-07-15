import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import {
  getStoredUserData,
  setCachedUserData,
  setStoredUserData,
} from "../../utils/auth";

import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ShoppingBag,
  BadgeCheck,
  ArrowRight,
  Home,
  Phone,
  Mail,
  User,
  Layers,
  DollarSign,
  CreditCard,
  Box,
  Hash,
  Loader,
} from "lucide-react";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // ======================= AUTH CHECK =======================
  useEffect(() => {
    const checkAuth = async () => {
      const storedData = getStoredUserData();
      if (storedData) {
        setLoggedIn(true);
        return;
      }
      try {
        const response = await fetch(`${BASEURL}/api/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCachedUserData(data.user);
          setStoredUserData(data.user);
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setLoggedIn(false);
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // ======================= FETCH ORDER =======================
  useEffect(() => {
    const fetchOrder = async () => {
      if (!loggedIn || !orderId) return;
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${BASEURL}/api/orders/${orderId}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.error("Order fetch error:", err);
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
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

  const getOrderStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-500",
        icon: CheckCircle,
      },
      processing: {
        label: "Processing",
        color: "bg-purple-500",
        icon: RefreshCw,
      },
      shipped: { label: "Shipped", color: "bg-indigo-500", icon: Truck },
      delivered: { label: "Delivered", color: "bg-green-500", icon: Package },
      cancelled: { label: "Cancelled", color: "bg-red-500", icon: AlertCircle },
      returned: { label: "Returned", color: "bg-gray-500", icon: AlertCircle },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "bg-gray-500",
        icon: Package,
      }
    );
  };

  const getPaymentStatusDisplay = (status) => {
    const map = {
      pending: { label: "Pending", color: "text-yellow-600" },
      paid: { label: "Paid", color: "text-green-600" },
      failed: { label: "Failed", color: "text-red-600" },
      refunded: { label: "Refunded", color: "text-orange-600" },
    };
    return map[status] || { label: status, color: "text-gray-600" };
  };

  // ======================= STATUS PROGRESS STEPS =======================
  const getProgressSteps = (orderStatus) => {
    const allSteps = [
      { status: "pending", label: "Order Placed" },
      { status: "confirmed", label: "Confirmed" },
      { status: "processing", label: "Processing" },
      { status: "shipped", label: "Shipped" },
      { status: "delivered", label: "Delivered" },
    ];

    const currentIndex = allSteps.findIndex((s) => s.status === orderStatus);
    if (currentIndex === -1)
      return allSteps.map((s) => ({ ...s, active: false }));

    return allSteps.map((step, index) => ({
      ...step,
      active: index <= currentIndex,
      completed: index < currentIndex,
    }));
  };

  // ======================= SKELETON =======================
  const Skeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = order.orderStatus || "pending";
  const paymentStatus = order.paymentStatus || "pending";
  const progressSteps = getProgressSteps(orderStatus);
  const statusDisplay = getOrderStatusDisplay(orderStatus);
  const paymentDisplay = getPaymentStatusDisplay(paymentStatus);

  // Determine tracking URL if available
  const trackingUrl = order.trackingUrl || null;
  const trackingNumber = order.trackingNumber || null;

  return (
    <div className="min-h-screen bg-gray-50 font-lufga py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ======================= HEADER ======================= */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition group"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Order #{order.orderNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color} text-white`}
            >
              <statusDisplay.icon size={14} />
              {statusDisplay.label}
            </span>
          </div>
        </div>

        {/* ======================= SUCCESS HEADER ======================= */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-gray-600">
              Your order has been confirmed and will be processed shortly.
            </p>
            {order.estimatedDeliveryDate && (
              <p className="text-sm text-green-700 font-medium mt-1 flex items-center gap-1">
                <Truck size={14} />
                Estimated delivery: {formatDate(order.estimatedDeliveryDate)}
              </p>
            )}
          </div>
        </div>

        {/* ======================= ORDER SUMMARY ======================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} className="text-red-500" />
              Order Summary
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Items List */}
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <img
                    src={item.variantId?.media?.[0]?.url || "/placeholder.png"}
                    alt={item.productId?.name || "Product"}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
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
                      <span className="text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                <span className="text-gray-900">{formatPrice(order.tax)}</span>
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

        {/* ======================= DELIVERY & PAYMENT INFO ======================= */}
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
                <span className={`font-semibold ${paymentDisplay.color}`}>
                  {paymentDisplay.label}
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
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8 relative">
              {progressSteps.map((step, index) => {
                const Icon =
                  step.status === "pending"
                    ? Clock
                    : step.status === "confirmed"
                      ? CheckCircle
                      : step.status === "processing"
                        ? RefreshCw
                        : step.status === "shipped"
                          ? Truck
                          : step.status === "delivered"
                            ? Package
                            : Package;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                        step.active
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
                            step.active ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.completed && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                      {step.status === "shipped" && trackingNumber && (
                        <div className="mt-1 text-sm">
                          <span className="text-gray-500">Tracking:</span>{" "}
                          <span className="font-mono text-xs text-gray-700">
                            {trackingNumber}
                          </span>
                          {trackingUrl && (
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-500 hover:underline text-xs"
                            >
                              Track
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================= TRACKING (if available) ======================= */}
        {trackingUrl && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Track your order
                </p>
                <p className="text-xs text-gray-500">AWB: {trackingNumber}</p>
              </div>
            </div>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Track Now
              <ArrowRight size={14} />
            </a>
          </div>
        )}

        {/* ======================= ACTION BUTTONS ======================= */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition font-medium"
          >
            <Home size={18} />
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition shadow-lg shadow-red-500/25 font-medium"
          >
            <ShoppingBag size={18} />
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
