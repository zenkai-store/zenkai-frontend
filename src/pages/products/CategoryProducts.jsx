import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import {
  getCachedUserData,
  getUserData,
  getStoredUserData,
} from "../../utils/auth";

// Assets
import Logo from "../../assets/logo.png";

import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  AlertCircle,
  CheckCircle,
  Share2,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Search,
  X,
  Award,
  BadgePercent,
  Zap,
  Clock,
  Truck,
  Headset,
  BadgeDollarSign,
  Filter,
  ArrowUp,
  ArrowDown,
  Sparkles,
  User,
} from "lucide-react";

const CategoryProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  // Auth - Check if user is logged in (NOT admin)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const PRODUCTS_PER_PAGE = 20;

  // ======================= CHECK USER AUTH (NOT ADMIN) =======================
  useEffect(() => {
    const checkUserAuth = () => {
      const storedData = getStoredUserData();
      const userData = getUserData();

      // Check if user is logged in and is NOT an admin
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
        // Either not logged in OR logged in as admin
        setIsUserLoggedIn(false);
        setUserName("");
      }
    };
    checkUserAuth();
  }, []);

  // ======================= FETCH PRODUCTS =======================
  const fetchProducts = useCallback(async () => {
    if (!slug) {
      setError("Category not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get category from the slug by fetching all categories first
      // OR we can use the category data directly from the API response
      // First, let's get the category by fetching products
      // The new API returns category info directly

      // Since we need the category ID, let's get it from the categories list first
      const categoriesResponse = await axios.get(
        `${BASEURL}/api/admin/categories/`,
        { withCredentials: false },
      );

      if (!categoriesResponse.data.success) {
        setError("Failed to load category");
        return;
      }

      const foundCategory = categoriesResponse.data.data.find(
        (cat) => cat.slug === slug,
      );

      if (!foundCategory) {
        setError("Category not found");
        return;
      }

      setCategory(foundCategory);
      setCategoryName(foundCategory.name);

      // Fetch products by category using the new API
      const response = await axios.get(
        `${BASEURL}/api/products/category/${foundCategory._id}?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`,
        { withCredentials: false },
      );

      if (response.data.success) {
        let fetchedProducts = response.data.data || [];

        // Use category from response if available
        if (response.data.category) {
          setCategory(response.data.category);
          setCategoryName(response.data.category.name);
        }

        // Sort products based on selected sort option
        fetchedProducts = sortProducts(fetchedProducts, sortBy);

        setProducts(fetchedProducts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProducts(response.data.pagination?.total || 0);
        setHasNextPage(response.data.pagination?.hasNextPage || false);
        setHasPrevPage(response.data.pagination?.hasPrevPage || false);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      if (err.response?.status === 404) {
        setError("Category not found");
      } else {
        setError(err.response?.data?.message || "Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  }, [slug, currentPage, sortBy]);

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

  // Reset page when slug or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [slug, sortBy]);

  // ======================= PAGINATION =======================
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ======================= WISHLIST =======================
  const toggleWishlist = (productId, e) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      showNotification("Please login to add to wishlist", "error");
      return;
    }
    const newWishlisted = new Set(wishlistedItems);
    if (newWishlisted.has(productId)) {
      newWishlisted.delete(productId);
      showNotification("Removed from wishlist");
    } else {
      newWishlisted.add(productId);
      showNotification("Added to wishlist");
    }
    setWishlistedItems(newWishlisted);
  };

  // ======================= ADD TO CART =======================
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      showNotification("Please login as a user to add items to cart", "error");
      return;
    }
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

  const calculateDiscount = (marketPrice, sellingPrice) => {
    if (!marketPrice || !sellingPrice || marketPrice <= 0) return 0;
    return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
  };

  // Updated to use the new API response structure
  const getProductImage = (product) => {
    // Check for new image object structure
    if (product.image?.url) {
      return product.image.url;
    }
    // Fallback to old media structure
    if (product.media?.[0]?.url) {
      return product.media[0].url;
    }
    // Fallback to variants
    if (product.variants?.[0]?.media?.[0]?.url) {
      return product.variants[0].media[0].url;
    }
    return null;
  };

  const getProductPricing = (product) => {
    // New API structure has pricing directly on the product
    if (product.pricing?.sellingPrice) {
      return product.pricing;
    }
    // Fallback to variant pricing
    if (product.variants?.[0]?.pricing?.sellingPrice) {
      return product.variants[0].pricing;
    }
    return null;
  };

  const getProductQuantity = (product) => {
    // Check if quantity is directly on product
    if (typeof product.quantity === "number") {
      return product.quantity;
    }
    // Fallback to first variant quantity
    if (product.variants?.[0]?.quantity !== undefined) {
      return product.variants[0].quantity;
    }
    return 0;
  };

  const isProductOutOfStock = (product) => {
    const quantity = getProductQuantity(product);
    return quantity <= 0;
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
    const pricing = getProductPricing(product);
    const quantity = getProductQuantity(product);
    const isOutOfStock = isProductOutOfStock(product);
    const discount =
      pricing?.marketPrice && pricing?.sellingPrice
        ? calculateDiscount(pricing.marketPrice, pricing.sellingPrice)
        : 0;
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
              alt={product.image?.alt || product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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
            {!isOutOfStock && pricing?.onSalePrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                SALE
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => toggleWishlist(product._id, e)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white"
          >
            <Heart
              size={16}
              className={`transition ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Quick Add to Cart (Grid View Only) - Only for logged in users (not admin) */}
          {!isOutOfStock && viewMode === "grid" && (
            <>
              {isUserLoggedIn ? (
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart size={14} />
                    Add to Cart
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 left-3 right-3 bg-red-500/90 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-600 text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <User size={14} />
                    Login to Buy
                  </span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Product Info */}
        <div
          className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-center" : ""}`}
        >
          {/* Category Tag */}
          {product.categories?.[0] && (
            <span className="text-[10px] text-red-500 font-medium uppercase tracking-wider mb-1 block">
              {product.categories[0].name}
            </span>
          )}

          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 flex-wrap">
            {pricing?.sellingPrice && (
              <span className="text-lg sm:text-xl font-bold text-red-500">
                {formatPrice(pricing.sellingPrice)}
              </span>
            )}
            {pricing?.marketPrice &&
              pricing.marketPrice !== pricing.sellingPrice && (
                <span className="text-xs sm:text-sm line-through text-gray-400">
                  {formatPrice(pricing.marketPrice)}
                </span>
              )}
            {!pricing?.sellingPrice && !pricing?.marketPrice && (
              <span className="text-sm text-gray-400">Price on request</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>
            <span
              className={`text-xs font-medium ${
                isOutOfStock ? "text-red-500" : "text-green-600"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${quantity || 0} in stock`}
            </span>
          </div>

          {/* Add to Cart (List View) */}
          {!isOutOfStock && viewMode === "list" && (
            <>
              {isUserLoggedIn ? (
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="mt-3 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/25 w-fit"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  <User size={14} />
                  Login to Order
                </Link>
              )}
            </>
          )}
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
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
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
            onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </div>
    );
  };

  // ======================= LOADING STATE =======================
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white">
        <Navbar
          isUserLoggedIn={isUserLoggedIn}
          userName={userName}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          handleLogout={handleLogout}
          navigate={navigate}
        />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // ======================= ERROR STATE =======================
  if (error) {
    return (
      <div className="w-full min-h-screen bg-white">
        <Navbar
          isUserLoggedIn={isUserLoggedIn}
          userName={userName}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          handleLogout={handleLogout}
          navigate={navigate}
        />
        <div className="flex items-center justify-center py-32 px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h3>
            <p className="text-gray-500 mb-8">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              <ChevronLeft size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* Navbar */}
      <Navbar
        isUserLoggedIn={isUserLoggedIn}
        userName={userName}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleLogout={handleLogout}
        navigate={navigate}
      />

      {/* ======================= CATEGORY HEADER ======================= */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate("/")}
              className="hover:text-red-500 transition"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </div>

          {/* Back Button & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition mb-3 group"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {categoryName}
              </h1>
              {category?.description && (
                <p className="text-gray-500 mt-2 text-sm md:text-base max-w-2xl">
                  {category.description}
                </p>
              )}
              <p className="text-gray-400 mt-2 text-sm">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= PRODUCTS SECTION ======================= */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          {/* Results Count */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
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
              </span>{" "}
              results
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-gray-400 transition bg-white"
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <ChevronDown
                  size={14}
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
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-gray-50 ${
                            sortBy === option.value
                              ? "text-red-500 font-medium bg-red-50"
                              : "text-gray-700"
                          }`}
                        >
                          <Icon size={14} />
                          {option.label}
                          {sortBy === option.value && (
                            <CheckCircle size={14} className="ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center border border-gray-300 rounded-full overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition ${
                  viewMode === "grid"
                    ? "bg-red-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition ${
                  viewMode === "list"
                    ? "bg-red-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 mb-8">
              There are no products in this category yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              <ChevronLeft size={18} />
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination />
          </>
        )}

        {/* Login Prompt Banner */}
        {!isUserLoggedIn && products.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User size={28} className="text-gray-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Shop?
            </h4>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Login as a user to add products to your cart, save to wishlist,
              and enjoy a seamless shopping experience.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
            >
              Login to Start Shopping
            </Link>
          </div>
        )}
      </main>

      {/* ======================= SERVICES SECTION ======================= */}
      <section className="w-full bg-white py-16 px-6 md:px-20 border-t border-gray-100">
        <div className="max-w-[1170px] mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-20">
            <div className="flex flex-col items-center text-center max-w-[249px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Truck size={48} className="text-black" />
              </div>
              <h3 className="text-black font-poppins font-semibold text-xl leading-7">
                FREE AND FAST DELIVERY
              </h3>
              <p className="text-black font-poppins text-sm leading-5 mt-2">
                Free delivery for all orders over ₹500
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

// ======================= NAVBAR COMPONENT =======================
const Navbar = ({
  isUserLoggedIn,
  userName,
  isMenuOpen,
  setIsMenuOpen,
  handleLogout,
  navigate,
}) => {
  return (
    <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-black border-b border-gray-800 sticky top-0 z-40">
      {/* Logo */}
      <img
        src={Logo}
        alt="Zenkai.co"
        className="w-20 md:w-24 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => navigate("/")}
      />

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-10 font-medium text-white">
        <button
          onClick={() => navigate("/")}
          className="hover:text-red-500 transition"
        >
          Shop
        </button>
        <button
          onClick={() => navigate("/on-sale")}
          className="hover:text-red-500 transition"
        >
          Categories
        </button>
        <button
          onClick={() => navigate("/new-arrivals")}
          className="hover:text-red-500 transition"
        >
          New Arrivals
        </button>
        <button
          onClick={() => navigate("/brands")}
          className="hover:text-red-500 transition"
        >
          Contact
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search for products..."
            className="bg-gray-100 text-white placeholder-gray-400 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
          />
          <Search
            size={16}
            className="absolute right-3 top-2.5 text-gray-400"
          />
        </div>

        {/* Cart Icon */}
        <button className="relative">
          <svg
            className="w-6 h-6 text-white"
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
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            0
          </span>
        </button>

        {/* Profile / Login - Only show for users, not admins */}
        {isUserLoggedIn ? (
          <div className="relative group">
            <button className="flex items-center gap-2 text-white">
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
              <span className="hidden md:inline">{userName || "Profile"}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-50 transition text-sm">
                  My Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-50 transition text-sm">
                  Orders
                </button>
                <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-50 transition text-sm">
                  Wishlist
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-600 transition text-sm flex items-center gap-2"
          >
            <User size={16} />
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col gap-4 z-30">
          <button
            onClick={() => {
              navigate("/");
              setIsMenuOpen(false);
            }}
            className="hover:text-red-500 py-2 text-left text-white"
          >
            Shop
          </button>
          <button
            onClick={() => {
              navigate("/on-sale");
              setIsMenuOpen(false);
            }}
            className="hover:text-red-500 py-2 text-left text-white"
          >
            On Sale
          </button>
          <button
            onClick={() => {
              navigate("/new-arrivals");
              setIsMenuOpen(false);
            }}
            className="hover:text-red-500 py-2 text-left text-white"
          >
            New Arrivals
          </button>
          <button
            onClick={() => {
              navigate("/brands");
              setIsMenuOpen(false);
            }}
            className="hover:text-red-500 py-2 text-left text-white"
          >
            Brands
          </button>
        </div>
      )}
    </nav>
  );
};

export default CategoryProducts;
