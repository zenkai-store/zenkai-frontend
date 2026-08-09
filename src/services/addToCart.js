import axiosClient from "../utils/axiosClient";

export const addVariantToCart = async (variantId, quantity = 1) => {
  if (!variantId) throw new Error("Variant ID is required");
  const response = await axiosClient.post("/api/cart", {
    variantId,
    quantity: Math.max(1, quantity),
  });
  return response;
};

export const addProductFromWishlistToCart = async (productId) => {
  if (!productId) throw new Error("Product ID is required");
  const response = await axiosClient.post(
    `/api/cart/from-wishlist/${productId}`,
    {},
  );
  return response;
};
