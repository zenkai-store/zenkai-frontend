import React, { useState, useEffect, useCallback, useRef } from "react";import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import {
  ArrowLeft,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Package,
  Truck,
  Clock,
  CheckCircle,
  Ban,
  RotateCcw,
  Eye,
  User,
  MapPin,
  IndianRupee,
  Filter,
} from "lucide-react";

const LIMIT = 20;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ORDER_STATUS_STYLES = {
  pending: { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", icon: <Clock size={11} /> },
  confirmed: { cls: "bg-blue-500/15 text-blue-400 border-blue-500/25", icon: <CheckCircle size={11} /> },
  processing: { cls: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25", icon: <RefreshCw size={11} /> },
  shipped: { cls: "bg-purple-500/15 text-purple-400 border-purple-500/25", icon: <Truck size={11} /> },
  delivered: { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: <CheckCircle size={11} /> },
  cancelled: { cls: "bg-red-500/15 text-red-400 border-red-500/25", icon: <Ban size={11} /> },
  returned: { cls: "bg-gray-500/15 text-gray-400 border-gray-500/25", icon: <RotateCcw size={11} /> },
};

const PAYMENT_STATUS_STYLES = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  failed: "bg-red-500/15 text-red-400 border-red-500/25",
  refunded: "bg-gray-500/15 text-gray-400 border-gray-500/25",
  partially_refunded: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

const StatusBadge = ({ value, styleMap, fallback = "—" }) => {
  if (!value) return <span className="text-gray-600 text-xs">{fallback}</span>;
  const s = styleMap[value] || "bg-gray-700 text-gray-400 border-gray-600";
  const style = typeof s === "object" ? s : { cls: s, icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.cls}`}>
      {style.icon}
      <span className="capitalize">{value.replace(/_/g, " ")}</span>
    </span>
  );
};

const CustomerOrders = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const abortRef = useRef(null);

  // Fetch customer info once
  useEffect(() => {
    if (!userId) return;
    setCustomerLoading(true);
    axiosClient
      .get(`/api/admin/customers/${userId}`)
      .then((res) => {
        if (res.data.success) setCustomer(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch customer:", err))
      .finally(() => setCustomerLoading(false));
  }, [userId]);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const params = { page: currentPage, limit: LIMIT, sortBy: "createdAt", sortOrder: "desc" };
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterPayment !== "all") params.paymentStatus = filterPayment;

      const response = await axiosClient.get(`/api/admin/customers/${userId}/orders`, {
        params,
        signal: controller.signal,
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
        setPagination(
          response.data.pagination || {
            total: 0, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false,
          }
        );
      } else {
        setError("Failed to fetch orders.");
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("CustomerOrders fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage, filterStatus, filterPayment]);

  useEffect(() => {
    fetchOrders();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchOrders]);

  // Reset to page 1 when filters change
  const handleFilterStatus = (val) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };
  const handleFilterPayment = (val) => {
    setFilterPayment(val);
    setCurrentPage(1);
  };

  const pageWindow = () => {
    const total = pagination.totalPages;
    const cur = currentPage;
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      range.push(i);
    }
    return range;
  };

  const customerName = customer?.name || customer?.email || "Customer";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6 font-lufga">

      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/customers/list")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-4 group"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 group-hover:bg-gray-700 border border-gray-700 transition">
            <ArrowLeft size={14} />
          </span>
          Back to Customers
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 bg-blue-500 rounded" />
              <h1 className="text-2xl font-bold tracking-tight">
                {customerLoading ? (
                  <span className="inline-block w-40 h-6 bg-gray-800 rounded animate-pulse" />
                ) : (
                  `${customerName}'s Orders`
                )}
              </h1>
            </div>
            {customer && (
              <div className="flex flex-wrap items-center gap-3 ml-4 text-sm text-gray-400">
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-gray-600" />
                    {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="text-gray-600">·</span>
                )}
                {customer.phone && <span>{customer.phone}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!loading && (
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 text-xs font-semibold">
                {pagination.total} order{pagination.total !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-3 h-9 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-gray-500 shrink-0" />
          <span className="text-xs text-gray-500 font-medium">Filters:</span>
        </div>

        {/* Order status filter */}
        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>

        {/* Payment status filter */}
        <select
          value={filterPayment}
          onChange={(e) => handleFilterPayment(e.target.value)}
          className="h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
        >
          <option value="all">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>

        {/* Clear filters */}
        {(filterStatus !== "all" || filterPayment !== "all") && (
          <button
            onClick={() => { handleFilterStatus("all"); handleFilterPayment("all"); }}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-gray-800 border border-gray-700 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-5 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchOrders} className="ml-auto underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Items
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-gray-800 animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    <ShoppingBag size={40} className="mx-auto mb-3 text-gray-700" />
                    <p>
                      {filterStatus !== "all" || filterPayment !== "all"
                        ? "No orders match the selected filters."
                        : `${customerName} has not placed any orders yet.`}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onViewDetails={() => setSelectedOrder(order)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-800 bg-gray-900">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="text-gray-300 font-medium">
                {(currentPage - 1) * LIMIT + 1}–
                {Math.min(currentPage * LIMIT, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="text-gray-300 font-medium">{pagination.total}</span>{" "}
              orders
            </p>

            <div className="flex items-center gap-1">
              <PageBtn
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </PageBtn>

              {currentPage > 3 && (
                <>
                  <PageBtn onClick={() => setCurrentPage(1)}>1</PageBtn>
                  {currentPage > 4 && <span className="px-1 text-gray-600 text-xs">…</span>}
                </>
              )}

              {pageWindow().map((p) => (
                <PageBtn
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  active={p === currentPage}
                >
                  {p}
                </PageBtn>
              ))}

              {currentPage < pagination.totalPages - 2 && (
                <>
                  {currentPage < pagination.totalPages - 3 && (
                    <span className="px-1 text-gray-600 text-xs">…</span>
                  )}
                  <PageBtn onClick={() => setCurrentPage(pagination.totalPages)}>
                    {pagination.totalPages}
                  </PageBtn>
                </>
              )}

              <PageBtn
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

// ── OrderRow ──────────────────────────────────────────────────────────────────

const OrderRow = ({ order, onViewDetails }) => {
  const itemCount = order.items
    ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      {/* Order number */}
      <td className="px-4 py-3">
        <p className="font-mono text-xs font-semibold text-gray-200">
          {order.orderNumber || `#${String(order._id).slice(-8).toUpperCase()}`}
        </p>
        <p className="text-[10px] text-gray-600 mt-0.5 capitalize">
          via {order.paymentMethod?.replace(/_/g, " ") || "—"}
        </p>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} className="shrink-0 text-gray-600" />
          {formatDate(order.createdAt)}
        </div>
      </td>

      {/* Items */}
      <td className="px-4 py-3">
        <div className="space-y-1 max-w-[200px]">
          {order.items && order.items.slice(0, 2).map((item, idx) => (
            <p key={idx} className="text-xs text-gray-400 truncate">
              {item.productId?.name || "Product"}{" "}
              <span className="text-gray-600">×{item.quantity}</span>
            </p>
          ))}
          {order.items && order.items.length > 2 && (
            <p className="text-[10px] text-gray-600">
              +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </td>

      {/* Total */}
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-semibold text-gray-200">
          {formatCurrency(order.totalAmount)}
        </span>
      </td>

      {/* Payment status */}
      <td className="px-4 py-3">
        <StatusBadge value={order.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} />
      </td>

      {/* Order status */}
      <td className="px-4 py-3">
        <StatusBadge value={order.orderStatus} styleMap={ORDER_STATUS_STYLES} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={onViewDetails}
          title="View order details"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 text-gray-400 hover:text-violet-400 text-xs font-medium transition-all duration-150"
        >
          <Eye size={13} />
          View
        </button>
      </td>
    </tr>
  );
};

// ── OrderDetailModal ──────────────────────────────────────────────────────────

const OrderDetailModal = ({ order, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const snap = order.addressSnapshot || {};
  const totalItems = order.items
    ? order.items.reduce((s, i) => s + (i.quantity || 0), 0)
    : 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-blue-500 rounded" />
                <h3 className="text-base font-bold text-gray-100">Order Details</h3>
              </div>
              <p className="font-mono text-xs text-gray-400">
                {order.orderNumber || `#${String(order._id).slice(-8).toUpperCase()}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* Status row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={13} className="text-gray-600" />
                {formatDate(order.createdAt)}
              </div>
              <StatusBadge value={order.orderStatus} styleMap={ORDER_STATUS_STYLES} />
              <StatusBadge value={order.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} />
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Items ({totalItems})
              </p>
              <div className="space-y-2">
                {order.items && order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-200 font-medium truncate">
                        {item.productId?.name || "Product"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          SKU: {item.variantSku || item.variantId?.sku || "—"}
                        </span>
                        {(item.variantColor?.name || item.variantId?.color) && (
                          <>
                            <span className="text-gray-700">·</span>
                            <span className="text-xs text-gray-500">
                              {item.variantColor?.name || item.variantId?.color}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-200">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Price Breakdown
              </p>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 space-y-2 text-sm">
                <PriceRow label="Subtotal" value={formatCurrency(order.subtotal)} />
                {order.shippingCost > 0 && (
                  <PriceRow label="Shipping" value={formatCurrency(order.shippingCost)} />
                )}
                {order.tax > 0 && (
                  <PriceRow label="Tax" value={formatCurrency(order.tax)} />
                )}
                {order.discount > 0 && (
                  <PriceRow
                    label="Discount"
                    value={`−${formatCurrency(order.discount)}`}
                    valueClass="text-emerald-400"
                  />
                )}
                <div className="pt-2 border-t border-gray-700">
                  <PriceRow
                    label="Total"
                    value={formatCurrency(order.totalAmount)}
                    bold
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {(snap.fullName || snap.addressLine1) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Delivery Address
                </p>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-sm">
                  <p className="font-semibold text-gray-200 mb-1">{snap.fullName || "—"}</p>
                  {snap.phone && (
                    <p className="text-xs text-gray-400 mb-2">{snap.phone}</p>
                  )}
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {[snap.addressLine1, snap.addressLine2, snap.city, snap.state, snap.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {snap.landmark && (
                    <p className="text-gray-500 text-xs mt-1">Near: {snap.landmark}</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment info */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Payment Information
              </p>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 space-y-2 text-xs">
                <InfoRow2
                  label="Method"
                  value={(order.paymentMethod || "—").replace(/_/g, " ")}
                />
                {order.razorpayOrderId && (
                  <InfoRow2 label="Razorpay Order ID" value={order.razorpayOrderId} mono />
                )}
                {order.trackingNumber && (
                  <InfoRow2 label="Tracking Number" value={order.trackingNumber} mono />
                )}
                {order.courierName && (
                  <InfoRow2 label="Courier" value={order.courierName} />
                )}
                {order.awbCode && (
                  <InfoRow2 label="AWB Code" value={order.awbCode} mono />
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Notes
                </p>
                <p className="text-sm text-gray-400 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Utility sub-components ────────────────────────────────────────────────────

const PageBtn = ({ children, onClick, disabled, active, ...rest }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[2rem] h-8 px-2 rounded text-xs font-medium transition
      ${
        active
          ? "bg-red-500 text-white"
          : disabled
          ? "text-gray-700 cursor-not-allowed"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    {...rest}
  >
    {children}
  </button>
);

const PriceRow = ({ label, value, bold, valueClass }) => (
  <div className="flex items-center justify-between">
    <span className={bold ? "font-semibold text-gray-200" : "text-gray-400"}>{label}</span>
    <span className={`font-semibold ${bold ? "text-white" : valueClass || "text-gray-200"}`}>
      {value}
    </span>
  </div>
);

const InfoRow2 = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span
      className={`text-right break-all ${
        mono ? "font-mono text-[10px] text-gray-400" : "text-gray-300"
      }`}
    >
      {value}
    </span>
  </div>
);

export default CustomerOrders;
