import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Star,
  Heart,
  MapPin,
  AlertCircle,
  Home,
  Briefcase,
  RefreshCw,
} from "lucide-react";

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

const formatDateShort = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
};

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

const avatarColor = (id) => {
  if (!id) return AVATAR_COLORS[0];
  const sum = String(id)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const CustomerDetail = ({ customerId, onClose, onViewOrders }) => {
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError("");

    try {
      const [detailRes, statsRes, addressRes] = await Promise.all([
        axiosClient.get(`/api/admin/customers/${customerId}`),
        axiosClient.get(`/api/admin/customers/${customerId}/stats`),
        axiosClient.get(`/api/admin/customers/${customerId}/addresses`, {
          params: { page: 1, limit: 10 },
        }),
      ]);

      if (detailRes.data.success) setCustomer(detailRes.data.data);
      else throw new Error(detailRes.data.message || "Failed to load customer");

      if (statsRes.data.success) setStats(statsRes.data.data.stats);

      if (addressRes.data.success) setAddresses(addressRes.data.data || []);
    } catch (err) {
      console.error("CustomerDetail fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const initials = customer ? getInitials(customer.name, customer.email) : "?";
  const color = avatarColor(customerId);

  const addressTypeIcon = (type) => {
    if (!type) return <MapPin size={13} className="text-gray-500" />;
    const t = type.toLowerCase();
    if (t === "home") return <Home size={13} className="text-blue-400" />;
    if (t === "work" || t === "office") return <Briefcase size={13} className="text-amber-400" />;
    return <MapPin size={13} className="text-gray-500" />;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Customer Details"
      >
        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-violet-500 rounded" />
            <h2 className="text-base font-bold text-gray-100">Customer Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Error state */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load</p>
                <p className="text-xs mt-0.5 text-red-400">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="ml-auto shrink-0 flex items-center gap-1 text-xs underline hover:no-underline"
              >
                <RefreshCw size={11} />
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-800 rounded w-2/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-800 rounded-xl" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-800 rounded w-1/4" />
                <div className="h-14 bg-gray-800 rounded-xl" />
                <div className="h-14 bg-gray-800 rounded-xl" />
              </div>
            </div>
          )}

          {/* Loaded content */}
          {!loading && !error && customer && (
            <>
              {/* ── Profile card ── */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div
                  className={`shrink-0 w-14 h-14 rounded-full ${color} flex items-center justify-center text-white text-lg font-bold`}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-100 truncate">
                    {customer.name || <span className="text-gray-500 italic">No name</span>}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    ID: #{String(customer._id).slice(-8).toUpperCase()}
                  </p>

                  {customer.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Mail size={12} className="shrink-0 text-gray-600" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Phone size={12} className="shrink-0 text-gray-600" />
                      {customer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={12} className="shrink-0 text-gray-600" />
                    Joined {formatDate(customer.createdAt)}
                  </div>
                </div>
              </div>

              {/* ── Stats grid ── */}
              {stats && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Activity Overview
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <MiniStatCard
                        icon={<ShoppingBag size={15} className="text-blue-400" />}
                        label="Total Orders"
                        value={stats.totalOrders}
                        bg="bg-blue-500/10 border-blue-500/20"
                      />
                      <MiniStatCard
                        icon={<IndianRupee size={15} className="text-emerald-400" />}
                        label="Total Spent"
                        value={formatCurrency(stats.totalSpent)}
                        bg="bg-emerald-500/10 border-emerald-500/20"
                      />
                      <MiniStatCard
                        icon={<TrendingUp size={15} className="text-violet-400" />}
                        label="Avg Order Value"
                        value={formatCurrency(stats.averageOrderValue)}
                        bg="bg-violet-500/10 border-violet-500/20"
                      />
                      <MiniStatCard
                        icon={<Star size={15} className="text-amber-400" />}
                        label="Reviews"
                        value={`${stats.totalReviews}${stats.averageRating > 0 ? ` · ★ ${stats.averageRating}` : ""}`}
                        bg="bg-amber-500/10 border-amber-500/20"
                      />
                      <MiniStatCard
                        icon={<Heart size={15} className="text-rose-400" />}
                        label="Wishlist Items"
                        value={stats.totalWishlistItems}
                        bg="bg-rose-500/10 border-rose-500/20"
                      />
                      <MiniStatCard
                        icon={<MapPin size={15} className="text-cyan-400" />}
                        label="Addresses"
                        value={stats.totalAddresses}
                        bg="bg-cyan-500/10 border-cyan-500/20"
                      />
                    </div>
                  </div>

                  {/* Order status breakdown */}
                  {stats.orderStatusBreakdown && stats.orderStatusBreakdown.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                        Order Status Breakdown
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stats.orderStatusBreakdown.map((item) => (
                          <StatusPill key={item.status} status={item.status} count={item.count} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Addresses ── */}
              {addresses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Saved Addresses
                  </p>
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-xs text-gray-300"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {addressTypeIcon(addr.type || addr.addressType)}
                          <span className="font-semibold text-gray-200">
                            {addr.fullName || addr.name || customer.name || "—"}
                          </span>
                          {addr.phone && (
                            <span className="text-gray-500 ml-auto">{addr.phone}</span>
                          )}
                          {addr.isDefault && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                          {[
                            addr.addressLine1,
                            addr.addressLine2,
                            addr.city,
                            addr.state,
                            addr.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {addr.landmark && (
                          <p className="text-gray-500 mt-0.5">Near: {addr.landmark}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Account info ── */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Account Information
                </p>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 space-y-3 text-xs">
                  <InfoRow label="User ID" value={String(customer._id)} mono />
                  <InfoRow label="Name" value={customer.name || "—"} />
                  <InfoRow label="Email" value={customer.email || "—"} />
                  <InfoRow label="Phone" value={customer.phone || "—"} />
                  <InfoRow label="Role" value={customer.role || "user"} />
                  <InfoRow label="Joined" value={formatDateShort(customer.createdAt)} />
                  <InfoRow label="Last Updated" value={formatDateShort(customer.updatedAt)} />
                  {customer.googleId && <InfoRow label="Auth" value="Google OAuth" />}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        {!loading && !error && customer && (
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 shrink-0 flex gap-3">
            <button
              onClick={onViewOrders}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold transition-all duration-150 shadow-lg shadow-blue-900/30"
            >
              <ShoppingBag size={15} />
              View Orders
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MiniStatCard = ({ icon, label, value, bg }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border ${bg}`}>
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
  </div>
);

const STATUS_STYLES = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  processing: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  shipped: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
  returned: "bg-gray-500/15 text-gray-400 border-gray-500/25",
};

const StatusPill = ({ status, count }) => {
  const style = STATUS_STYLES[status] || "bg-gray-700 text-gray-400 border-gray-600";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
      <span className="capitalize">{status}</span>
      <span className="font-bold">{count}</span>
    </span>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span
      className={`text-gray-300 text-right break-all ${mono ? "font-mono text-[10px] text-gray-400" : ""}`}
    >
      {value}
    </span>
  </div>
);

export default CustomerDetail;
