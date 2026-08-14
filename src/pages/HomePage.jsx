import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

import { useCart } from "../services/cartService";

import {
  logout,
  getCachedUserData,
  setCachedUserData,
  getStoredUserData,
  setStoredUserData,
  clearCachedUserData,
  clearStoredUserData,
  getAuthHeader,
} from "../utils/auth";

import Logo from "../assets/logo.png";
import HeroVideo from "../assets/video.mp4";
import Advertisement from "../assets/advertisement.png";

import BASEURL from "../config/baseURL";

import {
  Sword,
  Car,
  Users,
  Headphones,
  Gamepad2,
  Heart,
  Truck,
  Headset,
  BadgeDollarSign,
  Package,
  Award,
  Key,
  Sparkles,
  Shield,
  MoreHorizontal,
  AlertCircle,
  BadgePercent,
  Search,
  ShoppingCart,
  User,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

// ==========================================================
// CATEGORY ICON MAPPING
// ==========================================================
const categoryIconMap = {
  katana: <Sword size={28} />,
  diecast: <Car size={28} />,
  "anime-idols": <Users size={28} />,
  marvel: <Shield size={28} />,
  "key-rings": <Key size={28} />,
  others: <MoreHorizontal size={28} />,
};

const defaultCategoryIcon = <Sparkles size={28} />;

// ==========================================================
// CATEGORY CARD COMPONENT
// ==========================================================
const CategoryCard = ({ icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    aria-label={`Browse ${label}`}
    className={`
      group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border
      transition-all duration-300 cursor-pointer select-none
      ${
        isActive
          ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
          : "bg-white border-gray-200 text-gray-700 hover:border-red-500 hover:shadow-md hover:shadow-red-500/10 hover:-translate-y-1"
      }
    `}
  >
    <div
      className={`transition-colors duration-300 ${
        isActive ? "text-white" : "text-gray-500 group-hover:text-red-500"
      }`}
    >
      {icon}
    </div>
    <span className="font-medium text-sm text-center leading-tight">{label}</span>
  </div>
);

// ==========================================================
// PRODUCT CARD COMPONENT (shared between New Arrivals & Explore)
// ==========================================================
const ProductCard = ({
  product,
  onNavigate,
  onWishlistToggle,
  isWishlisted,
  formatPrice,
  calculateDiscount,
  renderStars,
  variant = "explore", // "featured" | "explore"
}) => {
  const discount = calculateDiscount(product.marketPrice, product.sellingPrice);
  const isOutOfStock =
    variant === "explore" ? product.quantity <= 0 : false;

  return (
    <div
      onClick={() => product.slug && onNavigate(`/product/${product.slug}`)}
      className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1"
      role="link"
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === "Enter" &&
        product.slug &&
        onNavigate(`/product/${product.slug}`)
      }
      aria-label={`View ${product.name}`}
    >
      {/* Image Area */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ transform: "scale(1)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.customBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold rounded-full shadow">
              <Award size={9} />
              {product.customBadge}
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full shadow">
              -{discount}%
            </span>
          )}
          {(product.isOnSale || (variant === "featured" && product.onSalePrice)) && !product.customBadge && !discount && (
            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow">
              SALE
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] font-bold rounded-full shadow">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button — explore variant only */}
        {variant === "explore" && (
          <button
            onClick={(e) => onWishlistToggle(product._id, e)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
          >
            <Heart
              size={15}
              className={`transition-colors duration-200 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
        )}

        {/* Quick View — slide up on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            product.slug && onNavigate(`/product/${product.slug}`);
          }}
          className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900/90 text-white py-2.5 text-xs font-semibold tracking-wide text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          aria-label={`Quick view ${product.name}`}
        >
          QUICK VIEW
        </button>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug group-hover:text-red-600 transition-colors duration-200">
          {product.name}
        </h3>

        {product.averageReview > 0 && (
          <div className="mt-1.5">{renderStars(product.averageReview)}</div>
        )}

        {/* Color Variants — explore variant only */}
        {variant === "explore" && product.colors?.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color._id}
                className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color.code }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400 ml-0.5">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-2.5 flex-wrap">
          {product.sellingPrice && (
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.sellingPrice)}
            </span>
          )}
          {product.marketPrice && product.marketPrice > product.sellingPrice && (
            <span className="text-xs line-through text-gray-400">
              {formatPrice(product.marketPrice)}
            </span>
          )}
          {!product.sellingPrice && !product.marketPrice && (
            <span className="text-xs text-gray-400">Price on request</span>
          )}
        </div>

        {/* Stock — explore variant only */}
        {variant === "explore" && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock ? "bg-red-400" : "bg-emerald-500"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                isOutOfStock ? "text-red-500" : "text-emerald-600"
              }`}
            >
              {isOutOfStock ? "Out of stock" : `${product.quantity} in stock`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// MAIN HOME PAGE
// ==========================================================
const HomePage = ({ isLoggedIn: propIsLoggedIn, setIsLoggedIn }) => {
  const [loggedIn, setLoggedIn] = useState(propIsLoggedIn || false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [exploreProducts, setExploreProducts] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(true);
  const [exploreError, setExploreError] = useState("");

  const { cartCount, fetchCart } = useCart();

  const categoryScrollRef = useRef(null);

  // Sync local loggedIn state with App prop
  useEffect(() => {
    if (propIsLoggedIn) {
      const storedData = getStoredUserData();
      setLoggedIn(true);
      setUserName(storedData?.name || storedData?.user?.name || "User");
    } else {
      setLoggedIn(false);
      setUserName("");
    }
  }, [propIsLoggedIn]);

  // Admin keyboard shortcut — Shift+5
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.shiftKey && e.key === "%") || (e.shiftKey && e.key === "5")) {
        e.preventDefault();
        navigate("/admin/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedData = getStoredUserData();
      if (storedData) {
        setCachedUserData(storedData);
        setLoggedIn(true);
        setIsLoggedIn(true);
        setUserName(storedData.name || "User");
        try {
          const response = await fetch(`${BASEURL}/api/auth/me`, {
            credentials: "include",
            headers: getAuthHeader(),
          });
          if (response.ok) {
            const data = await response.json();
            setCachedUserData(data.user);
            setStoredUserData(data.user);
            setUserName(data.user.name || "User");
          }
        } catch (error) {
          console.error("Backend verification error:", error);
        }
      } else {
        try {
          const response = await fetch(`${BASEURL}/api/auth/me`, {
            credentials: "include",
            headers: getAuthHeader(),
          });
          if (response.ok) {
            const data = await response.json();
            setCachedUserData(data.user);
            setStoredUserData(data.user);
            setLoggedIn(true);
            setIsLoggedIn(true);
            setUserName(data.user.name || "User");
          } else {
            setLoggedIn(false);
            setIsLoggedIn(false);
            setUserName("");
          }
        } catch (error) {
          console.error("Auth check error:", error);
          setLoggedIn(false);
          setIsLoggedIn(false);
          setUserName("");
        }
      }
    };
    checkAuth();
  }, [setIsLoggedIn]);

  // ==========================================================
  // WISHLIST HANDLER
  // ==========================================================
  const handleWishlistToggle = async (productId, e) => {
    e.stopPropagation();
    if (!loggedIn) {
      navigate("/login");
      return;
    }
    try {
      setWishlistLoading(true);
      const isWishlisted = wishlistedItems.has(productId);
      if (isWishlisted) {
        await axiosClient.delete(`/api/wishlist/${productId}`, {
          withCredentials: true,
        });
        const updated = new Set(wishlistedItems);
        updated.delete(productId);
        setWishlistedItems(updated);
      } else {
        await axiosClient.post(`/api/wishlist/${productId}`, {}, { withCredentials: true });
        const updated = new Set(wishlistedItems);
        updated.add(productId);
        setWishlistedItems(updated);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchCart();
  }, [loggedIn]);

  // ==========================================================
  // FETCH NEW ARRIVALS
  // ==========================================================
  const fetchNewArrivals = async () => {
    try {
      setNewArrivalsLoading(true);
      setNewArrivalsError("");
      const response = await axiosClient.get(`/api/featured`, { withCredentials: false });
      if (response.data.success) {
        const data = response.data.data;
        const arrivalsArray = [];
        for (let i = 1; i <= 4; i++) {
          if (data[i] && data[i].productId) {
            const item = data[i];
            const product = item.productId;
            const defaultVariant = item.defaultVariant;
            arrivalsArray.push({
              _id: item._id,
              productId: product._id,
              name: product.name || "Unknown Product",
              slug: product.slug || "",
              customBadge: item.customBadge || null,
              title: item.title || null,
              displayPosition: item.displayPosition,
              image: defaultVariant?.media?.[0]?.url || null,
              marketPrice: defaultVariant?.pricing?.marketPrice || null,
              sellingPrice: defaultVariant?.pricing?.sellingPrice || null,
              onSalePrice: defaultVariant?.pricing?.onSalePrice || null,
              isOnSale: defaultVariant?.isOnSale || false,
            });
          }
        }
        setNewArrivals(arrivalsArray);
      } else {
        setNewArrivalsError("Failed to load new arrivals");
      }
    } catch (err) {
      console.error("Failed to fetch new arrivals:", err);
      setNewArrivalsError(err.response?.data?.message || "Failed to load new arrivals");
    } finally {
      setNewArrivalsLoading(false);
    }
  };

  // ==========================================================
  // FETCH CATEGORIES
  // ==========================================================
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const response = await axiosClient.get(`/api/admin/categories/`, { withCredentials: false });
      if (response.data.success) {
        const sortedCategories = (response.data.data || []).sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setCategories(sortedCategories);
      } else {
        setCategoriesError("Failed to load categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoriesError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ==========================================================
  // FETCH EXPLORE PRODUCTS
  // ==========================================================
  const fetchExploreProducts = async () => {
    try {
      setExploreLoading(true);
      setExploreError("");
      const response = await axiosClient.get(`/api/products?page=1&limit=4`, {
        withCredentials: loggedIn,
      });
      if (response.data.success) {
        const products = (response.data.data || []).slice(0, 4).map((product) => ({
          _id: product._id,
          name: product.name || "Unknown Product",
          slug: product.slug || "",
          productId: product.productId || "",
          image: product.media?.url || null,
          sellingPrice: product.pricing?.sellingPrice || null,
          marketPrice: product.pricing?.maxPrice || null,
          quantity: product.variantSummary?.totalQuantity || 0,
          colors: product.variantSummary?.availableColors?.filter((c) => c.isActive) || [],
          averageReview: product.averageReview || 0,
          isWishlisted: product.isWishlisted || false,
        }));
        setExploreProducts(products);
      } else {
        setExploreError("Failed to load products");
      }
    } catch (err) {
      console.error("Failed to fetch explore products:", err);
      setExploreError(err.response?.data?.message || "Failed to load products");
    } finally {
      setExploreLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
    fetchCategories();
    fetchExploreProducts();
    if (loggedIn) fetchCart();
  }, [loggedIn, fetchCart]);

  useEffect(() => {
    if (loggedIn && exploreProducts.length > 0) {
      const wishlistedProductIds = exploreProducts
        .filter((p) => p.isWishlisted)
        .map((p) => p._id);
      setWishlistedItems(new Set(wishlistedProductIds));
    } else if (!loggedIn) {
      setWishlistedItems(new Set());
    }
  }, [loggedIn, exploreProducts]);

  // ==========================================================
  // HELPERS
  // ==========================================================
  const formatPrice = (price) => {
    if (!price && price !== 0) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (marketPrice, sellingPrice) => {
    if (!marketPrice || !sellingPrice || marketPrice <= sellingPrice) return 0;
    return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-3 h-3 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-3 h-3" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-${i})`}
            />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-3 h-3 fill-gray-200 text-gray-200" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      }
    }
    return (
      <div className="flex items-center gap-0.5">
        {stars}
        {rating > 0 && (
          <span className="text-[10px] text-gray-400 ml-1 font-medium">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  // ==========================================================
  // SEARCH HANDLER
  // ==========================================================
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.length >= 2) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
    } else if (query.length === 0) {
      navigate("/products");
    }
    setSearchQuery("");
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================
  const handleLogout = async () => {
    try {
      await fetch(`${BASEURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeader(),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("userData");
      localStorage.removeItem("zenkai_user_data");
      sessionStorage.removeItem("userData");
      setLoggedIn(false);
      setIsLoggedIn(false);
      setUserName("");
      navigate("/");
    }
  };

  // ==========================================================
  // CATEGORY SCROLL
  // ==========================================================
  const scrollCategories = (direction) => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 280;
    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="w-full min-h-screen font-lufga bg-white overflow-x-hidden">

      {/* ================================================================
          ANNOUNCEMENT BAR
      ================================================================ */}
      <div className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          <span className="text-xs sm:text-sm text-gray-300 tracking-wide text-center">
            Summer Sale — All DieCast Cars &amp; Free Delivery&nbsp;&nbsp;
            <span className="text-red-400 font-semibold">30% OFF</span>
          </span>
          <button
            onClick={() => navigate("/products")}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-white border border-white/30 rounded-full px-3 py-1 hover:bg-white hover:text-black transition-all duration-200 whitespace-nowrap"
          >
            Shop Now <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={HeroVideo} type="video/mp4" />
        </video>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Content layer */}
        <div className="relative z-20 flex flex-col min-h-screen">

          {/* -------------------------------------------------------
              NAVBAR
          ------------------------------------------------------- */}
          <nav
            className="w-full px-5 sm:px-8 lg:px-16 py-5 flex items-center justify-between"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <img
              src={Logo}
              alt="Zenkai"
              onClick={() => navigate("/")}
              className="h-8 sm:h-9 w-auto cursor-pointer opacity-95 hover:opacity-100 transition-opacity duration-200"
            />

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {[
                { label: "Shop", path: "/products" },
                { label: "Categories", path: "/on-sale" },
                { label: "New Arrivals", path: "/new-arrivals" },
                { label: "Contact", path: "/contact" },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-red-500 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collectibles..."
                  className="bg-white/10 backdrop-blur-md text-white placeholder-white/50 text-sm rounded-full py-2 pl-4 pr-9 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/15 w-44 lg:w-52 transition-all duration-200"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  <Search size={14} />
                </button>
              </form>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                className="relative p-2 text-white/90 hover:text-white transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5 leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Profile / Login */}
              {loggedIn ? (
                <div className="relative group hidden md:block">
                  <button
                    className="flex items-center gap-1.5 p-2 text-white/90 hover:text-white transition-colors"
                    aria-label="User menu"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {userName || "Profile"}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl shadow-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 overflow-hidden">
                    {[
                      { label: "My Profile", path: "/profile" },
                      { label: "Addresses", path: "/address" },
                      { label: "Orders", path: "/orders" },
                      { label: "Wishlist", path: "/wishlist" },
                    ].map(({ label, path }) => (
                      <button
                        key={path}
                        onClick={() => navigate(path)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <User size={15} />
                  Login
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className="md:hidden p-2 text-white/90 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>

          {/* -------------------------------------------------------
              MOBILE MENU DRAWER
          ------------------------------------------------------- */}
          <div
            className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
              isMenuOpen ? "visible" : "invisible"
            }`}
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                isMenuOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Panel */}
            <div
              className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-gray-950 flex flex-col transition-transform duration-300 ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <img src={Logo} alt="Zenkai" className="h-7 w-auto opacity-90" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="px-6 py-4 border-b border-white/10">
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setIsMenuOpen(false);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collectibles..."
                    className="w-full bg-white/8 text-white placeholder-white/40 text-sm rounded-lg py-2.5 pl-4 pr-10 border border-white/15 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <Search size={15} />
                  </button>
                </form>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1">
                {[
                  { label: "Shop", path: "/products" },
                  { label: "Categories", path: "/on-sale" },
                  { label: "New Arrivals", path: "/new-arrivals" },
                  { label: "Brands", path: "/brands" },
                  { label: "Contact", path: "/contact" },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => {
                      navigate(path);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full py-3.5 text-white/85 hover:text-white text-base font-medium border-b border-white/8 transition-colors"
                  >
                    {label}
                    <ChevronRight size={16} className="text-white/30" />
                  </button>
                ))}

                {/* Auth in mobile menu */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  {loggedIn ? (
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "My Profile", path: "/profile" },
                        { label: "Orders", path: "/orders" },
                        { label: "Wishlist", path: "/wishlist" },
                      ].map(({ label, path }) => (
                        <button
                          key={path}
                          onClick={() => {
                            navigate(path);
                            setIsMenuOpen(false);
                          }}
                          className="py-3 text-left text-white/70 hover:text-white text-sm transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="mt-2 py-3 text-left text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-3 text-center text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Login / Sign Up
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </div>

          {/* -------------------------------------------------------
              HERO COPY
          ------------------------------------------------------- */}
          <div className="flex-1 flex items-center">
            <div className="w-full px-5 sm:px-8 lg:px-16 pb-20 pt-8">
              <div className="max-w-xl">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-px bg-red-500" />
                  <span className="text-red-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                    The Collector's Destination
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                  Collect The Cars<br />
                  <span className="text-gray-300">You've Always</span><br />
                  Wanted.
                </h1>

                {/* Sub-copy */}
                <p className="text-gray-300/90 text-base sm:text-lg leading-relaxed max-w-md mb-8">
                  Premium DieCast models, anime figures, Marvel collectibles &amp; more — curated for true enthusiasts.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/products")}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 hover:gap-3"
                  >
                    Explore Collection <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => navigate("/new-arrivals")}
                    className="inline-flex items-center gap-2 text-white border border-white/40 hover:border-white hover:bg-white/10 font-medium text-sm px-6 py-3 rounded-full transition-all duration-200"
                  >
                    New Arrivals
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade into next section */}
          <div className="h-16 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
        </div>
      </section>

      {/* ================================================================
          NEW ARRIVALS / FEATURED SECTION
      ================================================================ */}
      <section className="w-full bg-gray-950 py-20 px-5 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-px bg-red-500" />
                <span className="text-red-500 text-xs font-semibold tracking-[0.2em] uppercase">
                  Fresh From The Garage
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                New Arrivals
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Our latest additions to the collector's floor.
              </p>
            </div>
            <button
              onClick={() => navigate("/new-arrivals")}
              className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-all duration-200"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          {/* Loading */}
          {newArrivalsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-gray-900 animate-pulse">
                  <div className="aspect-square bg-gray-800" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!newArrivalsLoading && newArrivalsError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-10 h-10 text-gray-700 mb-3" />
              <p className="text-gray-600 text-sm">{newArrivalsError}</p>
            </div>
          )}

          {/* Empty */}
          {!newArrivalsLoading && !newArrivalsError && newArrivals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-10 h-10 text-gray-700 mb-3" />
              <p className="text-gray-600 text-sm">No new arrivals available</p>
            </div>
          )}

          {/* Cards */}
          {!newArrivalsLoading && newArrivals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <div
                  key={product._id}
                  onClick={() => product.slug && navigate(`/product/${product.slug}`)}
                  className="group cursor-pointer bg-gray-900 border border-white/8 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1"
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && product.slug && navigate(`/product/${product.slug}`)
                  }
                  aria-label={`View ${product.name}`}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-800">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ transform: "scale(1)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-600" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {product.customBadge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-700 to-red-500 text-white text-[9px] font-bold rounded-full shadow">
                          <Award size={8} />
                          {product.customBadge}
                        </span>
                      )}
                      {product.isOnSale && product.onSalePrice && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-bold rounded-full shadow">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Quick view */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white py-2 text-[10px] font-semibold tracking-wider text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      QUICK VIEW
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5">
                    <h3 className="text-white text-xs sm:text-sm font-semibold truncate leading-snug group-hover:text-red-400 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                      {product.sellingPrice && (
                        <span className="text-sm font-bold text-white">
                          {formatPrice(product.sellingPrice)}
                        </span>
                      )}
                      {product.marketPrice && product.marketPrice > product.sellingPrice && (
                        <span className="text-[10px] line-through text-gray-600">
                          {formatPrice(product.marketPrice)}
                        </span>
                      )}
                      {!product.sellingPrice && !product.marketPrice && (
                        <span className="text-xs text-gray-600">Price on request</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          CATEGORIES SECTION
      ================================================================ */}
      <section className="w-full bg-white py-20 px-5 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-px bg-red-500" />
                <span className="text-red-500 text-xs font-semibold tracking-[0.2em] uppercase">
                  Collections
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Browse By Category
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCategories("left")}
                aria-label="Scroll categories left"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-500 hover:text-red-500 transition-all duration-200"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCategories("right")}
                aria-label="Scroll categories right"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-500 hover:text-red-500 transition-all duration-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Loading */}
          {categoriesLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-5 animate-pulse flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!categoriesLoading && categoriesError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">{categoriesError}</p>
            </div>
          )}

          {/* Empty */}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No categories available</p>
            </div>
          )}

          {/* Category Cards — scrollable on mobile */}
          {!categoriesLoading && categories.length > 0 && (
            <div
              ref={categoryScrollRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  icon={categoryIconMap[category.slug] || defaultCategoryIcon}
                  label={category.name}
                  isActive={false}
                  onClick={() => navigate(`/category/${category.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          ADVERTISEMENT BANNER
      ================================================================ */}
      <section className="w-full px-5 sm:px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            onClick={() => navigate("/products")}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
            aria-label="View campaign"
          >
            <img
              src={Advertisement}
              alt="Campaign — Shop the Collection"
              className="w-full object-cover max-h-[420px] transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          EXPLORE PRODUCTS SECTION
      ================================================================ */}
      <section className="w-full bg-white py-20 px-5 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-px bg-red-500" />
                <span className="text-red-500 text-xs font-semibold tracking-[0.2em] uppercase">
                  The Collection
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Explore Our Products
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Handpicked models for every collector.
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-red-600 px-5 py-2.5 rounded-full transition-all duration-200"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {/* Loading */}
          {exploreLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!exploreLoading && exploreError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">{exploreError}</p>
              <button
                onClick={fetchExploreProducts}
                className="mt-4 text-sm text-red-500 hover:text-red-700 underline transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!exploreLoading && !exploreError && exploreProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No products available</p>
            </div>
          )}

          {/* Product Grid */}
          {!exploreLoading && exploreProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {exploreProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onNavigate={navigate}
                  onWishlistToggle={handleWishlistToggle}
                  isWishlisted={wishlistedItems.has(product._id)}
                  formatPrice={formatPrice}
                  calculateDiscount={calculateDiscount}
                  renderStars={renderStars}
                  variant="explore"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          TRUST / SERVICES SECTION
      ================================================================ */}
      <section className="w-full bg-gray-950 py-16 px-5 sm:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden">
            {[
              {
                icon: <Truck size={28} />,
                title: "Free & Fast Delivery",
                desc: "Free delivery on all orders over ₹140",
              },
              {
                icon: <Headset size={28} />,
                title: "24/7 Customer Service",
                desc: "Friendly support, always available",
              },
              {
                icon: <BadgeDollarSign size={28} />,
                title: "Money Back Guarantee",
                desc: "Full refund within 30 days",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center px-8 py-10 bg-gray-950 hover:bg-gray-900 transition-colors duration-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/8 flex items-center justify-center text-white mb-5">
                  {icon}
                </div>
                <h3 className="text-white font-semibold text-base tracking-wide mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
