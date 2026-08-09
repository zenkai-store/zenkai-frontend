import React, { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import {
  Search,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  CreditCard,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  Truck,
  Check,
  Ban,
  RotateCcw,
  User,
  MapPin,
  FileText,
} from "lucide-react";

const OrderList = () => {
  // ======================= STATES =======================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // View modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // ======================= STATUS OPTIONS =======================
  const orderStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "returned", label: "Returned" },
  ];

  const paymentStatuses = [
    { value: "all", label: "All Payments" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "partially_refunded", label: "Partially Refunded" },
  ];

  // ======================= FETCH ORDERS =======================
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 20,
      };

      if (filterStatus !== "all") params.orderStatus = filterStatus;
      if (filterPayment !== "all") params.paymentStatus = filterPayment;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      // Search is not implemented on backend yet – we'll filter client‑side

      const response = await axiosClient.get(`/api/admin/orders`, {
        params,
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
        setPagination(
          response.data.pagination || { total: 0, page: 1, pages: 1 },
        );
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ======================= FETCH STATS =======================
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const params = {};
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await axiosClient.get(
        `/api/admin/orders/statistics/dashboard`,
        {
          params,
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setStatsError("Failed to load stats");
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStatsError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  };

  // ======================= EFFECTS =======================
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, filterStatus, filterPayment, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo]);

  // ======================= HELPER FUNCTIONS =======================
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: "yellow", label: "Pending" },
      confirmed: { color: "blue", label: "Confirmed" },
      processing: { color: "indigo", label: "Processing" },
      shipped: { color: "purple", label: "Shipped" },
      delivered: { color: "green", label: "Delivered" },
      cancelled: { color: "red", label: "Cancelled" },
      returned: { color: "gray", label: "Returned" },
    };
    const info = map[status] || { color: "gray", label: status };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${info.color}-500/10 text-${info.color}-400 border border-${info.color}-500/20`}
      >
        {info.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const map = {
      pending: { color: "yellow", label: "Pending" },
      paid: { color: "green", label: "Paid" },
      failed: { color: "red", label: "Failed" },
      refunded: { color: "gray", label: "Refunded" },
      partially_refunded: { color: "orange", label: "Partially Refunded" },
    };
    const info = map[status] || { color: "gray", label: status };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${info.color}-500/10 text-${info.color}-400 border border-${info.color}-500/20`}
      >
        {info.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "confirmed":
        return <CheckCircle size={14} />;
      case "processing":
        return <RefreshCw size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "delivered":
        return <Check size={14} />;
      case "cancelled":
        return <Ban size={14} />;
      case "returned":
        return <RotateCcw size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  // ======================= VIEW MODAL =======================
  const openViewModal = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedOrder(null);
  };

  // ======================= CLIENT‑SIDE SEARCH =======================
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(q) ||
      order.userId?.email?.toLowerCase().includes(q) ||
      order.userId?.name?.toLowerCase().includes(q)
    );
  });

  // ======================= STATS CARDS =======================
  const statsCards = stats
    ? [
        {
          title: "Total Orders",
          value: stats.totalOrders || 0,
          icon: ShoppingBag,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-500/10",
        },
        {
          title: "Total Revenue",
          value: formatCurrency(stats.totalRevenue || 0),
          icon: DollarSign,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-500/10",
        },
        {
          title: "Average Order Value",
          value: formatCurrency(stats.averageOrderValue || 0),
          icon: TrendingUp,
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-500/10",
        },
        {
          title: "Paid Orders",
          value: stats.paidOrders || 0,
          icon: CreditCard,
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-emerald-500/10",
        },
        {
          title: "Delivered Orders",
          value: stats.deliveredOrders || 0,
          icon: Truck,
          color: "from-indigo-500 to-blue-500",
          bgColor: "bg-indigo-500/10",
        },
      ]
    : [];

  // ======================= RENDER =======================
  return (
    <div className="space-y-6">
      {/* ======================= STATS CARDS ======================= */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-5 border border-gray-700 animate-pulse"
            >
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{statsError}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon
                      size={22}
                      className={`text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================= FILTERS ======================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, email or name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            {orderStatuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            {paymentStatuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
            placeholder="From"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
            placeholder="To"
          />

          <button
            onClick={() => {
              setCurrentPage(1);
              fetchOrders(1);
            }}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} />
          </button>

          <button
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Export CSV (coming soon)"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* ======================= ORDERS TABLE ======================= */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Order #
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Customer
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Date
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Total
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Payment
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Status
                </th>
                <th className="py-4 px-4 text-center text-gray-400 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                      <p className="text-red-400">{error}</p>
                      <button
                        onClick={() => fetchOrders(currentPage)}
                        className="mt-3 text-gray-400 hover:text-white text-sm"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 px-4">
                      <span className="text-white font-mono text-sm">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {order.userId?.name || "Guest"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {order.userId?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.orderStatus)}
                        {getStatusBadge(order.orderStatus)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => openViewModal(order)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= PAGINATION ======================= */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-gray-400">
            Page {currentPage} of {pagination.pages}
          </span>

          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ======================= VIEW ORDER MODAL ======================= */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={22} />
                  Order Details
                </h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {selectedOrder.orderNumber}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                  <User size={16} className="text-gray-400" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">
                      {selectedOrder.userId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">
                      {selectedOrder.userId?.email || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Shipping Address</p>
                    <p className="text-white text-sm">
                      {selectedOrder.addressSnapshot ? (
                        <>
                          {selectedOrder.addressSnapshot.fullName},{" "}
                          {selectedOrder.addressSnapshot.addressLine1}
                          {selectedOrder.addressSnapshot.addressLine2 &&
                            `, ${selectedOrder.addressSnapshot.addressLine2}`}
                          , {selectedOrder.addressSnapshot.city},{" "}
                          {selectedOrder.addressSnapshot.state} -{" "}
                          {selectedOrder.addressSnapshot.pincode}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-gray-400" />
                  Order Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Subtotal</p>
                    <p className="text-white font-medium">
                      {formatCurrency(selectedOrder.subtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Tax</p>
                    <p className="text-white font-medium">
                      {formatCurrency(selectedOrder.tax || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Shipping</p>
                    <p className="text-white font-medium">
                      {formatCurrency(selectedOrder.shippingCost || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Discount</p>
                    <p className="text-white font-medium">
                      {formatCurrency(selectedOrder.discount || 0)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="text-white font-bold text-lg">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Payment Method</p>
                    <p className="text-white text-sm capitalize">
                      {selectedOrder.paymentMethod || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Payment Status</p>
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Order Status</p>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-medium flex items-center gap-2 mb-3">
                  <ShoppingBag size={16} className="text-gray-400" />
                  Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0"
                    >
                      <div>
                        <p className="text-white text-sm">
                          {item.variantColor?.name || "Variant"} ×{" "}
                          {item.quantity}
                        </p>
                        <p className="text-gray-500 text-xs">
                          SKU: {item.variantSku || "N/A"}
                        </p>
                      </div>
                      <p className="text-white font-medium">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-gray-400" />
                    Notes
                  </h3>
                  <p className="text-gray-300 text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={closeViewModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition font-medium"
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

export default OrderList;
