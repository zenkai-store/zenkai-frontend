import React, { createContext, useContext } from "react";
import { useCart } from "../services/cartService";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const cart = useCart();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};
