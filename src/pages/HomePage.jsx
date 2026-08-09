import React, { useState, useEffect, useCallback } from "react";
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

// Replace these with your actual assets
import Logo from "../assets/logo.png";
import HeroVideo from "../assets/video.mp4";
import Advertisement from "../assets/advertisement.png";

import BASEURL from "../config/baseURL";

import {
  Sword,
  Car,
  Users,
  Camera,
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
} from "lucide-react";

// ==========================================================
// CATEGORY ICON MAPPING
// ==========================================================
const categoryIconMap = {
  katana: <Sword size={48} />,
  diecast: <Car size={48} />,
  "anime-idols": <Users size={48} />,
  marvel: <Shield size={48} />,
  "key-rings": <Key size={48} />,
  others: <MoreHorizontal size={48} />,
};

// Fallback icon for any new/unknown categories
const defaultCategoryIcon = <Sparkles size={48} />;

const HomePage = ({ isLoggedIn: propIsLoggedIn, setIsLoggedIn }) => {
  const [loggedIn, setLoggedIn] = useState(propIsLoggedIn || false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Wishlist state
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // New Arrivals state
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // Explore Products state
  const [exploreProducts, setExploreProducts] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(true);
  const [exploreError, setExploreError] = useState("");

  // Cart state
  const { cartCount, fetchCart } = useCart();

  // Sync the local loggedIn state with the prop from App
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

  // ==========================================================
  // SECRET KEY LISTENER — Shift + 5 → Go to AdminLogin page
  // ==========================================================
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

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedData = getStoredUserData();

      if (storedData) {
        // Immediately show logged-in state from localStorage
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
          // Never wipe localStorage on a failed /api/auth/me — Safari blocks
          // cross-origin cookies causing false 401s. Only explicit logout clears
          // the session. A genuinely expired token will 401 on data fetches.
        } catch (error) {
          // Network error — keep user logged in from localStorage; don't clear
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
      // User not logged in - redirect to login
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);
      const isWishlisted = wishlistedItems.has(productId);

      if (isWishlisted) {
        // Remove from wishlist
        await axiosClient.delete(`/api/wishlist/${productId}`, {
          withCredentials: true,
        });
        const newWishlisted = new Set(wishlistedItems);
        newWishlisted.delete(productId);
        setWishlistedItems(newWishlisted);
      } else {
        // Add to wishlist
        await axiosClient.post(
          `/api/wishlist/${productId}`,
          {},
          { withCredentials: true },
        );
        const newWishlisted = new Set(wishlistedItems);
        newWishlisted.add(productId);
        setWishlistedItems(newWishlisted);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Fetch cart when logged in
  useEffect(() => {
    if (loggedIn) {
      fetchCart();
    }
  }, [loggedIn]);

  // ==========================================================
  // FETCH NEW ARRIVALS
  // ==========================================================
  const fetchNewArrivals = async () => {
    try {
      setNewArrivalsLoading(true);
      setNewArrivalsError("");

      const response = await axiosClient.get(`/api/featured`, {
        withCredentials: false,
      });

      if (response.data.success) {
        // Transform the API response into an array for easier rendering
        const data = response.data.data;
        const arrivalsArray = [];

        // Iterate through positions 1-4
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
      setNewArrivalsError(
        err.response?.data?.message || "Failed to load new arrivals",
      );
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

      const response = await axiosClient.get(`/api/admin/categories/`, {
        withCredentials: false,
      });

      if (response.data.success) {
        // Sort by displayOrder
        const sortedCategories = (response.data.data || []).sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
        );
        setCategories(sortedCategories);
      } else {
        setCategoriesError("Failed to load categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoriesError(
        err.response?.data?.message || "Failed to load categories",
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ==========================================================
  // FETCH EXPLORE PRODUCTS (first 4 products)
  // ==========================================================
  const fetchExploreProducts = async () => {
    try {
      setExploreLoading(true);
      setExploreError("");

      const response = await axiosClient.get(
        `/api/products?page=1&limit=4`,
        { withCredentials: loggedIn }, // Send credentials if logged in
      );

      if (response.data.success) {
        const products = (response.data.data || [])
          .slice(0, 4)
          .map((product) => ({
            _id: product._id,
            name: product.name || "Unknown Product",
            slug: product.slug || "",
            productId: product.productId || "",
            image: product.media?.url || null,
            sellingPrice: product.pricing?.sellingPrice || null,
            marketPrice: product.pricing?.maxPrice || null,
            quantity: product.variantSummary?.totalQuantity || 0,
            colors:
              product.variantSummary?.availableColors?.filter(
                (c) => c.isActive,
              ) || [],
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
    if (loggedIn) {
      fetchCart();
    }
  }, [loggedIn, fetchCart]); // Re-fetch when login state changes

  // Update wishlist from explore products when login state changes
  useEffect(() => {
    if (loggedIn && exploreProducts.length > 0) {
      const wishlistedProductIds = exploreProducts
        .filter((p) => p.isWishlisted)
        .map((p) => p._id);
      setWishlistedItems(new Set(wishlistedProductIds));
    } else if (!loggedIn) {
      // Clear wishlist when logged out
      setWishlistedItems(new Set());
    }
  }, [loggedIn, exploreProducts]);

  // ==========================================================
  // FORMAT PRICE
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
              <linearGradient id={`half-star-${i}`}>
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-star-${i})`}
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

  // Logout function
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
      // Always clean frontend state
      localStorage.removeItem("userData");
      localStorage.removeItem("zenkai_user_data");
      sessionStorage.removeItem("userData");

      setLoggedIn(false);
      setIsLoggedIn(false);
      setUserName("");

      navigate("/");
    }
  };

  return (
    <div className="w-full min-h-screen font-lufga bg-white">
      {/* ------------------------------ THIN TOP HEADER ------------------------------ */}
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

      {/* ------------------------------ HERO SECTION (VIDEO BACKGROUND) ------------------------------ */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={HeroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 z-10"></div>

        {/* Content Wrapper */}
        <div className="relative z-20">
          {/* ------------------------------ NAVBAR ------------------------------ */}
          <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-transparent text-white">
            {/* Logo */}
            <img
              src={Logo}
              alt="Zenkai.co"
              className="w-24 md:w-28 cursor-pointer transition-transform duration-300 hover:scale-105"
            />

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10 font-medium">
              <a href="/products" className="hover:text-gray-300">
                Shop
              </a>
              <a href="/on-sale" className="hover:text-gray-300">
                Categories
              </a>
              <a href="/new-arrivals" className="hover:text-gray-300">
                New Arrivals
              </a>
              <a href="/contact" className="hover:text-gray-300">
                Contact
              </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="relative hidden md:block"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-1 focus:ring-white w-48 lg:w-56"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Cart Icon */}
              <button onClick={() => navigate("/cart")} className="relative">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile / Login */}
              {loggedIn ? (
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="hidden md:inline">
                      {userName || "Profile"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => navigate("/address")}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition"
                      >
                        Addresses
                      </button>
                      <button
                        onClick={() => navigate("/orders")}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => navigate("/wishlist")}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition"
                      >
                        Wishlist
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-black/90 backdrop-blur-md text-white py-4 px-6 flex flex-col gap-4 z-30">
              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(e);
                  setIsMenuOpen(false);
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full bg-white/10 text-white placeholder-white/60 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-1 focus:ring-white text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              <a
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="hover:text-gray-300 py-2"
              >
                Shop
              </a>
              <a
                onClick={() => {
                  navigate("/on-sale");
                  setIsMenuOpen(false);
                }}
                className="hover:text-gray-300 py-2"
              >
                On Sale
              </a>
              <a
                onClick={() => {
                  navigate("/new-arrivals");
                  setIsMenuOpen(false);
                }}
                className="hover:text-gray-300 py-2"
              >
                New Arrivals
              </a>
              <a
                onClick={() => {
                  navigate("/brands");
                  setIsMenuOpen(false);
                }}
                className="hover:text-gray-300 py-2"
              >
                Brands
              </a>
            </div>
          )}

          {/* ------------------------------ NEW ARRIVALS (Overlay) ------------------------------ */}
          <div
            className={`
              w-full 
              md:absolute md:top-20 md:right-6 md:w-[30%] 
              bg-black/70 backdrop-blur-sm p-6 rounded-xl shadow-2xl
              mt-8 md:mt-0
            `}
          >
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-pink-500 pl-3">
              NEW ARRIVALS
            </h2>

            {/* Loading State */}
            {newArrivalsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error State */}
            {!newArrivalsLoading && newArrivalsError && (
              <div className="text-center py-6">
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">{newArrivalsError}</p>
              </div>
            )}

            {/* Empty State */}
            {!newArrivalsLoading &&
              !newArrivalsError &&
              newArrivals.length === 0 && (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No new arrivals available
                  </p>
                </div>
              )}

            {/* Product Cards Grid */}
            {!newArrivalsLoading && newArrivals.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {newArrivals.map((product) => (
                  <div
                    key={product._id}
                    onClick={() =>
                      product.slug && navigate(`/product/${product.slug}`)
                    }
                    className="bg-white/10 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group"
                  >
                    {/* Product Image with Badge */}
                    <div className="w-full h-32 overflow-hidden relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-500" />
                        </div>
                      )}

                      {/* Custom Badge - Positioned at top of image */}
                      {product.customBadge && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                            <Award size={10} className="text-white" />
                            {product.customBadge}
                          </span>
                        </div>
                      )}

                      {/* On Sale Badge */}
                      {product.isOnSale && product.onSalePrice && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                            SALE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 text-white">
                      <h3 className="font-semibold text-xs sm:text-sm truncate leading-tight">
                        {product.name}
                      </h3>

                      {/* Average Review Stars */}
                      {product.averageReview > 0 && (
                        <div className="mt-1.5">
                          {renderStars(product.averageReview)}
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                        {/* Selling Price - Bold */}
                        {product.sellingPrice && (
                          <span className="text-sm sm:text-base font-bold text-white">
                            {formatPrice(product.sellingPrice)}
                          </span>
                        )}

                        {/* Market Price - Strikethrough (original price) */}
                        {product.marketPrice && (
                          <span className="text-[10px] sm:text-xs line-through text-gray-400">
                            {formatPrice(product.marketPrice)}
                          </span>
                        )}
                      </div>

                      {/* No price fallback */}
                      {!product.sellingPrice && !product.marketPrice && (
                        <span className="text-xs text-gray-400 mt-1 block">
                          Price on request
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------ PRODUCTS SHOWCASE SECTION ------------------------------ */}
      <section className="w-full bg-white py-16 px-6 md:px-20">
        <div className="max-w-[1170px] mx-auto">
          {/* ----- Category Header ----- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-5 h-10 bg-red-500 rounded"></div>
                <h3 className="text-red-500 font-poppins font-semibold text-base">
                  Categories
                </h3>
              </div>
              <h2 className="text-black font-inter font-semibold text-2xl md:text-3xl lg:text-4xl tracking-wide">
                Browse By Category
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ----- Category Cards Grid ----- */}
          {categoriesLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categoriesError ? (
            <div className="col-span-full text-center py-6">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{categoriesError}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-6">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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

          {/* ----- Advertisement ----- */}
          <div className="mt-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <img
                src={Advertisement}
                alt="advertisement"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          {/* ----- Product Grid ----- */}
          <div className="mt-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-10 bg-red-500 rounded"></div>
                  <h3 className="text-red-500 font-poppins font-semibold text-base">
                    Our Products
                  </h3>
                </div>
                <h2 className="text-black font-inter font-semibold text-2xl md:text-3xl lg:text-4xl tracking-wide">
                  Explore Our Products
                </h2>
              </div>
              <button
                onClick={() => navigate("/products")}
                className="text-red-500 border border-red-500 px-6 py-2 rounded hover:bg-red-500 hover:text-white transition"
              >
                View All
              </button>
            </div>

            {/* Loading State */}
            {exploreLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : exploreError ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{exploreError}</p>
              </div>
            ) : exploreProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {exploreProducts.map((product) => {
                  const discount = calculateDiscount(
                    product.marketPrice,
                    product.sellingPrice,
                  );
                  const isOutOfStock = product.quantity <= 0;

                  return (
                    <div
                      key={product._id}
                      onClick={() =>
                        product.slug && navigate(`/product/${product.slug}`)
                      }
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100"
                    >
                      {/* Product Image */}
                      <div className="relative h-56 lg:h-48 xl:h-44 overflow-hidden bg-gray-50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-300" />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {discount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                              <BadgePercent size={10} />
                              {discount}% OFF
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full shadow-lg">
                              <AlertCircle size={10} />
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleWishlistToggle(product._id, e)}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition hover:bg-white"
                        >
                          <Heart
                            size={18}
                            className={`transition ${
                              wishlistedItems.has(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600 hover:text-red-500"
                            }`}
                          />
                        </button>

                        {/* Quick View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            product.slug &&
                              navigate(`/product/${product.slug}`);
                          }}
                          className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium text-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black text-center"
                        >
                          Quick View
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate group-hover:text-red-500 transition-colors">
                          {product.name}
                        </h3>

                        {/* Average Review Stars */}
                        {product.averageReview > 0 && (
                          <div className="mt-1.5">
                            {renderStars(product.averageReview)}
                          </div>
                        )}

                        {/* Color Dots */}
                        {product.colors.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {product.colors.slice(0, 4).map((color) => (
                              <span
                                key={color._id}
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: color.code }}
                                title={color.name}
                              ></span>
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-[10px] text-gray-400 ml-1">
                                +{product.colors.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-2.5">
                          {product.sellingPrice && (
                            <span className="text-lg sm:text-xl font-bold text-red-500">
                              {formatPrice(product.sellingPrice)}
                            </span>
                          )}
                          {product.marketPrice &&
                            product.marketPrice > product.sellingPrice && (
                              <span className="text-xs sm:text-sm line-through text-gray-400">
                                {formatPrice(product.marketPrice)}
                              </span>
                            )}
                          {!product.sellingPrice && !product.marketPrice && (
                            <span className="text-sm text-gray-400">
                              Price on request
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOutOfStock
                                ? "bg-red-500"
                                : "bg-green-500 animate-pulse"
                            }`}
                          ></span>
                          <span
                            className={`text-xs font-medium ${
                              isOutOfStock ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : `${product.quantity} in stock`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ------------------------------ SERVICES SECTION ------------------------------ */}
          <div className="mt-20 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-20">
            <div className="flex flex-col items-center text-center max-w-[249px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Truck size={48} className="text-black" />
              </div>
              <h3 className="text-black font-poppins font-semibold text-xl leading-7">
                FREE AND FAST DELIVERY
              </h3>
              <p className="text-black font-poppins text-sm leading-5 mt-2">
                Free delivery for all orders over $140
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[262px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Headset size={48} className="text-black" />
              </div>
              <h3 className="text-black font-poppins font-semibold text-xl leading-7">
                24/7 CUSTOMER SERVICE
              </h3>
              <p className="text-black font-poppins text-sm leading-5 mt-2">
                Friendly 24/7 customer support
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[256px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <BadgeDollarSign size={48} className="text-black" />
              </div>
              <h3 className="text-black font-poppins font-semibold text-xl leading-7">
                MONEY BACK GUARANTEE
              </h3>
              <p className="text-black font-poppins text-sm leading-5 mt-2">
                We return money within 30 days
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ icon, label, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-3 p-6 rounded-lg border 
        transition-all duration-300 cursor-pointer
        ${
          isActive
            ? "bg-red-500 border-red-500 text-white"
            : "bg-white border-gray-300 text-black hover:bg-red-500 hover:text-white hover:border-red-500"
        }
      `}
    >
      <div className="w-16 h-16 flex items-center justify-center">{icon}</div>
      <span className="font-poppins text-base font-normal text-center">
        {label}
      </span>
    </div>
  );
};

export default HomePage;
