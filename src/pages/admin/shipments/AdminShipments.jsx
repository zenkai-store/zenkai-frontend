import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Eye,
  X,
  Search,
  ExternalLink,
  RotateCcw,
  FileText,
  Calendar,
  Info,
  XCircle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

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

const SHIPMENT_STATUS_CONFIG = {
  pending: { label: "Pending", color: "yellow" },
  assigned: { label: "Assigned", color: "blue" },
  picked_up: { label: "Picked Up", color: "purple" },
  in_transit: { label: "In Transit", color: "indigo" },
  delivered: { label: "Delivered", color: "green" },
  failed: { label: "Failed", color: "red" },
};

function ShipmentStatusBadge({ status }) {
  const cfg = SHIPMENT_STATUS_CONFIG[status] || {
    label: status,
    color: "gray",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
        bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20`}
    >
      {cfg.label}
    </span>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

const AdminShipments = () => {
  // list state
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  // filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // modals
  const [viewShipment, setViewShipment] = useState(null);

  // per-row action state: { [shipmentId]: { retrying, refreshing, error, successMsg } }
  const [rowActions, setRowActions] = useState({});

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchShipments = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const params = { page, limit: 20 };
        if (filterStatus !== "all") params.status = filterStatus;

        const res = await axiosClient.get("/api/admin/shipments", {
          params,
          withCredentials: true,
        });
        if (res.data.success) {
          setShipments(res.data.data || []);
          setPagination(
            res.data.pagination || { page: 1, pages: 1, total: 0 }
          );
        } else {
          setError("Failed to load shipments.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load shipments.");
      } finally {
        setLoading(false);
      }
    },
    [filterStatus]
  );

  useEffect(() => {
    fetchShipments(currentPage);
  }, [currentPage, filterStatus, fetchShipments]);

  // ── retry shipment ─────────────────────────────────────────────────────────

  const handleRetry = async (shipmentId) => {
    setRowActions((prev) => ({
      ...prev,
      [shipmentId]: { retrying: true, refreshing: false, error: "", successMsg: "" },
    }));
    try {
      const res = await axiosClient.post(
        `/api/admin/shipments/${shipmentId}/retry`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setRowActions((prev) => ({
          ...prev,
          [shipmentId]: {
            retrying: false,
            refreshing: false,
            error: "",
            successMsg: "Retry queued!",
          },
        }));
        fetchShipments(currentPage);
        setTimeout(
          () =>
            setRowActions((prev) => ({ ...prev, [shipmentId]: undefined })),
          3000
        );
      } else {
        throw new Error(res.data.message || "Retry failed.");
      }
    } catch (err) {
      setRowActions((prev) => ({
        ...prev,
        [shipmentId]: {
          retrying: false,
          refreshing: false,
          error: err.response?.data?.message || err.message || "Retry failed.",
          successMsg: "",
        },
      }));
    }
  };

  // ── refresh tracking ───────────────────────────────────────────────────────

  const handleRefreshTracking = async (shipmentId) => {
    setRowActions((prev) => ({
      ...prev,
      [shipmentId]: { retrying: false, refreshing: true, error: "", successMsg: "" },
    }));
    try {
      const res = await axiosClient.post(
        `/api/admin/shipments/${shipmentId}/refresh-tracking`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setRowActions((prev) => ({
          ...prev,
          [shipmentId]: {
            retrying: false,
            refreshing: false,
            error: "",
            successMsg: "Tracking updated!",
          },
        }));
        fetchShipments(currentPage);
        setTimeout(
          () =>
            setRowActions((prev) => ({ ...prev, [shipmentId]: undefined })),
          3000
        );
      } else {
        throw new Error(res.data.message || "Refresh failed.");
      }
    } catch (err) {
      setRowActions((prev) => ({
        ...prev,
        [shipmentId]: {
          retrying: false,
          refreshing: false,
          error: err.response?.data?.message || err.message || "Refresh failed.",
          successMsg: "",
        },
      }));
    }
  };

  // ── open label ─────────────────────────────────────────────────────────────

  const handleOpenLabel = (shipmentId) => {
    // The backend redirects to the label URL
    window.open(
      `${axiosClient.defaults.baseURL}/api/admin/shipments/${shipmentId}/label`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ── client-side search ─────────────────────────────────────────────────────

  const filteredShipments = shipments.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.awbCode?.toLowerCase().includes(q) ||
      s.courierName?.toLowerCase().includes(q) ||
      s.orderId?.orderNumber?.toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

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
            placeholder="Search by AWB, courier or order #…"
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

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            <option value="all">All Statuses</option>
            {Object.entries(SHIPMENT_STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchShipments(currentPage)}
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
                  "AWB Code",
                  "Order #",
                  "Courier",
                  "Status",
                  "Pickup",
                  "Created",
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
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm">Loading shipments…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={() => fetchShipments(currentPage)}
                      className="mt-3 text-gray-400 hover:text-white text-sm underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Truck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No shipments found.</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => {
                  const ra = rowActions[s._id] || {};
                  return (
                    <React.Fragment key={s._id}>
                      <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition">
                        <td className="py-4 px-4">
                          <span className="text-white font-mono text-sm">
                            {s.awbCode}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm font-mono">
                            {s.orderId?.orderNumber || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300 text-sm">
                          {s.courierName || "—"}
                        </td>
                        <td className="py-4 px-4">
                          <ShipmentStatusBadge status={s.status} />
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-medium ${
                              s.pickupScheduled
                                ? "text-green-400"
                                : "text-gray-500"
                            }`}
                          >
                            {s.pickupScheduled ? "Scheduled" : "Not scheduled"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm whitespace-nowrap">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => setViewShipment(s)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Refresh Tracking */}
                            <button
                              onClick={() => handleRefreshTracking(s._id)}
                              disabled={ra.refreshing || ra.retrying}
                              className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition disabled:opacity-50"
                              title="Refresh Tracking"
                            >
                              {ra.refreshing ? (
                                <div className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                              ) : (
                                <RefreshCw size={16} />
                              )}
                            </button>

                            {/* Retry (only for failed) */}
                            {s.status === "failed" && (
                              <button
                                onClick={() => handleRetry(s._id)}
                                disabled={ra.retrying || ra.refreshing}
                                className="p-1.5 rounded-lg hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 transition disabled:opacity-50"
                                title="Retry Shipment"
                              >
                                {ra.retrying ? (
                                  <div className="w-4 h-4 border-2 border-orange-400/40 border-t-orange-400 rounded-full animate-spin" />
                                ) : (
                                  <RotateCcw size={16} />
                                )}
                              </button>
                            )}

                            {/* Label */}
                            {s.labelUrl && (
                              <button
                                onClick={() => handleOpenLabel(s._id)}
                                className="p-1.5 rounded-lg hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition"
                                title="View Label"
                              >
                                <FileText size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Inline feedback row */}
                      {(ra.error || ra.successMsg) && (
                        <tr className="border-b border-gray-700/30">
                          <td colSpan={7} className="px-4 py-2">
                            {ra.error && (
                              <p className="text-red-400 text-xs flex items-center gap-1.5">
                                <AlertCircle size={12} />
                                {ra.error}
                              </p>
                            )}
                            {ra.successMsg && (
                              <p className="text-green-400 text-xs flex items-center gap-1.5">
                                <CheckCircle size={12} />
                                {ra.successMsg}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
      {viewShipment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck size={20} />
                  Shipment Details
                </h2>
                <p className="text-gray-400 text-sm font-mono mt-0.5">
                  AWB: {viewShipment.awbCode}
                </p>
              </div>
              <button
                onClick={() => setViewShipment(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Row */}
              <div className="flex flex-wrap items-center gap-3">
                <ShipmentStatusBadge status={viewShipment.status} />
                <span
                  className={`text-sm ${
                    viewShipment.pickupScheduled
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  {viewShipment.pickupScheduled
                    ? "Pickup Scheduled"
                    : "Pickup Not Scheduled"}
                </span>
              </div>

              {/* Core Fields */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                  <Package size={15} className="text-gray-400" />
                  Shipment Info
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <InfoField label="AWB Code" value={viewShipment.awbCode} mono />
                  <InfoField label="Courier" value={viewShipment.courierName} />
                  {viewShipment.courierId && (
                    <InfoField label="Courier ID" value={viewShipment.courierId} mono />
                  )}
                  {viewShipment.shiprocketOrderId && (
                    <InfoField
                      label="Shiprocket Order ID"
                      value={viewShipment.shiprocketOrderId}
                      mono
                    />
                  )}
                  {viewShipment.shiprocketShipmentId && (
                    <InfoField
                      label="Shiprocket Shipment ID"
                      value={viewShipment.shiprocketShipmentId}
                      mono
                    />
                  )}
                  <InfoField label="Created" value={formatDate(viewShipment.createdAt)} />
                  <InfoField label="Updated" value={formatDate(viewShipment.updatedAt)} />
                </div>
              </div>

              {/* Order Info */}
              {viewShipment.orderId && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                    <Package size={15} className="text-gray-400" />
                    Linked Order
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <InfoField
                      label="Order #"
                      value={viewShipment.orderId.orderNumber}
                      mono
                    />
                    <InfoField
                      label="Customer"
                      value={viewShipment.orderId.userEmail}
                    />
                  </div>
                </div>
              )}

              {/* Tracking Details (JSON) */}
              {viewShipment.trackingDetails &&
                Object.keys(viewShipment.trackingDetails).length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                      <Info size={15} className="text-gray-400" />
                      Tracking Data
                    </h3>
                    <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(viewShipment.trackingDetails, null, 2)}
                    </pre>
                  </div>
                )}

              {/* URLs */}
              <div className="flex flex-wrap gap-3">
                {viewShipment.trackingUrl && (
                  <a
                    href={viewShipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <ExternalLink size={14} />
                    Tracking URL
                  </a>
                )}
                {viewShipment.labelUrl && (
                  <button
                    onClick={() => handleOpenLabel(viewShipment._id)}
                    className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    <FileText size={14} />
                    Label PDF
                  </button>
                )}
                {viewShipment.manifestUrl && (
                  <a
                    href={viewShipment.manifestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    <ExternalLink size={14} />
                    Manifest
                  </a>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3">
              {/* Retry (failed only) */}
              {viewShipment.status === "failed" && (
                <button
                  onClick={async () => {
                    const ra = rowActions[viewShipment._id] || {};
                    if (ra.retrying) return;
                    await handleRetry(viewShipment._id);
                  }}
                  disabled={(rowActions[viewShipment._id] || {}).retrying}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {(rowActions[viewShipment._id] || {}).retrying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                  Retry Shipment
                </button>
              )}

              {/* Refresh Tracking */}
              <button
                onClick={async () => {
                  const ra = rowActions[viewShipment._id] || {};
                  if (ra.refreshing) return;
                  await handleRefreshTracking(viewShipment._id);
                }}
                disabled={(rowActions[viewShipment._id] || {}).refreshing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {(rowActions[viewShipment._id] || {}).refreshing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh Tracking
              </button>

              <button
                onClick={() => setViewShipment(null)}
                className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition"
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

function InfoField({ label, value, mono }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p
        className={`text-gray-200 text-sm mt-0.5 ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default AdminShipments;
