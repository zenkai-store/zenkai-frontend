import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import {
  getCachedUserData,
  getUserData,
  getStoredUserData,
} from "../../utils/auth";

import Logo from "../../assets/logo.png";

import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  BadgePercent,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  User,
  Clock,
  ArrowLeft,
  Grid3X3,
  Eye,
  Tag,
  Zap,
} from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");

  // Auth
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState(null);

  // Notification
  const [notification, setNotification] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ======================= CHECK USER AUTH =======================
  useEffect(() => {
    const checkUserAuth = () => {
      const storedData = getStoredUserData();
      const userData = getUserData();

      if (
        (storedData || userData) &&
        storedData?.role !== "admin" &&
        userData?.role !== "admin" &&
        userData?.user?.role !== "admin"
      ) {
        setIsUserLoggedIn(true);
        setUserName(
          storedData?.name || userData?.name || userData?.user?.name || "User",
        );
      } else {
        setIsUserLoggedIn(false);
        setUserName("");
      }
    };
    checkUserAuth();
  }, []);

  // ======================= FETCH WISHLIST =======================
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BASEURL}/api/wishlist?page=${currentPage}&limit=20`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setWishlist(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      } else {
        setError("Failed to load wishlist");
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      if (err.response?.status === 401) {
        setError("Please login to view your wishlist");
      } else {
        setError(err.response?.data?.message || "Failed to load wishlist");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isUserLoggedIn, currentPage]);

  // ======================= REMOVE FROM WISHLIST =======================
  const handleRemoveFromWishlist = async (productId, e) => {
    e.stopPropagation();

    try {
      setDeletingId(productId);

      const response = await axios.delete(
        `${BASEURL}/api/wishlist/${productId}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setWishlist((prev) =>
          prev.filter((item) => item.productId !== productId),
        );
        setTotalItems((prev) => prev - 1);
        showNotification("Removed from wishlist");
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      showNotification(
        err.response?.data?.message || "Failed to remove from wishlist",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================= ADD TO CART =======================
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    showNotification("Add to cart functionality coming soon!");
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDiscount = (marketPrice, sellingPrice) => {
    if (!marketPrice || !sellingPrice || marketPrice <= sellingPrice) return 0;
    return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return { label: "Out of Stock", color: "red", icon: AlertCircle };
    }
    if (item.stockStatus === "low_stock" || item.quantity <= 5) {
      return { label: "Low Stock", color: "orange", icon: Zap };
    }
    return { label: "In Stock", color: "green", icon: CheckCircle };
  };

  // ======================= LOGOUT =======================
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASEURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsUserLoggedIn(false);
        setUserName("");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsUserLoggedIn(false);
      setUserName("");
      navigate("/");
    }
  };

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
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400 px-1">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition text-sm font-medium ${
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
              onClick={() => setCurrentPage(totalPages)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </div>
    );
  };

  // ======================= WISHLIST ITEM COMPONENT =======================
  const WishlistItem = ({ item }) => {
    const image = item.image?.url || null;
    const pricing = item.pricing;
    const discount = pricing
      ? calculateDiscount(pricing.marketPrice, pricing.sellingPrice)
      : 0;
    const stockStatus = getStockStatus(item);
    const StatusIcon = stockStatus.icon;
    const isDeleting = deletingId === item.productId;
    const isOutOfStock = item.quantity <= 0;

    return (
      <div
        onClick={() => item.slug && navigate(`/product/${item.slug}`)}
        className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-44 flex-shrink-0 overflow-hidden bg-gray-50">
            {image ? (
              <img
                src={image}
                alt={item.image?.alt || item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
            )}

            {/* Stock Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-lg ${
                  stockStatus.color === "green"
                    ? "bg-green-500 text-white"
                    : stockStatus.color === "orange"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-900 text-white"
                }`}
              >
                <StatusIcon size={10} />
                {stockStatus.label}
              </span>
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  <BadgePercent size={10} />
                  {discount}% OFF
                </span>
              </div>
            )}

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                <Eye size={15} />
                View Details
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Category & Product Code */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {item.categories?.[0] && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-medium rounded-full">
                    <Tag size={10} />
                    {item.categories[0].name}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 font-mono">
                  {item.productCode}
                </span>
              </div>

              {/* Product Name */}
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors mb-2">
                {item.name}
              </h3>

              {/* Price Section */}
              <div className="flex items-baseline gap-2 flex-wrap mb-3">
                {pricing?.sellingPrice && (
                  <span className="text-xl md:text-2xl font-bold text-red-500">
                    {formatPrice(pricing.sellingPrice)}
                  </span>
                )}
                {pricing?.marketPrice &&
                  pricing.marketPrice > pricing.sellingPrice && (
                    <span className="text-sm line-through text-gray-400">
                      {formatPrice(pricing.marketPrice)}
                    </span>
                  )}
                {discount > 0 && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Save{" "}
                    {formatPrice(pricing.marketPrice - pricing.sellingPrice)}
                  </span>
                )}
                {!pricing?.sellingPrice && !pricing?.marketPrice && (
                  <span className="text-sm text-gray-400">
                    Price on request
                  </span>
                )}
              </div>

              {/* Variant Info */}
              {item.hasVariants && item.variantCount > 0 && (
                <p className="text-xs text-gray-400 mb-2">
                  {item.variantCount} variant{item.variantCount > 1 ? "s" : ""}{" "}
                  available
                </p>
              )}

              {/* Added Date & Stock */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={11} />
                  Added {formatDate(item.addedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusIcon
                    size={11}
                    className={
                      stockStatus.color === "green"
                        ? "text-green-500"
                        : stockStatus.color === "orange"
                          ? "text-orange-500"
                          : "text-red-500"
                    }
                  />
                  {item.quantity} in stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              {!isOutOfStock && (
                <button
                  onClick={(e) => handleAddToCart(item, e)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <ShoppingCart size={15} />
                  Add to Cart
                </button>
              )}
              {isOutOfStock && (
                <button
                  disabled
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-200 text-gray-400 px-5 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
                >
                  <AlertCircle size={15} />
                  Out of Stock
                </button>
              )}
              <button
                onClick={(e) => handleRemoveFromWishlist(item.productId, e)}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-red-50 hover:text-red-500 transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={15} />
                )}
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ======================= SKELETON CARD =======================
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 md:w-56 h-48 sm:h-44 bg-gray-200"></div>
        <div className="flex-1 p-5 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-7 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="flex gap-2 pt-3">
            <div className="h-10 bg-gray-200 rounded-full w-28"></div>
            <div className="h-10 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // ======================= NOT LOGGED IN STATE =======================
  if (!isUserLoggedIn) {
    return (
      <div className="w-full min-h-screen bg-white font-lufga">
        <Notification />

        {/* Top Header */}
        <div className="bg-black text-white text-sm py-2 px-6 flex justify-center items-center">
          <div className="flex items-center gap-2 justify-center text-center">
            <span>
              Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
            </span>
            <button
              onClick={() => navigate("/products")}
              className="underline font-semibold ml-2 hover:text-gray-300"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Navbar */}
        <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-black border-b border-gray-800 sticky top-0 z-40">
          <img
            src={Logo}
            alt="Zenkai.co"
            className="w-20 md:w-24 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-600 transition text-sm flex items-center gap-2"
          >
            <User size={16} />
            Login
          </button>
        </nav>

        <div className="flex items-center justify-center py-32 px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Login Required
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Please login as a user to view and manage your wishlist.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* Top Header */}
      <div className="bg-black text-white text-sm py-2 px-6 flex justify-center items-center">
        <div className="flex items-center gap-2 justify-center text-center">
          <span>
            Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
          </span>
          <button
            onClick={() => navigate("/products")}
            className="underline font-semibold ml-2 hover:text-gray-300"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* ======================= WISHLIST HEADER ======================= */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate("/")}
              className="hover:text-red-500 transition"
            >
              Home
            </button>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">My Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition mb-3 group"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm font-medium">Continue Shopping</span>
              </button>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-500 mt-2">
                {totalItems} item{totalItems !== 1 ? "s" : ""} saved
              </p>
            </div>

            <button
              onClick={fetchWishlist}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition active:scale-95"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ======================= WISHLIST CONTENT ======================= */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
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
                onClick={fetchWishlist}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-14 h-14 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Your Wishlist is Empty
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Save your favorite products to your wishlist and find them
                easily later. Start exploring our collection!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
              >
                <ShoppingBag size={18} />
                Browse Products
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {!loading && !error && wishlist.length > 0 && (
          <>
            <div className="space-y-4">
              {wishlist.map((item) => (
                <WishlistItem key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        )}
      </main>

      {/* ======================= FOOTER NOTE ======================= */}
      {wishlist.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 pb-16">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 text-center">
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium">
              <Heart size={16} className="fill-red-500" />
              Prices may change — grab your favorites before they're gone!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
