import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";

import {
  getCachedUserData,
  setCachedUserData,
  getUserData,
  getStoredUserData,
  setStoredUserData,
} from "../../utils/auth";

import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  AlertCircle,
  Heart,
  ShoppingCart,
  BadgePercent,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Zap,
  Clock,
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

const ListProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const topRef = useRef(null);

  const isInitialMount = useRef(true);

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState("grid");

  // Wishlist
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  // Notification
  const [notification, setNotification] = useState(null);

  // Filter panel (mobile)
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const PRODUCTS_PER_PAGE = 20;

  // Check auth status and update wishlist from products
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASEURL}/api/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setCachedUserData(data.user);
          setStoredUserData(data.user);
          setLoggedIn(true);
          return true;
        } else {
          setLoggedIn(false);
          return false;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setLoggedIn(false);
        return false;
      }
    };

    // Check stored data first for instant login state
    const storedData = getStoredUserData();
    if (storedData) {
      setLoggedIn(true);
    }

    // Always verify with backend
    checkAuth();
  }, []);

  // ======================= FETCH PRODUCTS =======================
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        // Search API
        setIsSearching(true);
        response = await axios.get(
          `${BASEURL}/api/products/search?q=${encodeURIComponent(debouncedSearchQuery)}&page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`,
          { withCredentials: true }, // Always send credentials
        );
      } else {
        // Get all products
        setIsSearching(false);
        response = await axios.get(
          `${BASEURL}/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`,
          { withCredentials: true }, // Always send credentials
        );
      }

      if (response.data.success) {
        let fetchedProducts = response.data.data || [];

        // Sort products
        fetchedProducts = sortProducts(fetchedProducts, sortBy);

        setProducts(fetchedProducts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProducts(response.data.pagination?.total || 0);
        setHasNextPage(response.data.pagination?.hasNextPage || false);
        setHasPrevPage(response.data.pagination?.hasPrevPage || false);

        // Update URL search params
        if (debouncedSearchQuery) {
          setSearchParams({ q: debouncedSearchQuery });
        } else {
          setSearchParams({});
        }

        // Immediately update wishlist state from API response
        // This works regardless of loggedIn state - API returns isWishlisted based on cookies
        const wishlistedProductIds = fetchedProducts
          .filter((p) => p.isWishlisted)
          .map((p) => p._id);
        setWishlistedItems(new Set(wishlistedProductIds));
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, sortBy, setSearchParams]);

  // ======================= SORT PRODUCTS =======================
  const sortProducts = (productsToSort, sortOption) => {
    const sorted = [...productsToSort];

    switch (sortOption) {
      case "price-low":
        return sorted.sort(
          (a, b) =>
            (a.pricing?.sellingPrice || 0) - (b.pricing?.sellingPrice || 0),
        );
      case "price-high":
        return sorted.sort(
          (a, b) =>
            (b.pricing?.sellingPrice || 0) - (a.pricing?.sellingPrice || 0),
        );
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortBy]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current && searchQuery) {
      searchInputRef.current.focus();
    }
  }, []);

  // ======================= PAGINATION =======================
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  // ======================= SEARCH =======================
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // ======================= WISHLIST =======================
  const toggleWishlist = async (productId, e) => {
    e.stopPropagation();

    if (!loggedIn) {
      // Redirect to login if not logged in
      showNotification("Please login to add items to wishlist", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const isWishlisted = wishlistedItems.has(productId);

      if (isWishlisted) {
        // Remove from wishlist
        await axios.delete(`${BASEURL}/api/wishlist/${productId}`, {
          withCredentials: true,
        });
        const newWishlisted = new Set(wishlistedItems);
        newWishlisted.delete(productId);
        setWishlistedItems(newWishlisted);
        showNotification("Removed from wishlist");
      } else {
        // Add to wishlist
        await axios.post(
          `${BASEURL}/api/wishlist/${productId}`,
          {},
          { withCredentials: true },
        );
        const newWishlisted = new Set(wishlistedItems);
        newWishlisted.add(productId);
        setWishlistedItems(newWishlisted);
        showNotification("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      showNotification("Failed to update wishlist", "error");
    }
  };

  // ======================= NOTIFICATION =======================
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ======================= FORMAT FUNCTIONS =======================
  const formatPrice = (price) => {
    if (!price && price !== 0) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product) => {
    if (product.media?.url) {
      return product.media.url;
    }
    return null;
  };

  const getProductPrice = (product) => {
    if (product.pricing?.sellingPrice) {
      return product.pricing.sellingPrice;
    }
    return null;
  };

  const getProductQuantity = (product) => {
    return product.variantSummary?.totalQuantity || 0;
  };

  const getProductColors = (product) => {
    return (
      product.variantSummary?.availableColors?.filter((c) => c.isActive) || []
    );
  };

  const getAverageReview = (product) => {
    return product.averageReview || 0;
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-star-list-${i}`}>
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-star-list-${i})`}
            />
          </svg>,
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="w-3.5 h-3.5 fill-gray-300 text-gray-300"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        );
      }
    }

    return (
      <div className="flex items-center gap-0.5">
        {stars}
        {rating > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  // ======================= SORT OPTIONS =======================
  const sortOptions = [
    { value: "newest", label: "Newest First", icon: Sparkles },
    { value: "price-low", label: "Price: Low to High", icon: ArrowUp },
    { value: "price-high", label: "Price: High to Low", icon: ArrowDown },
    { value: "name-asc", label: "Name: A to Z", icon: ArrowUp },
    { value: "name-desc", label: "Name: Z to A", icon: ArrowDown },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Newest First";

  // ======================= NOTIFICATION COMPONENT =======================
  const Notification = () => {
    if (!notification) return null;

    return (
      <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
        <div
          className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-900 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      </div>
    );
  };

  // ======================= PRODUCT CARD COMPONENT =======================
  const ProductCard = ({ product }) => {
    const image = getProductImage(product);
    const price = getProductPrice(product);
    const quantity = getProductQuantity(product);
    const colors = getProductColors(product);
    const averageReview = getAverageReview(product);
    const isOutOfStock = quantity <= 0;
    const isWishlisted = wishlistedItems.has(product._id);

    return (
      <div
        onClick={() => navigate(`/product/${product.slug}`)}
        className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer ${
          viewMode === "list" ? "flex flex-row" : ""
        }`}
      >
        {/* Product Image */}
        <div
          className={`relative overflow-hidden bg-gray-50 ${
            viewMode === "list"
              ? "w-48 sm:w-56 flex-shrink-0"
              : "w-full aspect-square"
          }`}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full shadow-lg">
                <AlertCircle size={10} />
                Out of Stock
              </span>
            )}
            {product.hasVariants && colors.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                {colors.length} Colors
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={(e) => toggleWishlist(product._id, e)}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition hover:bg-white hover:scale-110"
            >
              <Heart
                size={14}
                className={`transition ${
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.slug}`);
              }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110"
              title="Quick View"
            >
              <Eye size={14} className="text-gray-600" />
            </button>
          </div>

          {/* Quick Add to Cart (Grid View) */}
          {!isOutOfStock && viewMode === "grid" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNotification("Add to cart functionality coming soon!");
              }}
              className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium text-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black active:scale-95"
            >
              <span className="flex items-center justify-center gap-1.5">
                <ShoppingCart size={13} />
                Add to Cart
              </span>
            </button>
          )}
        </div>

        {/* Product Info */}
        <div
          className={`p-4 ${
            viewMode === "list" ? "flex-1 flex flex-col justify-center" : ""
          }`}
        >
          {/* SKU & Stock */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 font-mono">
              {product.productId}
            </span>
            <span
              className={`flex items-center gap-1 text-[10px] font-medium ${
                isOutOfStock ? "text-red-500" : "text-green-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOutOfStock ? "bg-red-500" : "bg-green-500 animate-pulse"
                }`}
              ></span>
              {isOutOfStock ? "Out of Stock" : `${quantity} in stock`}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-red-500 transition-colors">
            {product.name}
          </h3>

          {/* Average Review Stars */}
          {averageReview > 0 && (
            <div className="mt-1 mb-1">{renderStars(averageReview)}</div>
          )}

          {/* Color Dots */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {colors.slice(0, 5).map((color) => (
                <span
                  key={color._id}
                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                ></span>
              ))}
              {colors.length > 5 && (
                <span className="text-[10px] text-gray-400 ml-1">
                  +{colors.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            {price && (
              <span className="text-lg sm:text-xl font-bold text-red-500">
                {formatPrice(price)}
              </span>
            )}
            {!price && (
              <span className="text-sm text-gray-400">Price on request</span>
            )}
          </div>

          {/* Add to Cart (List View) */}
          {!isOutOfStock && viewMode === "list" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNotification("Add to cart functionality coming soon!");
              }}
              className="mt-3 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 w-fit active:scale-95"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    );
  };

  // ======================= SKELETON CARD =======================
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="w-full aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
      </div>
    </div>
  );

  // ======================= PAGINATION COMPONENT =======================
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700 active:scale-95"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400 px-1">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition text-sm font-medium active:scale-95 ${
              page === currentPage
                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-gray-400 px-1">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700 active:scale-95"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </div>
    );
  };

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* ======================= HEADER ======================= */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
          {/* Top Row - Back Button & Title */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition group"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-50 transition">
                <ChevronLeft
                  size={18}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Go Back
              </span>
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 hidden sm:block">
              All Products
            </h1>

            {/* Product Count Badge */}
            <div className="flex items-center gap-2">
              {!loading && !error && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  {totalProducts} product{totalProducts !== 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={fetchProducts}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                title="Refresh"
              >
                <RefreshCw size={15} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Title */}
          <h1 className="text-xl font-bold text-gray-900 sm:hidden pb-3">
            All Products
          </h1>

          {/* Search Bar */}
          <div className="pb-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products by name or product ID..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition active:scale-95"
                >
                  <X size={14} className="text-white" />
                </button>
              )}
            </div>

            {/* Search Status */}
            {isSearching && searchQuery.length >= 2 && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <Search size={12} />
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {!loading && !error && (
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(
                      (currentPage - 1) * PRODUCTS_PER_PAGE + 1,
                      totalProducts,
                    )}
                    -{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalProducts}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-full text-xs text-gray-700 hover:border-gray-300 transition bg-white"
                >
                  <SlidersHorizontal size={13} />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-gray-50 ${
                              sortBy === option.value
                                ? "text-red-500 font-semibold bg-red-50"
                                : "text-gray-700"
                            }`}
                          >
                            <Icon size={13} />
                            {option.label}
                            {sortBy === option.value && (
                              <CheckCircle size={12} className="ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition ${
                    viewMode === "grid"
                      ? "bg-red-500 text-white"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition ${
                    viewMode === "list"
                      ? "bg-red-500 text-white"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= PRODUCTS SECTION ======================= */}
      <main
        ref={topRef}
        className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-6"
      >
        {/* Loading State */}
        {loading && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
                : "flex flex-col gap-4"
            }
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-500 mb-8">{error}</p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isSearching ? "No Results Found" : "No Products Available"}
              </h3>
              <p className="text-gray-500 mb-8">
                {isSearching
                  ? `No products match "${searchQuery}". Try a different search term.`
                  : "There are no products available at the moment."}
              </p>
              {isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <X size={16} />
                  Clear Search
                </button>
              )}
              {!isSearching && (
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <ChevronLeft size={16} />
                  Back to Home
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination />

            {/* Quick Stats */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Package size={13} />
                  {totalProducts} Total Products
                </span>
                <span className="flex items-center gap-1.5">
                  <Grid3X3 size={13} />
                  Page {currentPage} of {totalPages}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={13} />
                  {PRODUCTS_PER_PAGE} Per Page
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ======================= SCROLL TO TOP BUTTON ======================= */}
      <button
        onClick={() => {
          if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="fixed bottom-6 right-6 w-12 h-12 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/25 flex items-center justify-center hover:bg-red-600 transition active:scale-95 z-20"
        title="Scroll to Top"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
};

export default ListProducts;
