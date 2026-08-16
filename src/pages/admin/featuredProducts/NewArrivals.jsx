import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosClient from "../../../api/axiosClient";
import BASEURL from "../../../config/baseURL";
import {
  ArrowLeft,
  Package,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Tag,
  Hash,
  Image as ImageIcon,
  Layers,
  Zap,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  BadgePercent,
  DollarSign,
  ShoppingBag,
  Grid,
  Award,
  Target,
  BarChart3,
  Info,
  SlidersHorizontal,
  Filter,
} from "lucide-react";

// Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const NewArrivals = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState(null);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Search Modal States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activePosition, setActivePosition] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    customBadge: "",
    startDate: "",
    endDate: "",
  });

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Submitting State
  const [submitting, setSubmitting] = useState(false);

  // Expanded Card States
  const [expandedCards, setExpandedCards] = useState(new Set());

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // ======================= FETCH FEATURED PRODUCTS =======================
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(`/api/admin/featured`);

      if (response.data.success) {
        setFeaturedProducts(response.data.data);
      } else {
        setError("Failed to load featured products");
      }
    } catch (err) {
      console.error("Failed to fetch featured products:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load featured products",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // ======================= PRODUCT SEARCH =======================
  const handleSearchProducts = useCallback(async () => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchPage(1);

      const response = await axios.get(
        `${BASEURL}/api/products/search?q=${encodeURIComponent(debouncedSearchQuery)}&page=1&limit=20`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setSearchTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setActionError("Failed to search products");
    } finally {
      setSearching(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    handleSearchProducts();
  }, [handleSearchProducts]);

  // Load more search results
  const handleLoadMoreSearch = async () => {
    if (searchLoadingMore || searchPage >= searchTotalPages) return;

    try {
      setSearchLoadingMore(true);
      const nextPage = searchPage + 1;

      const response = await axios.get(
        `${BASEURL}/api/products/search?q=${encodeURIComponent(debouncedSearchQuery)}&page=${nextPage}&limit=20`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setSearchResults((prev) => [...prev, ...(response.data.data || [])]);
        setSearchPage(nextPage);
        setSearchTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setSearchLoadingMore(false);
    }
  };

  // ======================= OPEN SEARCH MODAL =======================
  const openSearchModal = (position) => {
    setActivePosition(position);
    setSelectedProduct(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchPage(1);
    setSearchTotalPages(1);
    setFormData({
      title: "",
      subtitle: "",
      customBadge: "",
      startDate: "",
      endDate: "",
    });
    setActionError("");
    setActionSuccess("");
    setShowSearchModal(true);
  };

  // ======================= SELECT PRODUCT =======================
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setSearchResults([]);
  };

  // ======================= SET FEATURED PRODUCT =======================
  const handleSetFeatured = async () => {
    if (!selectedProduct) {
      setActionError("Please select a product first");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");
      setActionSuccess("");

      const payload = {
        productId: selectedProduct._id,
        displayPosition: activePosition,
        title: formData.title || undefined,
        subtitle: formData.subtitle || undefined,
        customBadge: formData.customBadge || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

      const response = await axiosClient.post(
        `/api/admin/featured`,
        payload,
      );

      if (response.data.success) {
        setActionSuccess("New arrival set successfully!");
        setTimeout(() => {
          setShowSearchModal(false);
          setSelectedProduct(null);
          setActivePosition(null);
          setActionSuccess("");
          fetchFeaturedProducts();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to set featured product:", err);
      setActionError(
        err.response?.data?.message || "Failed to set new arrival",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================= DELETE FEATURED PRODUCT =======================
  const handleDeleteFeatured = async (featuredId) => {
    try {
      setDeleting(true);
      setActionError("");

      await axiosClient.delete(
        `/api/admin/featured/${featuredId}/permanent`,
      );

      setActionSuccess("New arrival removed successfully!");
      setDeleteConfirmId(null);
      setTimeout(() => {
        setActionSuccess("");
        fetchFeaturedProducts();
      }, 1500);
    } catch (err) {
      console.error("Failed to delete featured product:", err);
      setActionError(
        err.response?.data?.message || "Failed to remove new arrival",
      );
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  // ======================= TOGGLE CARD EXPAND =======================
  const toggleCardExpand = (position) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(position)) {
      newExpanded.delete(position);
    } else {
      newExpanded.add(position);
    }
    setExpandedCards(newExpanded);
  };

  // ======================= FORMAT FUNCTIONS =======================
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (featured) => {
    if (!featured) return { label: "Empty", color: "gray", icon: null };

    const now = new Date();
    const startDate = featured.startDate ? new Date(featured.startDate) : null;
    const endDate = featured.endDate ? new Date(featured.endDate) : null;

    if (!featured.isActive) {
      return { label: "Inactive", color: "red", icon: AlertCircle };
    }
    if (endDate && now > endDate) {
      return { label: "Expired", color: "yellow", icon: Clock };
    }
    if (startDate && now < startDate) {
      return { label: "Scheduled", color: "blue", icon: Calendar };
    }
    return { label: "Active", color: "green", icon: CheckCircle };
  };

  // ======================= LOADING STATE =======================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Loading new arrivals...</p>
        </div>
      </div>
    );
  }

  // ======================= ERROR STATE =======================
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-gray-700 shadow-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Error Loading Data
          </h3>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={fetchFeaturedProducts}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3.5 rounded-xl hover:from-red-600 hover:to-pink-700 transition font-medium shadow-lg shadow-red-500/25"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  const positions = [1, 2, 3, 4];

  return (
    <div className="space-y-6 pb-8">
      {/* ======================= SUCCESS/ERROR TOASTS ======================= */}
      {actionSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          <span className="text-green-400 text-sm font-medium">
            {actionSuccess}
          </span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm font-medium">
            {actionError}
          </span>
          <button
            onClick={() => setActionError("")}
            className="ml-auto p-1 hover:bg-red-500/20 rounded-lg transition"
          >
            <X size={16} className="text-red-400" />
          </button>
        </div>
      )}

      {/* ======================= HEADER ======================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            New Arrivals
          </h1>
          <p className="text-gray-400 mt-1">
            Manage featured products displayed on the homepage
          </p>
        </div>
        <button
          onClick={fetchFeaturedProducts}
          className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* ======================= INFO CARD ======================= */}
      <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
            <Info size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">
              About New Arrivals
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              You can set up to 4 products as "New Arrivals" on your homepage.
              Each position can have one featured product with optional custom
              title, subtitle, badge, and date range for scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* ======================= POSITIONS GRID ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positions.map((position) => {
          const featured = featuredProducts?.positions?.[position];
          const status = getStatusInfo(featured);
          const isExpanded = expandedCards.has(position);
          const StatusIcon = status.icon;

          return (
            <div
              key={position}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border overflow-hidden shadow-xl transition-all duration-300 ${
                featured
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-700/50 border-dashed hover:border-gray-600"
              }`}
            >
              {/* Position Header */}
              <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                      featured
                        ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-gray-700/50 text-gray-500 border border-gray-600"
                    }`}
                  >
                    {position}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Position {position}
                    </h3>
                    {featured && StatusIcon && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusIcon
                          size={12}
                          className={
                            status.color === "green"
                              ? "text-green-400"
                              : status.color === "yellow"
                                ? "text-yellow-400"
                                : status.color === "blue"
                                  ? "text-blue-400"
                                  : "text-red-400"
                          }
                        />
                        <span
                          className={`text-xs font-medium ${
                            status.color === "green"
                              ? "text-green-400"
                              : status.color === "yellow"
                                ? "text-yellow-400"
                                : status.color === "blue"
                                  ? "text-blue-400"
                                  : "text-red-400"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {featured && (
                  <button
                    onClick={() => toggleCardExpand(position)}
                    className="p-2 bg-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Card Body */}
              {featured ? (
                <div className="p-5">
                  {/* Product Info */}
                  <div className="flex gap-4 mb-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {featured.productId?.variants?.[0]?.media?.[0]?.url ? (
                        <img
                          src={featured.productId.variants[0].media[0].url}
                          alt={featured.productId.name}
                          className="w-24 h-24 object-cover rounded-xl border border-gray-700"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-700/50 rounded-xl flex items-center justify-center border border-gray-700">
                          <ImageIcon className="w-10 h-10 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-lg mb-1 truncate">
                        {featured.productId?.name || "Unknown Product"}
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-400 font-mono text-xs">
                        <Hash size={12} />
                        {featured.productId?.productId || "N/A"}
                      </span>

                      {/* Featured Badge & Title */}
                      <div className="mt-3 space-y-1.5">
                        {featured.customBadge && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-bold">
                            <Award size={12} />
                            {featured.customBadge}
                          </span>
                        )}
                        {featured.title && (
                          <p className="text-gray-300 text-sm font-medium">
                            {featured.title}
                          </p>
                        )}
                        {featured.subtitle && (
                          <p className="text-gray-500 text-xs">
                            {featured.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3 animate-in slide-in-from-top-2">
                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar size={12} className="text-blue-400" />
                            <span className="text-gray-500 text-xs">
                              Start Date
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {formatDate(featured.startDate)}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock size={12} className="text-purple-400" />
                            <span className="text-gray-500 text-xs">
                              End Date
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {formatDate(featured.endDate)}
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <User size={12} className="text-green-400" />
                            <span className="text-gray-500 text-xs">
                              Created By
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm truncate">
                            {featured.createdBy?.name || "N/A"}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <User size={12} className="text-yellow-400" />
                            <span className="text-gray-500 text-xs">
                              Updated By
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm truncate">
                            {featured.updatedBy?.name || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Created: {formatDate(featured.createdAt)}</p>
                        <p>Updated: {formatDate(featured.updatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => openSearchModal(position)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition text-sm font-medium"
                    >
                      <Edit size={14} />
                      Replace
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(featured._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirmId === featured._id && (
                    <div className="mt-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <p className="text-red-400 text-sm mb-3">
                        Are you sure you want to remove this new arrival from
                        position {position}?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteFeatured(featured._id)}
                          disabled={deleting}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition text-sm font-medium"
                        >
                          {deleting ? "Removing..." : "Yes, Remove"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 transition text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <h4 className="text-gray-400 font-medium mb-2">
                    No Product Set
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Add a product to this position
                  </p>
                  <button
                    onClick={() => openSearchModal(position)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition font-medium shadow-lg shadow-red-500/25"
                  >
                    <Plus size={18} />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ======================= OVERALL STATS ======================= */}
      {featuredProducts && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={22} className="text-purple-400" />
              Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 text-center">
                <p className="text-3xl font-bold text-white">
                  {featuredProducts.totalActive || 0}
                </p>
                <p className="text-gray-400 text-sm mt-1">Active Arrivals</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 text-center">
                <p className="text-3xl font-bold text-white">
                  {4 - (featuredProducts.totalActive || 0)}
                </p>
                <p className="text-gray-400 text-sm mt-1">Available Slots</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 text-center">
                <p className="text-3xl font-bold text-white">
                  {featuredProducts.inactiveFeatured?.length || 0}
                </p>
                <p className="text-gray-400 text-sm mt-1">Inactive</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 text-center">
                <p className="text-3xl font-bold text-white">
                  {
                    Object.values(featuredProducts.positions || {}).filter(
                      Boolean,
                    ).length
                  }
                </p>
                <p className="text-gray-400 text-sm mt-1">Filled Positions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= SEARCH MODAL ======================= */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star size={20} className="text-yellow-400" />
                    Set New Arrival - Position {activePosition}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Search and select a product to feature
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSelectedProduct(null);
                    setActivePosition(null);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Error/Success Messages */}
              {actionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-400 flex-shrink-0"
                  />
                  <span className="text-red-400 text-sm">{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-green-400 flex-shrink-0"
                  />
                  <span className="text-green-400 text-sm">
                    {actionSuccess}
                  </span>
                </div>
              )}

              {/* Selected Product Display */}
              {selectedProduct ? (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Selected Product
                    </h3>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-400 hover:text-white transition text-sm"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-700">
                      <Package className="w-10 h-10 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-lg truncate">
                        {selectedProduct.name}
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 rounded-full text-gray-400 font-mono text-xs mt-1">
                        <Hash size={12} />
                        {selectedProduct.productId}
                      </span>
                      {selectedProduct.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedProduct.categories.map((cat) => (
                            <span
                              key={cat._id}
                              className="px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-400 text-xs"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Input */
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, product ID, or category..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {searching && (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleSelectProduct(product)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-red-500/50 hover:bg-gray-800 transition text-left group"
                        >
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-500 group-hover:text-red-400 transition" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition">
                              {product.name}
                            </p>
                            <p className="text-gray-500 text-xs font-mono">
                              {product.productId}
                            </p>
                          </div>
                          <Plus
                            size={18}
                            className="text-gray-600 group-hover:text-red-400 transition flex-shrink-0"
                          />
                        </button>
                      ))}

                      {/* Load More */}
                      {searchPage < searchTotalPages && (
                        <button
                          onClick={handleLoadMoreSearch}
                          disabled={searchLoadingMore}
                          className="w-full py-3 text-gray-400 hover:text-white transition text-sm font-medium disabled:opacity-50"
                        >
                          {searchLoadingMore ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </span>
                          ) : (
                            "Load More Results"
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {!searching &&
                    searchQuery.length >= 2 &&
                    searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No products found</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}

                  {!searching && searchQuery.length < 2 && (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Type at least 2 characters to search
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Customization Form (only when product selected) */}
              {selectedProduct && (
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-purple-400" />
                    Customize Display
                  </h3>
                  <p className="text-gray-500 text-xs">
                    All fields are optional. Leave empty to use product
                    defaults.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Custom Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., 🔥 Hot New Arrival"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Custom Badge
                      </label>
                      <input
                        type="text"
                        value={formData.customBadge}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customBadge: e.target.value,
                          })
                        }
                        placeholder="e.g., TRENDING, LIMITED"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Custom Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="e.g., Limited Edition - Premium Product"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-400" />
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Clock size={14} className="text-purple-400" />
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {(formData.title ||
                    formData.subtitle ||
                    formData.customBadge) && (
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <p className="text-gray-500 text-xs mb-3">Preview</p>
                      <div className="space-y-1.5">
                        {formData.customBadge && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-bold">
                            <Award size={12} />
                            {formData.customBadge}
                          </span>
                        )}
                        {formData.title && (
                          <p className="text-white font-semibold">
                            {formData.title}
                          </p>
                        )}
                        {formData.subtitle && (
                          <p className="text-gray-400 text-sm">
                            {formData.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSelectedProduct(null);
                    setActivePosition(null);
                    setActionError("");
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetFeatured}
                  disabled={!selectedProduct || submitting}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-red-500/25 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Setting...
                    </>
                  ) : (
                    <>
                      <Star size={18} />
                      Set as New Arrival
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
