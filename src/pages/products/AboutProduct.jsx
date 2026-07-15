import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import { addVariantToCart } from "../../services/addToCart";
import {
  getCachedUserData,
  getUserData,
  getStoredUserData,
} from "../../utils/auth";

import Reviews from "./Reviews";
import RecommendProducts from "./RecommendProducts";

// Import placeholder image for loading/error states
import Logo from "../../assets/logo.png";

import {
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
  Package,
  AlertCircle,
  CheckCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Clock,
  BadgePercent,
  Tag,
  Grid,
  FileText,
  Info,
  Circle,
  Box,
  DollarSign,
  Palette,
} from "lucide-react";

const AboutProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const imageScrollRef = useRef(null);

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Wishlist States
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [cartAdding, setCartAdding] = useState(false);

  // Image gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Accordion states
  const [expandedDescription, setExpandedDescription] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Notification
  const [notification, setNotification] = useState(null);

  // ======================= CHECK AUTH =======================
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getStoredUserData();

      if (storedUser && storedUser.role !== "admin") {
        setIsLoggedIn(true);
        return;
      }

      setIsLoggedIn(false);
    };

    checkAuth();
  }, []);

  // ======================= FETCH PRODUCT =======================
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch all products and find by slug, or use a direct endpoint
        // Using the product ID from the slug mapping or a search endpoint
        const response = await axios.get(
          `${BASEURL}/api/products/search?q=${encodeURIComponent(slug)}&page=1&limit=1`,
          { withCredentials: false },
        );

        if (response.data.success && response.data.data?.length > 0) {
          const foundProduct = response.data.data[0];

          // Now fetch full product details using the product _id
          const detailResponse = await axios.get(
            `${BASEURL}/api/products/${foundProduct._id}`,
            { withCredentials: false },
          );

          if (detailResponse.data.success) {
            const productData = detailResponse.data.data;
            setProduct(productData);

            // Set default variant
            if (productData.variants?.length > 0) {
              const defaultVariant =
                productData.variants.find((v) => v.isDefault) ||
                productData.variants[0];
              setSelectedVariant(defaultVariant);
              setSelectedColor(defaultVariant.color?.code || null);
              setIsWishlisted(defaultVariant.isWishlisted || false);

              // Set active image to first media
              if (defaultVariant.media?.length > 0) {
                setActiveImageIndex(0);
              }
            }
          } else {
            setError("Failed to load product details");
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(
          err.response?.data?.message || "Failed to load product details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ======================= VARIANT HANDLERS =======================
  const handleColorSelect = (colorCode) => {
    if (!product?.variants) return;

    const variant = product.variants.find(
      (v) => v.color?.code === colorCode && v.isActive,
    );

    if (variant) {
      setSelectedVariant(variant);
      setSelectedColor(colorCode);
      setIsWishlisted(variant.isWishlisted || false);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  };

  // ====================== Add Variant to Cart =================
  const handleAddToCart = async () => {
    if (!selectedVariant?._id) {
      showNotification("No variant selected", "error");
      return;
    }

    if (isOutOfStock) {
      showNotification("Product is out of stock", "error");
      return;
    }

    setCartAdding(true);

    try {
      const response = await addVariantToCart(selectedVariant._id, quantity);
      if (response.data.success) {
        showNotification(`${product.name} added to cart!`, "success");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      showNotification(
        err.response?.data?.message || "Failed to add to cart",
        "error",
      );
    } finally {
      setCartAdding(false);
    }
  };

  // ==========================================================
  // WISHLIST HANDLER
  // ==========================================================
  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await axios.delete(`${BASEURL}/api/wishlist/${product._id}`, {
          withCredentials: true,
        });
        setIsWishlisted(false);
        showNotification("Removed from wishlist");
      } else {
        await axios.post(
          `${BASEURL}/api/wishlist/${product._id}`,
          {},
          { withCredentials: true },
        );
        setIsWishlisted(true);
        showNotification("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      showNotification("Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  // ======================= IMAGE GALLERY HANDLERS =======================
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!selectedVariant?.media?.length) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? selectedVariant.media.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!selectedVariant?.media?.length) return;
    setActiveImageIndex((prev) =>
      prev === selectedVariant.media.length - 1 ? 0 : prev + 1,
    );
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleImageMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // ======================= QUANTITY HANDLERS =======================
  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (selectedVariant?.quantity || 1)) {
      setQuantity(newQty);
    }
  };

  // ======================= UTILITY FUNCTIONS =======================
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

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ======================= DESCRIPTION RENDERER =======================
  const renderDescription = () => {
    if (!product?.description?.length) return null;

    return (
      <div className="space-y-4">
        {product.description.map((item, index) => {
          const isTopic = item.type === "topic";
          const isBullet = item.type === "bullet";

          if (isTopic) {
            return (
              <h4
                key={index}
                className="text-lg font-semibold text-gray-900 pt-2"
              >
                {item.content}
              </h4>
            );
          }

          if (isBullet) {
            return (
              <div key={index} className="flex items-start gap-3 pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.content}
                </p>
              </div>
            );
          }

          // Line type
          return (
            <p key={index} className="text-gray-600 text-sm leading-relaxed">
              {item.content}
            </p>
          );
        })}
      </div>
    );
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

  // ======================= LOADING STATE =======================
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ======================= ERROR STATE =======================
  if (error || !product) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Product Not Found
          </h3>
          <p className="text-gray-500 mb-8">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
          >
            <ChevronLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  const currentMedia = selectedVariant?.media || [];
  const currentImage = currentMedia[activeImageIndex];
  const isOutOfStock = selectedVariant?.quantity === 0;
  const discount = selectedVariant?.pricing
    ? calculateDiscount(
        selectedVariant.pricing.marketPrice,
        selectedVariant.pricing.sellingPrice,
      )
    : 0;

  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* ======================= TOP HEADER ======================= */}
      <div className="bg-black text-white text-sm py-2 px-6 flex justify-center items-center">
        <div className="flex items-center gap-2 justify-center text-center">
          <span>
            Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
          </span>
          <button className="underline font-semibold ml-2 hover:text-gray-300">
            Shop Now
          </button>
        </div>
      </div>

      {/* ======================= NAVIGATION ======================= */}
      <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-white border-b border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <img
            src={Logo}
            alt="Zenkai.co"
            className="w-20 md:w-24 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate("/")}
            className="hover:text-red-500 transition"
          >
            Home
          </button>
          <span>/</span>
          {product.categories?.[0] && (
            <>
              <button className="hover:text-red-500 transition">
                {product.categories[0].name}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <Heart
              size={20}
              className={`transition ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showNotification("Link copied to clipboard");
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Share2 size={20} className="text-gray-700" />
          </button>
        </div>
      </nav>

      {/* ======================= MAIN PRODUCT SECTION ======================= */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* ======================= LEFT - IMAGE GALLERY ======================= */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main Image Container */}
            <div
              className={`relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group ${
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleImageMouseMove}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.categories?.[0] && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-xs font-medium shadow-sm">
                    <Tag size={12} />
                    {product.categories[0].name}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-sm">
                    <AlertCircle size={12} />
                    Out of Stock
                  </span>
                )}
                {!isOutOfStock && discount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm">
                    <BadgePercent size={12} />
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Main Image */}
              {currentImage ? (
                <div
                  className="w-full aspect-[4/3] overflow-hidden"
                  style={
                    isZoomed
                      ? {
                          backgroundImage: `url(${currentImage.url})`,
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundSize: "200%",
                          backgroundRepeat: "no-repeat",
                        }
                      : {}
                  }
                >
                  <img
                    src={currentImage.url}
                    alt={`${product.name} - ${activeImageIndex + 1}`}
                    className={`w-full h-full object-cover transition duration-500 ${
                      isZoomed ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}

              {/* Navigation Arrows */}
              {currentMedia.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {currentMedia.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-xs font-medium shadow-sm">
                  {activeImageIndex + 1} / {currentMedia.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {currentMedia.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {currentMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition ${
                      index === activeImageIndex
                        ? "border-red-500 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={media.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ======================= RIGHT - PRODUCT INFO ======================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name & Brand */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">SKU:</span>
                <span className="text-sm font-mono text-gray-700">
                  {selectedVariant?.sku || product.productId}
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-red-500">
                  {formatPrice(selectedVariant?.pricing?.sellingPrice)}
                </span>
                {selectedVariant?.pricing?.marketPrice && (
                  <span className="text-lg md:text-xl line-through text-gray-400">
                    {formatPrice(selectedVariant.pricing.marketPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    <BadgePercent size={14} />
                    You save {discount}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isOutOfStock ? "bg-red-500" : "bg-green-500"
                  }`}
                ></span>
                <span
                  className={`text-sm font-medium ${
                    isOutOfStock ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : `In Stock (${selectedVariant?.quantity || 0} available)`}
                </span>
              </div>
            </div>

            {/* Color Selection */}
            {product.variantSummary?.availableColors?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Palette size={16} className="text-gray-500" />
                  Color:{" "}
                  <span className="text-gray-700 font-normal">
                    {selectedVariant?.color?.name || "Select"}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variantSummary.availableColors
                    .filter((color) => color.isActive)
                    .map((color) => {
                      const variant = product.variants.find(
                        (v) => v.color?.code === color.code && v.isActive,
                      );
                      const isOutOfStockVariant = variant?.quantity === 0;

                      return (
                        <button
                          key={color.code}
                          onClick={() => handleColorSelect(color.code)}
                          disabled={isOutOfStockVariant}
                          className={`relative group ${
                            isOutOfStockVariant ? "cursor-not-allowed" : ""
                          }`}
                          title={`${color.name}${
                            isOutOfStockVariant ? " (Out of Stock)" : ""
                          }`}
                        >
                          <div
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition shadow-sm ${
                              selectedColor === color.code
                                ? "border-red-500 scale-110"
                                : "border-gray-300 hover:border-gray-500"
                            } ${isOutOfStockVariant ? "opacity-50" : ""}`}
                            style={{ backgroundColor: color.code }}
                          ></div>
                          {selectedColor === color.code && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          )}
                          {isOutOfStockVariant && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-400 rotate-45 rounded"></div>
                            </div>
                          )}
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Minus size={16} className="text-gray-700" />
                    </button>
                    <span className="w-14 text-center font-semibold text-gray-900 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (selectedVariant?.quantity || 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Plus size={16} className="text-gray-700" />
                    </button>
                  </div>
                  {selectedVariant?.quantity &&
                    selectedVariant.quantity <= 5 && (
                      <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        Only {selectedVariant.quantity} left!
                      </span>
                    )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {isLoggedIn ? (
                <>
                  <button
                    disabled={isOutOfStock || cartAdding}
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition shadow-lg ${
                      isOutOfStock || cartAdding
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/25"
                    }`}
                  >
                    {cartAdding ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ShoppingCart size={22} />
                    )}
                    {isOutOfStock
                      ? "Out of Stock"
                      : cartAdding
                        ? "Adding..."
                        : "Add to Cart"}
                  </button>
                  <button
                    disabled={isOutOfStock}
                    onClick={() =>
                      showNotification("Buy now functionality coming soon!")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    <Zap size={22} />
                    Buy Now
                  </button>
                </>
              ) : (
                <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gray-200 text-gray-500 font-semibold text-lg cursor-not-allowed">
                      <ShoppingCart size={22} />
                      Add to Cart
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gray-200 text-gray-500 font-semibold text-lg cursor-not-allowed">
                      <Zap size={22} />
                      Buy Now
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart size={18} className="text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      Please login as a user to add products to cart
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
                    >
                      Login to Shop
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck size={16} className="text-gray-400 flex-shrink-0" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <RotateCcw size={16} className="text-gray-400 flex-shrink-0" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= PRODUCT DETAILS SECTION ======================= */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Description */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description Accordion */}
            {product.description?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedDescription(!expandedDescription)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText size={22} className="text-red-500" />
                    Product Description
                  </h2>
                  {expandedDescription ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                {expandedDescription && (
                  <div className="px-6 pb-6">{renderDescription()}</div>
                )}
              </div>
            )}

            {/* Product Details / Specifications Accordion */}
            {product.productDetails?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedDetails(!expandedDetails)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Grid size={22} className="text-red-500" />
                    Technical Specifications
                  </h2>
                  {expandedDetails ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                {expandedDetails && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.productDetails.map((detail, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition group"
                        >
                          <span className="text-gray-500 text-xs font-medium group-hover:text-gray-700 transition flex-shrink-0">
                            {detail.topic}
                          </span>
                          <span className="text-gray-900 text-xs text-right ml-4 max-w-[55%]">
                            {detail.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-4">
            {/* Product Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info size={18} className="text-red-500" />
                Product Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.categories?.[0]?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">SKU</span>
                  <span className="text-sm font-mono text-gray-900">
                    {product.productId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      product.isActive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {selectedVariant?.color && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Color</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor: selectedVariant.color.code,
                        }}
                      ></span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedVariant.color.name}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Stock</span>
                  <span
                    className={`text-sm font-semibold ${
                      isOutOfStock ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${selectedVariant?.quantity || 0} units`}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-red-500" />
                Shipping & Returns
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Truck
                    size={16}
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Free Shipping
                    </p>
                    <p className="text-xs text-gray-500">On every order</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock
                    size={16}
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Fast Delivery
                    </p>
                    <p className="text-xs text-gray-500">3-5 business days</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <RotateCcw
                    size={16}
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Easy Exchange
                    </p>
                    <p className="text-xs text-gray-500">
                      7-day exchange policy
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ======================= REVIEWS SECTION ======================= */}
        <Reviews productId={product._id} />

        {/* ======================= RECOMMENDED PRODUCTS SECTION ======================= */}
        <RecommendProducts productId={product._id} />
      </main>
    </div>
  );
};

export default AboutProduct;
