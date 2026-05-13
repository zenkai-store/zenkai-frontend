import axios from "axios";
import BASEURL from "../config/baseURL";

// Create axios instance with default config
const cartApi = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
});

/**
 * Get user's cart
 * @returns {Promise} Cart data with items
 */
export const getCart = async () => {
  try {
    const response = await cartApi.get("/api/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get cart summary for checkout
 * @returns {Promise} Cart summary with subtotal and stock issues
 */
export const getCartSummary = async () => {
  try {
    const response = await cartApi.get("/api/cart/summary");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {string} variantId - Variant ID (optional, uses default if not provided)
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise} Updated cart data
 */
export const addToCart = async (productId, variantId = null, quantity = 1) => {
  try {
    const payload = {
      productId,
      quantity,
    };

    if (variantId) {
      payload.variantId = variantId;
    }

    const response = await cartApi.post("/api/cart", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} variantId - Variant ID of the cart item
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated cart data
 */
export const updateCartItemQuantity = async (variantId, quantity) => {
  try {
    const response = await cartApi.put(`/api/cart/items/${variantId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} variantId - Variant ID of the cart item to remove
 * @returns {Promise} Updated cart data
 */
export const removeFromCart = async (variantId) => {
  try {
    const response = await cartApi.delete(`/api/cart/items/${variantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise} Response data
 */
export const clearCart = async () => {
  try {
    const response = await cartApi.delete("/api/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get available variants for a product (for variant switching in cart)
 * @param {string} productId - Product ID
 * @returns {Promise} Available variants and variants already in cart
 */
export const getProductVariants = async (productId) => {
  try {
    const response = await cartApi.get(
      `/api/cart/product/${productId}/variants`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Move item from wishlist to cart
 * @param {string} productId - Product ID to move from wishlist
 * @returns {Promise} Response data
 */
export const moveFromWishlistToCart = async (productId) => {
  try {
    const response = await cartApi.post(`/api/cart/from-wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ======================= CUSTOM HOOK FOR CART STATE =======================
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to manage cart state
 * @returns {Object} Cart state and methods
 */
export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [cartSummary, setCartSummary] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      const response = await getCart();
      if (response.success) {
        setCartItems(response.data.items || []);
        setCartCount(response.data.items?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartError(error.response?.data?.message || "Failed to load cart");
      setCartItems([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Fetch cart summary
  const fetchCartSummary = useCallback(async () => {
    try {
      const response = await getCartSummary();
      if (response.success) {
        setCartSummary(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cart summary:", error);
    }
  }, []);

  // Add item to cart with notification callback
  const addItemToCart = useCallback(
    async (
      productId,
      variantId = null,
      quantity = 1,
      onSuccess = null,
      onError = null,
    ) => {
      try {
        const response = await addToCart(productId, variantId, quantity);
        if (response.success) {
          setCartItems(response.data.items || []);
          setCartCount(response.data.items?.length || 0);
          if (onSuccess) onSuccess(response);
          return { success: true, data: response.data };
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to add item to cart";
        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  // Update cart item quantity
  const updateItemQuantity = useCallback(
    async (variantId, quantity, onSuccess = null, onError = null) => {
      try {
        const response = await updateCartItemQuantity(variantId, quantity);
        if (response.success) {
          setCartItems(response.data.items || []);
          setCartCount(response.data.items?.length || 0);
          if (onSuccess) onSuccess(response);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to update quantity";
        if (onError) onError(errorMessage);
      }
    },
    [],
  );

  // Remove item from cart
  const removeItemFromCart = useCallback(
    async (variantId, onSuccess = null, onError = null) => {
      try {
        const response = await removeFromCart(variantId);
        if (response.success) {
          setCartItems(response.data.items || []);
          setCartCount(response.data.items?.length || 0);
          if (onSuccess) onSuccess(response);
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to remove item";
        if (onError) onError(errorMessage);
      }
    },
    [],
  );

  // Clear entire cart
  const clearEntireCart = useCallback(
    async (onSuccess = null, onError = null) => {
      try {
        const response = await clearCart();
        if (response.success) {
          setCartItems([]);
          setCartCount(0);
          setCartSummary(null);
          if (onSuccess) onSuccess(response);
        }
      } catch (error) {
        console.error("Failed to clear cart:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to clear cart";
        if (onError) onError(errorMessage);
      }
    },
    [],
  );

  return {
    cartItems,
    cartLoading,
    cartError,
    cartSummary,
    cartCount,
    fetchCart,
    fetchCartSummary,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearEntireCart,
  };
};
