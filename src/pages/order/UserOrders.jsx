import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import { getStoredUserData } from "../../utils/auth";

import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  Clock,
  Eye,
  ArrowRight,
  CheckCircle,
  XCircle,
  User,
  Loader,
} from "lucide-react";

const UserOrders = () => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => !!getStoredUserData());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const limit = 10;

  // ======================= FETCH ORDERS =======================
  const fetchOrders = async (page = 1) => {
    if (!loggedIn) return;
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${BASEURL}/api/orders?page=${page}&limit=${limit}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setOrders(response.data.data || []);
        setTotalOrders(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setHasNextPage(page < response.data.pagination?.totalPages);
        setHasPrevPage(page > 1);
        setCurrentPage(page);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchOrders(currentPage);
    }
  }, [loggedIn, currentPage]);

  // ======================= PAGINATION =======================
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      month: "short",
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
      },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-500",
        textColor: "text-blue-700",
      },
      processing: {
        label: "Processing",
        color: "bg-purple-500",
        textColor: "text-purple-700",
      },
      shipped: {
        label: "Shipped",
        color: "bg-indigo-500",
        textColor: "text-indigo-700",
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-500",
        textColor: "text-green-700",
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-500",
        textColor: "text-red-700",
      },
      returned: {
        label: "Returned",
        color: "bg-gray-500",
        textColor: "text-gray-700",
      },
    };
    return (
      map[status] || {
        label: status,
        color: "bg-gray-500",
        textColor: "text-gray-700",
      }
    );
  };

  const getPaymentBadge = (status) => {
    const map = {
      pending: { label: "Pending", textColor: "text-yellow-600" },
      paid: { label: "Paid", textColor: "text-green-600" },
      failed: { label: "Failed", textColor: "text-red-600" },
      refunded: { label: "Refunded", textColor: "text-orange-600" },
    };
    return map[status] || { label: status, textColor: "text-gray-600" };
  };

  // ======================= SKELETON =======================
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );

  // ======================= NOT LOGGED IN =======================
  if (!loggedIn && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Login Required
          </h3>
          <p className="text-gray-500 mb-8">
            Please login to view your orders.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
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
          <button
            onClick={() => fetchOrders(currentPage)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ======================= TITLE ======================= */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag size={28} className="text-red-500" />
            My Orders
          </h1>
          <p className="text-gray-500 mt-1">
            {totalOrders} order{totalOrders !== 1 ? "s" : ""} placed
          </p>
        </div>

        {/* ======================= LOADING ======================= */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ======================= ERROR ======================= */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-500 mb-8">{error}</p>
            <button
              onClick={() => fetchOrders(currentPage)}
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* ======================= EMPTY STATE ======================= */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-500 mb-8">
              You haven't placed any orders yet. Start shopping today!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* ======================= ORDERS LIST ======================= */}
        {!loading && !error && orders.length > 0 && (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.orderStatus);
                const paymentBadge = getPaymentBadge(order.paymentStatus);
                const totalItems = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {formatDate(order.createdAt)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.textColor} bg-${statusBadge.color}/10`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusBadge.color}`}
                            ></span>
                            {statusBadge.label}
                          </span>
                          <span
                            className={`text-xs font-medium ${paymentBadge.textColor}`}
                          >
                            • {paymentBadge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {totalItems} item{totalItems !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 active:scale-95"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ======================= PAGINATION ======================= */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} className="text-gray-700" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show limited pages with ellipsis
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition text-sm font-medium ${
                            page === currentPage
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400 px-1">
                          …
                        </span>
                      );
                    }
                    return null;
                  },
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} className="text-gray-700" />
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Showing {orders.length} of {totalOrders} orders
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
