import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle,
  Truck,
  Shield,
  BadgePercent,
  RefreshCw,
  ChevronRight,
  Heart,
  Tag,
  Clock,
  Info,
  Loader,
  Sparkles,
  Gift,
  MapPin,
} from "lucide-react";
import { useCart, moveFromWishlistToCart } from "../services/cartService";
import { getStoredUserData, getAuthHeader } from "../utils/auth";
import BASEURL from "../config/baseURL";

const Cart = () => {
  const navigate = useNavigate();

  // ======================= CART STATE =======================
  const {
    cartItems,
    cartLoading,
    cartError,
    cartSummary,
    cartCount,
    fetchCart,
    fetchCartSummary,
    updateItemQuantity,
    removeItemFromCart,
    clearEntireCart,
  } = useCart();

  // ======================= LOCAL STATE =======================
  const [loggedIn, setLoggedIn] = useState(() => !!getStoredUserData());
  const [notification, setNotification] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // ======================= ADDRESS STATE =======================
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [processingPayment, setProcessingPayment] = useState(false);

  // ======================= LOAD RAZORPAY SCRIPT =======================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ======================= FETCH CART =======================
  useEffect(() => {
    if (loggedIn) {
      fetchCart();
      fetchCartSummary();
    }
  }, [loggedIn, fetchCart, fetchCartSummary]);

  // ======================= NOTIFICATION =======================
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ======================= QUANTITY HANDLERS =======================
  const handleQuantityChange = async (variantId, newQuantity, maxStock) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;

    setUpdatingItems((prev) => new Set(prev).add(variantId));

    await updateItemQuantity(
      variantId,
      newQuantity,
      () => {
        showNotification("Quantity updated", "success");
        fetchCartSummary();
      },
      (errorMessage) => {
        showNotification(errorMessage, "error");
      },
    );

    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(variantId);
      return newSet;
    });
  };

  // ======================= REMOVE HANDLER =======================
  const handleRemoveItem = async (variantId, productName) => {
    setUpdatingItems((prev) => new Set(prev).add(variantId));

    await removeItemFromCart(
      variantId,
      () => {
        showNotification(`${productName} removed from cart`, "success");
        fetchCartSummary();
      },
      (errorMessage) => {
        showNotification(errorMessage, "error");
      },
    );

    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(variantId);
      return newSet;
    });
  };

  // ======================= CLEAR CART =======================
  const handleClearCart = async () => {
    await clearEntireCart(
      () => {
        showNotification("Cart cleared successfully", "success");
        setShowClearConfirm(false);
      },
      (errorMessage) => {
        showNotification(errorMessage, "error");
        setShowClearConfirm(false);
      },
    );
  };

  // ======================= MOVE TO WISHLIST =======================
  const handleMoveToWishlist = async (productId, variantId, productName) => {
    try {
      await moveFromWishlistToCart(productId);
      await removeItemFromCart(
        variantId,
        () => {
          showNotification(`${productName} moved to wishlist`, "success");
          fetchCartSummary();
        },
        (errorMessage) => {
          showNotification(errorMessage, "error");
        },
      );
    } catch (error) {
      console.error("Failed to move to wishlist:", error);
      showNotification("Failed to move to wishlist", "error");
    }
  };

  // ======================= COUPON HANDLER =======================
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    // Simulate coupon validation (replace with actual API call)
    if (couponCode.toUpperCase() === "SAVE10") {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponError("");
      showNotification("Coupon applied successfully! 10% off", "success");
    } else if (couponCode.toUpperCase() === "FREESHIP") {
      setCouponError("Shipping is already free on all orders!");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  // ======================= FORMAT FUNCTIONS =======================
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ======================= FETCH ADDRESSES =======================
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!loggedIn) return;
      try {
        setLoadingAddresses(true);
        setAddressError("");
        const response = await fetch(`${BASEURL}/api/address`, {
          credentials: "include",
          headers: getAuthHeader(),
        });
        const data = await response.json();
        if (data.success) {
          const sorted = data.data.sort((a, b) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return 0;
          });
          setAddresses(sorted);
          // Select default address or first
          const defaultAddr = sorted.find((addr) => addr.isDefault);
          setSelectedAddressId(defaultAddr?._id || sorted[0]?._id || null);
        } else {
          setAddressError(data.message || "Failed to load addresses");
        }
      } catch (err) {
        console.error("Address fetch error:", err);
        setAddressError("Could not load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [loggedIn]);

  // ======================= CALCULATIONS =======================
  const subtotal =
    cartSummary?.subtotal ||
    cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = appliedCoupon === "SAVE10" ? subtotal * 0.1 : 0;
  const shipping = 0; // Always free shipping
  const total = subtotal - discount;

  // Calculate savings
  const totalSavings = discount + (shipping === 0 ? 150 : 0); // Assuming ₹150 shipping saved

  // ======================= HANDLE CHECKOUT =======================
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      showNotification("Please select a delivery address", "error");
      return;
    }

    if (!cartSummary?.isEligibleForCheckout) {
      showNotification(
        cartSummary?.stockIssues?.[0] ||
          "Some items in your cart are out of stock. Please remove them to proceed.",
        "error",
      );
      return;
    }

    setProcessingPayment(true);

    try {
      // Step 1: Create order
      const createOrderResponse = await fetch(
        `${BASEURL}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          credentials: "include",
          body: JSON.stringify({
            addressId: selectedAddressId,
            paymentMethod: "razorpay",
          }),
        },
      );

      const createOrderData = await createOrderResponse.json();

      if (!createOrderData.success) {
        throw new Error(createOrderData.message || "Failed to create order");
      }

      const {
        razorpayOrderId,
        amount,
        key,
        orderId,
        orderNumber,
        requiresPayment,
      } = createOrderData;

      if (!requiresPayment) {
        // For COD or other non-payment methods, navigate directly
        navigate(`/order-confirmation/${orderId}`);
        return;
      }

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Payment gateway failed to load. Please try again.");
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: "INR",
        name: "Zenkai.co",
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Step 4: Verify payment
          try {
            const verifyResponse = await fetch(
              `${BASEURL}/api/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeader() },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed",
              );
            }

            // Payment successful – navigate to order confirmation
            showNotification("Payment successful! Order placed.", "success");
            navigate(`/order-confirmation/${verifyData.orderId}`);
          } catch (err) {
            console.error("Payment verification error:", err);
            showNotification(
              err.message || "Payment verification failed",
              "error",
            );
          }
        },
        modal: {
          ondismiss: function () {
            showNotification("Payment cancelled", "error");
          },
        },
        prefill: {
          email: loggedInUser?.email || "",
          contact: loggedInUser?.phone || "",
        },
        theme: {
          color: "#EF4444",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Checkout error:", err);
      showNotification(err.message || "Failed to initiate checkout", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  // ======================= RENDER LOADING SKELETON =======================
  const CartSkeleton = () => (
    <div className="animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ======================= RENDER EMPTY CART =======================
  const EmptyCart = () => (
    <div className="flex items-center justify-center py-20">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 mb-2">
          Looks like you haven't added anything to your cart yet.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Start shopping and fill it up with amazing products!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
          >
            <ShoppingCart size={18} />
            Browse Products
          </button>
          <button
            onClick={() => navigate("/new-arrivals")}
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition font-medium active:scale-95"
          >
            <Sparkles size={18} />
            New Arrivals
          </button>
        </div>
      </div>
    </div>
  );

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

  // ======================= CONFIRMATION MODAL =======================
  const ClearConfirmModal = () => {
    if (!showClearConfirm) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowClearConfirm(false)}
        ></div>
        <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Clear Cart?
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to remove all items from your cart? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleClearCart}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-gray-50 font-lufga">
      <Notification />
      <ClearConfirmModal />

      {/* ======================= FREE SHIPPING BANNER ======================= */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Truck size={16} className="animate-pulse" />
            <span>
              🎉 Free Delivery on All Orders! No Minimum Purchase Required
            </span>
            <Sparkles size={14} />
          </div>
        </div>
      </div>

      {/* ======================= HEADER ======================= */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition group"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-50 transition">
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Continue Shopping
              </span>
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Shopping Cart
              {cartCount > 0 && (
                <span className="text-gray-400 text-lg font-normal ml-2">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </h1>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-500 hover:text-red-700 transition font-medium px-3 py-1.5 rounded-full hover:bg-red-50"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => {
                  fetchCart();
                  fetchCartSummary();
                }}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                title="Refresh Cart"
              >
                <RefreshCw size={15} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= CART CONTENT ======================= */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {cartLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <CartSkeleton />
          </div>
        ) : cartError ? (
          <div className="flex items-center justify-center py-20">
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Failed to load cart
              </h3>
              <p className="text-gray-500 mb-8">{cartError}</p>
              <button
                onClick={() => {
                  fetchCart();
                  fetchCartSummary();
                }}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25 active:scale-95"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ======================= CART ITEMS ======================= */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cart Items Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const isUpdating = updatingItems.has(item.variantId._id);
                    const itemSubtotal = item.unitPrice * item.quantity;
                    const maxStock =
                      item.availableStock || item.variantId.quantity || 1;

                    return (
                      <div
                        key={item._id}
                        className="p-4 sm:p-6 hover:bg-gray-50/50 transition group relative"
                      >
                        {/* Updating Overlay */}
                        {isUpdating && (
                          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                            <Loader className="w-6 h-6 text-red-500 animate-spin" />
                          </div>
                        )}

                        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                          {/* Product Info */}
                          <div className="col-span-5 flex items-center gap-4 w-full">
                            <div className="relative flex-shrink-0">
                              <img
                                src={
                                  item.variantMedia?.url ||
                                  item.variantId?.media?.[0]?.url
                                }
                                alt={item.productName}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/100x100?text=No+Image";
                                }}
                              />
                              {item.variantId?.isOnSale && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                                  <BadgePercent size={10} />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 hover:text-red-500 transition-colors">
                                <button
                                  onClick={() =>
                                    navigate(`/product/${item.productSlug}`)
                                  }
                                  className="text-left hover:text-red-500 transition-colors"
                                >
                                  {item.productName}
                                </button>
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                  style={{
                                    backgroundColor:
                                      item.variantColor?.code || "#ccc",
                                  }}
                                  title={item.variantColor?.name}
                                ></div>
                                <span className="text-xs text-gray-500">
                                  {item.variantColor?.name}
                                </span>
                                {item.variantId?.sku && (
                                  <span className="text-[10px] text-gray-400">
                                    SKU: {item.variantId.sku}
                                  </span>
                                )}
                              </div>

                              {/* Stock Status */}
                              <div className="mt-1 flex items-center gap-3">
                                {item.isInStock ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    In Stock ({item.availableStock} available)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-red-500">
                                    <AlertCircle size={12} />
                                    Out of Stock
                                  </span>
                                )}
                                {/* Free Shipping Badge */}
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                  <Truck size={10} />
                                  Free Delivery
                                </span>
                              </div>

                              {/* Move to Wishlist & Remove Buttons (Mobile) */}
                              <div className="sm:hidden mt-2 flex items-center gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToWishlist(
                                      item.productId._id,
                                      item.variantId._id,
                                      item.productName,
                                    );
                                  }}
                                  className="text-xs text-gray-500 hover:text-red-500 transition flex items-center gap-1"
                                >
                                  <Heart size={12} />
                                  Save for Later
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(
                                      item.variantId._id,
                                      item.productName,
                                    );
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1"
                                >
                                  <Trash2 size={12} />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-2 text-center">
                            <div className="sm:hidden text-xs text-gray-500 mb-1">
                              Price:
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.unitPrice)}
                            </span>
                            {item.variantId?.isOnSale &&
                              item.variantId?.pricing?.onSalePrice && (
                                <span className="block text-xs text-gray-400 line-through">
                                  {formatPrice(
                                    item.variantId.pricing.sellingPrice,
                                  )}
                                </span>
                              )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-3 flex items-center justify-center">
                            <div className="sm:hidden text-xs text-gray-500 mr-2">
                              Qty:
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(
                                    item.variantId._id,
                                    item.quantity - 1,
                                    maxStock,
                                  );
                                }}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center text-sm font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(
                                    item.variantId._id,
                                    item.quantity + 1,
                                    maxStock,
                                  );
                                }}
                                disabled={
                                  item.quantity >= maxStock || isUpdating
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2 text-right">
                            <div className="sm:hidden text-xs text-gray-500 mb-1">
                              Subtotal:
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-gray-900">
                                {formatPrice(itemSubtotal)}
                              </span>
                              {/* Desktop Actions */}
                              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToWishlist(
                                      item.productId._id,
                                      item.variantId._id,
                                      item.productName,
                                    );
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition"
                                  title="Save for later"
                                >
                                  <Heart size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(
                                      item.variantId._id,
                                      item.productName,
                                    );
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-full hover:bg-red-100 transition"
                                  title="Remove item"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping Banner */}
              <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Free Delivery on All Orders!
                    </p>
                    <p className="text-xs text-gray-500">
                      No minimum purchase required
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/products")}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  Add More Items
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* ======================= ORDER SUMMARY ======================= */}
            <div className="lg:w-96">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Summary Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}
                      )
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm flex items-center gap-1">
                        <BadgePercent size={14} />
                        Coupon Discount (10%)
                      </span>
                      <span className="text-sm font-semibold">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  {/* Shipping - Always Free */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Truck size={14} />
                      Shipping
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-600">
                        FREE
                      </span>
                      <span className="block text-xs text-gray-400 line-through">
                        {formatPrice(150)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Banner */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Gift size={18} className="text-green-600" />
                      <div>
                        <p className="text-xs font-semibold text-green-700">
                          Free Delivery Applied!
                        </p>
                        <p className="text-[10px] text-green-600">
                          You saved ₹150 on shipping
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Savings Summary */}
                  {totalSavings > 0 && (
                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                      <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                        <Sparkles size={12} />
                        Total Savings: {formatPrice(totalSavings)}
                      </p>
                    </div>
                  )}

                  {/* Coupon Code */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Have a Coupon?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        disabled={!!appliedCoupon}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      {appliedCoupon ? (
                        <button
                          onClick={() => {
                            setAppliedCoupon("");
                            setCouponCode("");
                            showNotification("Coupon removed", "success");
                          }}
                          className="px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Coupon "{appliedCoupon}" applied successfully!
                      </p>
                    )}
                    {!appliedCoupon && !couponError && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Try code: <span className="font-semibold">SAVE10</span>{" "}
                        for 10% off
                      </p>
                    )}
                  </div>
                </div>

                {/* ======================= DELIVERY ADDRESS ======================= */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <MapPin size={16} className="inline mr-1.5" />
                    Delivery Address
                  </label>

                  {loadingAddresses ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader size={14} className="animate-spin" />
                      Loading addresses...
                    </div>
                  ) : addressError ? (
                    <div className="text-sm text-red-500">{addressError}</div>
                  ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-sm text-gray-500">
                        No saved addresses
                      </p>
                      <button
                        onClick={() => navigate("/address")}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition"
                      >
                        <Plus size={16} />
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedAddressId || ""}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10 bg-white"
                      >
                        {addresses.map((addr) => (
                          <option key={addr._id} value={addr._id}>
                            {addr.fullName} • {addr.addressLine1}, {addr.city},{" "}
                            {addr.state} - {addr.pincode}
                            {addr.isDefault && " (Default)"}
                          </option>
                        ))}
                      </select>

                      {/* Show selected address details */}
                      {selectedAddressId && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
                          {(() => {
                            const selected = addresses.find(
                              (a) => a._id === selectedAddressId,
                            );
                            if (!selected) return null;
                            return (
                              <>
                                <p className="font-medium text-gray-900">
                                  {selected.fullName}
                                </p>
                                <p>
                                  {selected.addressLine1}
                                  {selected.addressLine2 &&
                                    `, ${selected.addressLine2}`}
                                  {selected.landmark &&
                                    `, ${selected.landmark}`}
                                </p>
                                <p>
                                  {selected.city}, {selected.district},{" "}
                                  {selected.state} - {selected.pincode}
                                </p>
                                <p>Phone: {selected.phone}</p>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => navigate("/address")}
                          className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add New Address
                        </button>
                        {selectedAddressId && (
                          <button
                            onClick={() => navigate(`/address`)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition"
                          >
                            Manage Addresses
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 mt-6 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(total)}
                      </span>
                      {discount > 0 && (
                        <span className="block text-xs text-gray-400 line-through">
                          {formatPrice(subtotal)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Inclusive of all taxes • Free shipping included
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={
                    !cartSummary?.isEligibleForCheckout || processingPayment
                  }
                  className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-full font-semibold hover:from-red-600 hover:to-red-700 transition shadow-lg shadow-red-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Proceed to Checkout
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                {/* Stock Issues Warning */}
                {cartSummary?.stockIssues &&
                  cartSummary.stockIssues.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs text-yellow-800 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} />
                        Stock Issues Detected
                      </p>
                      <ul className="mt-1 space-y-1">
                        {cartSummary.stockIssues.map((issue, index) => (
                          <li key={index} className="text-xs text-yellow-700">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield size={14} className="text-green-500" />
                    Secure Checkout with SSL Encryption
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Truck size={14} className="text-green-500" />
                    Free Delivery on All Orders
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <RefreshCw size={14} className="text-purple-500" />
                    30-Day Easy Returns & Exchange
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Gift size={14} className="text-orange-500" />
                    Free Gift Wrapping Available
                  </div>
                </div>

                {/* Continue Shopping Link */}
                <button
                  onClick={() => navigate("/products")}
                  className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-red-500 transition font-medium flex items-center justify-center gap-1 group"
                >
                  <ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
