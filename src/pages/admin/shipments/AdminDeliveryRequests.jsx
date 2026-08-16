import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  User,
  MapPin,
  DollarSign,
  Calendar,
  X,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Info,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const REASON_LABELS = {
  charge_exceeds_threshold: "Charge > ₹250",
  insufficient_balance: "Insufficient Balance",
  api_failure: "API Failure",
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "yellow",
    Icon: Clock,
  },
  fulfilled: {
    label: "Fulfilled",
    color: "green",
    Icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "red",
    Icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "gray",
    Icon: Info,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20`}
    >
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ReasonBadge({ reason }) {
  const label = REASON_LABELS[reason] || reason;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
      {label}
    </span>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

const AdminDeliveryRequests = () => {
  // list state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  // filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // modals
  const [viewRequest, setViewRequest] = useState(null);
  const [fulfillRequest, setFulfillRequest] = useState(null);
  const [rejectRequest, setRejectRequest] = useState(null);

  // fulfill form
  const [fulfillForm, setFulfillForm] = useState({
    awbCode: "",
    courierName: "",
    courierId: "",
    shiprocketOrderId: "",
    shiprocketShipmentId: "",
    trackingUrl: "",
    labelUrl: "",
    manifestUrl: "",
    estimatedDeliveryDate: "",
    adminNotes: "",
  });
  const [fulfillErrors, setFulfillErrors] = useState({});
  const [fulfillLoading, setFulfillLoading] = useState(false);
  const [fulfillSuccess, setFulfillSuccess] = useState("");
  const [fulfillApiError, setFulfillApiError] = useState("");

  // reject form
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectApiError, setRejectApiError] = useState("");

  // ── fetch helpers ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axiosClient.get(
        "/api/admin/delivery-requests/stats/summary",
        { withCredentials: true }
      );
      if (res.data.success) setStats(res.data.data);
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const params = { page, limit: 20 };
        if (filterStatus !== "all") params.status = filterStatus;
        if (filterReason !== "all") params.reason = filterReason;

        const res = await axiosClient.get("/api/admin/delivery-requests", {
          params,
          withCredentials: true,
        });
        if (res.data.success) {
          setRequests(res.data.data || []);
          setPagination(
            res.data.pagination || { page: 1, pages: 1, total: 0 }
          );
        } else {
          setError("Failed to load delivery requests.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load delivery requests."
        );
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterReason]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, filterStatus, filterReason, fetchRequests]);

  // ── client-side search filter ──────────────────────────────────────────────

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const order = r.orderId;
    return (
      order?.orderNumber?.toLowerCase().includes(q) ||
      order?.userEmail?.toLowerCase().includes(q) ||
      r.awbCode?.toLowerCase().includes(q)
    );
  });

  // ── fulfill modal helpers ──────────────────────────────────────────────────

  const openFulfill = (req) => {
    setFulfillRequest(req);
    setFulfillForm({
      awbCode: "",
      courierName: "",
      courierId: "",
      shiprocketOrderId: "",
      shiprocketShipmentId: "",
      trackingUrl: "",
      labelUrl: "",
      manifestUrl: "",
      estimatedDeliveryDate: "",
      adminNotes: "",
    });
    setFulfillErrors({});
    setFulfillApiError("");
    setFulfillSuccess("");
  };

  const closeFulfill = () => {
    setFulfillRequest(null);
    setFulfillSuccess("");
    setFulfillApiError("");
  };

  const validateFulfill = () => {
    const errs = {};
    if (!fulfillForm.awbCode.trim()) errs.awbCode = "AWB code is required.";
    if (!fulfillForm.courierName.trim())
      errs.courierName = "Courier name is required.";
    return errs;
  };

  const handleFulfillSubmit = async (e) => {
    e.preventDefault();
    const errs = validateFulfill();
    if (Object.keys(errs).length) {
      setFulfillErrors(errs);
      return;
    }
    try {
      setFulfillLoading(true);
      setFulfillApiError("");
      const payload = { ...fulfillForm };
      // strip empty optional fields
      Object.keys(payload).forEach((k) => {
        if (!payload[k] && k !== "awbCode" && k !== "courierName")
          delete payload[k];
      });
      const res = await axiosClient.post(
        `/api/admin/delivery-requests/${fulfillRequest._id}/fulfill`,
        payload,
        { withCredentials: true }
      );
      if (res.data.success) {
        setFulfillSuccess("Shipment fulfilled! Order is now marked as shipped.");
        fetchRequests(currentPage);
        fetchStats();
      } else {
        setFulfillApiError(res.data.message || "Failed to fulfill.");
      }
    } catch (err) {
      setFulfillApiError(
        err.response?.data?.message || "Failed to fulfill delivery request."
      );
    } finally {
      setFulfillLoading(false);
    }
  };

  // ── reject modal helpers ───────────────────────────────────────────────────

  const openReject = (req) => {
    setRejectRequest(req);
    setRejectReason("");
    setRejectApiError("");
  };

  const closeReject = () => {
    setRejectRequest(null);
    setRejectApiError("");
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      setRejectLoading(true);
      setRejectApiError("");
      const res = await axiosClient.post(
        `/api/admin/delivery-requests/${rejectRequest._id}/reject`,
        { rejectionReason: rejectReason.trim() || undefined },
        { withCredentials: true }
      );
      if (res.data.success) {
        closeReject();
        fetchRequests(currentPage);
        fetchStats();
      } else {
        setRejectApiError(res.data.message || "Failed to reject.");
      }
    } catch (err) {
      setRejectApiError(
        err.response?.data?.message || "Failed to reject delivery request."
      );
    } finally {
      setRejectLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 animate-pulse"
              >
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-7 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))
          : [
              {
                label: "Total",
                value: stats?.total ?? "—",
                color: "from-blue-500 to-cyan-500",
                bg: "bg-blue-500/10",
                Icon: Package,
              },
              {
                label: "Pending",
                value: stats?.pending ?? "—",
                color: "from-yellow-400 to-amber-500",
                bg: "bg-yellow-500/10",
                Icon: Clock,
              },
              {
                label: "Fulfilled",
                value: stats?.fulfilled ?? "—",
                color: "from-green-500 to-emerald-500",
                bg: "bg-green-500/10",
                Icon: CheckCircle,
              },
              {
                label: "Rejected",
                value: stats?.rejected ?? "—",
                color: "from-red-500 to-pink-500",
                bg: "bg-red-500/10",
                Icon: XCircle,
              },
            ].map(({ label, value, color, bg, Icon }) => (
              <div
                key={label}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon
                      size={22}
                      className={`text-transparent bg-gradient-to-r ${color} bg-clip-text`}
                    />
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, email or AWB..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterReason}
            onChange={(e) => {
              setFilterReason(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            <option value="all">All Reasons</option>
            <option value="charge_exceeds_threshold">Charge &gt; ₹250</option>
            <option value="insufficient_balance">Insufficient Balance</option>
            <option value="api_failure">API Failure</option>
          </select>

          <button
            onClick={() => fetchRequests(currentPage)}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {[
                  "Order #",
                  "Customer",
                  "Amount",
                  "Reason",
                  "Est. Charge",
                  "Created",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-4 text-left text-gray-400 text-sm font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm">
                        Loading delivery requests…
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={() => fetchRequests(currentPage)}
                      className="mt-3 text-gray-400 hover:text-white text-sm underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      No delivery requests found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const order = req.orderId;
                  return (
                    <tr
                      key={req._id}
                      className="border-b border-gray-700/50 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-4 px-4">
                        <span className="text-white font-mono text-sm">
                          {order?.orderNumber || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white text-sm">
                          {order?.userEmail || "—"}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-white text-sm font-medium">
                        {formatCurrency(order?.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <ReasonBadge reason={req.reason} />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300">
                        {req.estimatedCharge != null
                          ? formatCurrency(req.estimatedCharge)
                          : "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewRequest(req)}
                            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => openFulfill(req)}
                                className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition"
                                title="Fulfill (Enter AWB)"
                              >
                                <Truck size={16} />
                              </button>
                              <button
                                onClick={() => openReject(req)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition text-sm"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition text-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW DETAIL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {viewRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck size={20} />
                  Delivery Request
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {viewRequest.orderId?.orderNumber || viewRequest._id}
                </p>
              </div>
              <button
                onClick={() => setViewRequest(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status & Reason */}
              <div className="flex flex-wrap gap-3 items-center">
                <StatusBadge status={viewRequest.status} />
                <ReasonBadge reason={viewRequest.reason} />
                {viewRequest.estimatedCharge != null && (
                  <span className="text-sm text-gray-400">
                    Est. charge:{" "}
                    <span className="text-white font-medium">
                      {formatCurrency(viewRequest.estimatedCharge)}
                    </span>
                  </span>
                )}
                {viewRequest.walletBalance != null && (
                  <span className="text-sm text-gray-400">
                    Wallet bal:{" "}
                    <span className="text-white font-medium">
                      {formatCurrency(viewRequest.walletBalance)}
                    </span>
                  </span>
                )}
              </div>

              {/* Order Info */}
              {viewRequest.orderId && (
                <Section title="Order" Icon={Package}>
                  <Grid2>
                    <Field label="Order #" value={viewRequest.orderId.orderNumber} mono />
                    <Field
                      label="Amount"
                      value={formatCurrency(viewRequest.orderId.totalAmount)}
                    />
                    <Field
                      label="Customer"
                      value={viewRequest.orderId.userEmail}
                    />
                    <Field
                      label="Order Status"
                      value={
                        <StatusBadgePlain status={viewRequest.orderId.orderStatus} />
                      }
                    />
                  </Grid2>
                  {viewRequest.orderId.addressSnapshot && (
                    <div className="mt-3">
                      <p className="text-gray-500 text-xs mb-1">
                        Delivery Address
                      </p>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {viewRequest.orderId.addressSnapshot.fullName},{" "}
                        {viewRequest.orderId.addressSnapshot.addressLine1}
                        {viewRequest.orderId.addressSnapshot.addressLine2 &&
                          `, ${viewRequest.orderId.addressSnapshot.addressLine2}`}
                        , {viewRequest.orderId.addressSnapshot.city},{" "}
                        {viewRequest.orderId.addressSnapshot.state} –{" "}
                        {viewRequest.orderId.addressSnapshot.pincode}
                      </p>
                    </div>
                  )}
                </Section>
              )}

              {/* Fulfillment Details (if fulfilled) */}
              {viewRequest.status === "fulfilled" && viewRequest.awbCode && (
                <Section title="Shipment Details" Icon={Truck}>
                  <Grid2>
                    <Field label="AWB Code" value={viewRequest.awbCode} mono />
                    <Field label="Courier" value={viewRequest.courierName} />
                    {viewRequest.courierId && (
                      <Field label="Courier ID" value={viewRequest.courierId} mono />
                    )}
                    {viewRequest.shiprocketOrderId && (
                      <Field
                        label="Shiprocket Order ID"
                        value={viewRequest.shiprocketOrderId}
                        mono
                      />
                    )}
                    {viewRequest.shiprocketShipmentId && (
                      <Field
                        label="Shiprocket Shipment ID"
                        value={viewRequest.shiprocketShipmentId}
                        mono
                      />
                    )}
                    {viewRequest.estimatedDeliveryDate && (
                      <Field
                        label="Est. Delivery"
                        value={formatDate(viewRequest.estimatedDeliveryDate)}
                      />
                    )}
                    <Field
                      label="Fulfilled By"
                      value={viewRequest.fulfilledBy?.name || viewRequest.fulfilledBy?.email || "—"}
                    />
                    <Field
                      label="Fulfilled At"
                      value={formatDate(viewRequest.fulfilledAt)}
                    />
                  </Grid2>
                  {viewRequest.trackingUrl && (
                    <a
                      href={viewRequest.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <ExternalLink size={14} />
                      Open Tracking URL
                    </a>
                  )}
                  {viewRequest.adminNotes && (
                    <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Admin Notes</p>
                      <p className="text-gray-200 text-sm">
                        {viewRequest.adminNotes}
                      </p>
                    </div>
                  )}
                </Section>
              )}

              {/* Rejection Details (if rejected) */}
              {viewRequest.status === "rejected" && (
                <Section title="Rejection Details" Icon={XCircle}>
                  <Grid2>
                    <Field
                      label="Rejected By"
                      value={viewRequest.rejectedBy?.name || viewRequest.rejectedBy?.email || "—"}
                    />
                    <Field
                      label="Rejected At"
                      value={formatDate(viewRequest.rejectedAt)}
                    />
                  </Grid2>
                  {viewRequest.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">
                        {viewRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </Section>
              )}

              <div className="text-xs text-gray-500">
                Created: {formatDate(viewRequest.createdAt)} · Updated:{" "}
                {formatDate(viewRequest.updatedAt)}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3">
              {viewRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setViewRequest(null);
                      openFulfill(viewRequest);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Truck size={16} />
                    Fulfill Shipment
                  </button>
                  <button
                    onClick={() => {
                      setViewRequest(null);
                      openReject(viewRequest);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setViewRequest(null)}
                className={`${viewRequest.status === "pending" ? "" : "flex-1"} px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          FULFILL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {fulfillRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck size={20} className="text-green-400" />
                  Fulfill Shipment
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Order:{" "}
                  <span className="text-white font-mono">
                    {fulfillRequest.orderId?.orderNumber || fulfillRequest._id}
                  </span>
                </p>
              </div>
              <button
                onClick={closeFulfill}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {fulfillSuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-white font-semibold text-lg mb-1">
                  Shipment Fulfilled!
                </p>
                <p className="text-gray-400 text-sm">{fulfillSuccess}</p>
                <button
                  onClick={closeFulfill}
                  className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleFulfillSubmit} noValidate>
                <div className="p-6 space-y-4">
                  <p className="text-gray-400 text-sm">
                    Enter the shipment details from the Shiprocket portal after
                    placing the order manually.
                  </p>

                  {fulfillApiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-red-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-red-400 text-sm">{fulfillApiError}</p>
                    </div>
                  )}

                  {/* Required fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="AWB Code *"
                      name="awbCode"
                      value={fulfillForm.awbCode}
                      onChange={(v) =>
                        setFulfillForm((f) => ({ ...f, awbCode: v }))
                      }
                      error={fulfillErrors.awbCode}
                      placeholder="e.g. 1234567890"
                      mono
                    />
                    <FormField
                      label="Courier Name *"
                      name="courierName"
                      value={fulfillForm.courierName}
                      onChange={(v) =>
                        setFulfillForm((f) => ({ ...f, courierName: v }))
                      }
                      error={fulfillErrors.courierName}
                      placeholder="e.g. Delhivery"
                    />
                  </div>

                  {/* Optional fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Courier ID"
                      name="courierId"
                      value={fulfillForm.courierId}
                      onChange={(v) =>
                        setFulfillForm((f) => ({ ...f, courierId: v }))
                      }
                      placeholder="Optional"
                    />
                    <FormField
                      label="Shiprocket Order ID"
                      name="shiprocketOrderId"
                      value={fulfillForm.shiprocketOrderId}
                      onChange={(v) =>
                        setFulfillForm((f) => ({
                          ...f,
                          shiprocketOrderId: v,
                        }))
                      }
                      placeholder="Optional"
                      mono
                    />
                    <FormField
                      label="Shiprocket Shipment ID"
                      name="shiprocketShipmentId"
                      value={fulfillForm.shiprocketShipmentId}
                      onChange={(v) =>
                        setFulfillForm((f) => ({
                          ...f,
                          shiprocketShipmentId: v,
                        }))
                      }
                      placeholder="Optional"
                      mono
                    />
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-1.5">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={fulfillForm.estimatedDeliveryDate}
                        onChange={(e) =>
                          setFulfillForm((f) => ({
                            ...f,
                            estimatedDeliveryDate: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <FormField
                    label="Tracking URL"
                    name="trackingUrl"
                    value={fulfillForm.trackingUrl}
                    onChange={(v) =>
                      setFulfillForm((f) => ({ ...f, trackingUrl: v }))
                    }
                    placeholder="https://… (Optional)"
                  />
                  <FormField
                    label="Label URL"
                    name="labelUrl"
                    value={fulfillForm.labelUrl}
                    onChange={(v) =>
                      setFulfillForm((f) => ({ ...f, labelUrl: v }))
                    }
                    placeholder="https://… (Optional)"
                  />
                  <FormField
                    label="Manifest URL"
                    name="manifestUrl"
                    value={fulfillForm.manifestUrl}
                    onChange={(v) =>
                      setFulfillForm((f) => ({ ...f, manifestUrl: v }))
                    }
                    placeholder="https://… (Optional)"
                  />

                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1.5">
                      Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      value={fulfillForm.adminNotes}
                      onChange={(e) =>
                        setFulfillForm((f) => ({
                          ...f,
                          adminNotes: e.target.value,
                        }))
                      }
                      placeholder="Internal notes (optional)…"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={closeFulfill}
                    className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fulfillLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {fulfillLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Truck size={16} />
                        Confirm Fulfillment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          REJECT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {rejectRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle size={20} className="text-red-400" />
                Reject Delivery Request
              </h2>
              <button
                onClick={closeReject}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} noValidate>
              <div className="p-6 space-y-4">
                <p className="text-gray-400 text-sm">
                  Rejecting order{" "}
                  <span className="text-white font-mono font-semibold">
                    {rejectRequest.orderId?.orderNumber || rejectRequest._id}
                  </span>
                  . The order's delivery status will be set to{" "}
                  <span className="text-red-400 font-medium">failed</span>.
                </p>

                {rejectApiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-red-400 text-sm">{rejectApiError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Order to be cancelled, alternative courier arranged…"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex gap-3">
                <button
                  type="button"
                  onClick={closeReject}
                  className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {rejectLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Rejecting…
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirm Reject
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── small sub-components ────────────────────────────────────────────────────

function Section({ title, Icon, children }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
        <Icon size={15} className="text-gray-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid2({ children }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`text-gray-200 text-sm mt-0.5 ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function StatusBadgePlain({ status }) {
  const map = {
    pending: "text-yellow-400",
    confirmed: "text-blue-400",
    processing: "text-purple-400",
    shipped: "text-indigo-400",
    delivered: "text-green-400",
    cancelled: "text-red-400",
    returned: "text-gray-400",
  };
  return (
    <span className={`text-sm font-medium capitalize ${map[status] || "text-gray-400"}`}>
      {status}
    </span>
  );
}

function FormField({ label, name, value, onChange, error, placeholder, mono }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium mb-1.5">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 transition ${
          mono ? "font-mono" : ""
        } ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-700 focus:border-green-500 focus:ring-green-500"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default AdminDeliveryRequests;
