import axios from "axios";
import BASEURL from "../config/baseURL";

/**
 * Add a specific variant to the cart
 * @param {string} variantId - The variant ID to add
 * @param {number} quantity - Quantity (default 1)
 * @returns {Promise} - Axios response promise
 */
export const addVariantToCart = async (variantId, quantity = 1) => {
  if (!variantId) {
    throw new Error("Variant ID is required");
  }

  const payload = {
    variantId,
    quantity: Math.max(1, quantity), // ensure positive quantity
  };

  const response = await axios.post(`${BASEURL}/api/cart`, payload, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

/**
 * Add product from wishlist to cart (adds default variant)
 * @param {string} productId - The product ID
 * @returns {Promise} - Axios response promise
 */
export const addProductFromWishlistToCart = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const response = await axios.post(
    `${BASEURL}/api/cart/from-wishlist/${productId}`,
    {}, // empty body
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response;
};
