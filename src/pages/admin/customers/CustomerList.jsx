import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import {
  Search,
  X,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  UserCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import CustomerDetail from "./CustomerDetail";

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

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field)
    return <ArrowUpDown size={13} className="text-gray-400 ml-1 inline" />;
  return sortOrder === "asc" ? (
    <ArrowUp size={13} className="text-white ml-1 inline" />
  ) : (
    <ArrowDown size={13} className="text-white ml-1 inline" />
  );
};

const CustomerList = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Detail drawer state
  const [detailCustomerId, setDetailCustomerId] = useState(null);

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const params = { page: currentPage, limit: LIMIT, sortBy, sortOrder };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await axiosClient.get("/api/admin/customers", {
        params,
        signal: controller.signal,
      });

      if (response.data.success) {
        setCustomers(response.data.data || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } else {
        setError("Failed to fetch customers.");
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("CustomerList fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomers();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchCustomers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6 font-lufga">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-red-500 rounded" />
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        </div>
        <p className="text-gray-400 text-sm ml-4">
          All registered users with their order activity
        </p>
      </div>

      {/* ── Stat bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Users size={18} />}
          label="Total Customers"
          value={loading ? "—" : pagination.total.toLocaleString("en-IN")}
          color="violet"
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Showing"
          value={
            loading
              ? "—"
              : `${customers.length} of ${pagination.total.toLocaleString("en-IN")}`
          }
          color="blue"
        />
        <StatCard
          icon={<IndianRupee size={18} />}
          label="Page"
          value={loading ? "—" : `${currentPage} / ${pagination.totalPages || 1}`}
          color="emerald"
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full h-10 pl-9 pr-9 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => fetchCustomers()}
          disabled={loading}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-5 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchCustomers} className="ml-auto underline hover:no-underline">
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
                <Th label="Customer" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <Th label="Contact" field={null} />
                <Th label="Joined" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <Th label="Orders" field="orderCount" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} align="right" />
                <Th label="Total Spent" field="totalSpent" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} align="right" />
                <Th label="Actions" field={null} align="center" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-gray-800 animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <UserCircle size={40} className="mx-auto mb-3 text-gray-700" />
                    {debouncedSearch
                      ? `No customers found for "${debouncedSearch}"`
                      : "No customers yet."}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <CustomerRow
                    key={customer._id}
                    customer={customer}
                    onViewDetails={() => setDetailCustomerId(customer._id)}
                    onViewOrders={() =>
                      navigate(`/admin/customers/${customer._id}/orders`)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
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
              customers
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
                  {currentPage > 4 && (
                    <span className="px-1 text-gray-600 text-xs">…</span>
                  )}
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

      {/* ── Customer Detail Drawer ── */}
      {detailCustomerId && (
        <CustomerDetail
          customerId={detailCustomerId}
          onClose={() => setDetailCustomerId(null)}
          onViewOrders={() => {
            setDetailCustomerId(null);
            navigate(`/admin/customers/${detailCustomerId}/orders`);
          }}
        />
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${colorMap[color]}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

const Th = ({ label, field, sortBy, sortOrder, onSort, align = "left" }) => (
  <th
    className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-400 whitespace-nowrap select-none
      ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
      ${field && onSort ? "cursor-pointer hover:text-white transition" : ""}
    `}
    onClick={field && onSort ? () => onSort(field) : undefined}
  >
    {label}
    {field && onSort && <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />}
  </th>
);

const CustomerRow = ({ customer, onViewDetails, onViewOrders }) => {
  const initials = getInitials(customer.name, customer.email);
  const color = avatarColor(customer._id);

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      {/* Customer name + avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-100 truncate max-w-[160px]">
              {customer.name || <span className="text-gray-500 italic">No name</span>}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[160px]">
              #{String(customer._id).slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {customer.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Mail size={11} className="shrink-0 text-gray-600" />
              <span className="truncate max-w-[180px]">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Phone size={11} className="shrink-0 text-gray-600" />
              {customer.phone}
            </div>
          )}
          {!customer.email && !customer.phone && (
            <span className="text-xs text-gray-600 italic">—</span>
          )}
        </div>
      </td>

      {/* Joined date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} className="shrink-0 text-gray-600" />
          {formatDate(customer.createdAt)}
        </div>
      </td>

      {/* Order count */}
      <td className="px-4 py-3 text-right">
        <span
          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold
            ${
              customer.orderCount > 0
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                : "bg-gray-800 text-gray-600 border border-gray-700"
            }`}
        >
          {customer.orderCount}
        </span>
      </td>

      {/* Total spent */}
      <td className="px-4 py-3 text-right">
        <span
          className={`text-sm font-semibold ${
            customer.totalSpent > 0 ? "text-emerald-400" : "text-gray-600"
          }`}
        >
          {customer.totalSpent > 0 ? formatCurrency(customer.totalSpent) : "₹0"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onViewDetails}
            title="View customer details"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 text-gray-400 hover:text-violet-400 text-xs font-medium transition-all duration-150"
          >
            <Eye size={13} />
            Details
          </button>
          <button
            onClick={onViewOrders}
            title="View customer orders"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-500/40 text-gray-400 hover:text-blue-400 text-xs font-medium transition-all duration-150"
          >
            <ShoppingBag size={13} />
            Orders
          </button>
        </div>
      </td>
    </tr>
  );
};

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

export default CustomerList;
