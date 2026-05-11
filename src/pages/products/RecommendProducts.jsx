import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";

import {
  Heart,
  Package,
  AlertCircle,
  Star,
  BadgePercent,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const RecommendProducts = ({ productId }) => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================= FETCH RECOMMENDED PRODUCTS =======================
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${BASEURL}/api/products/recommend/${productId}`,
          { withCredentials: false },
        );

        if (response.data.success) {
          setProducts(response.data.data || []);
        } else {
          setError("Failed to load recommendations");
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        // Silently fail - recommendations are non-critical
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

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

  // ======================= DON'T RENDER IF NO PRODUCTS =======================
  if (loading) {
    return (
      <div className="w-full mt-16">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full mt-16 lg:mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-10 bg-red-500 rounded"></div>
            <h3 className="text-red-500 font-poppins font-semibold text-base">
              You May Also Like
            </h3>
          </div>
          <h2 className="text-black font-inter font-semibold text-2xl md:text-3xl lg:text-4xl tracking-wide flex items-center gap-3">
            <Sparkles size={28} className="text-red-500" />
            Recommended Products
          </h2>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => {
          const sellingPrice = product.pricing?.sellingPrice;
          const marketPrice = product.variantSummary?.maxPrice;
          const discount = calculateDiscount(marketPrice, sellingPrice);
          const isOutOfStock =
            (product.variantSummary?.totalQuantity || 0) <= 0;
          const hasColors =
            product.variantSummary?.availableColors?.filter((c) => c.isActive)
              ?.length > 0;
          const colors =
            product.variantSummary?.availableColors?.filter(
              (c) => c.isActive,
            ) || [];

          return (
            <div
              key={product._id}
              onClick={() =>
                product.slug && navigate(`/product/${product.slug}`)
              }
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative aspect-square lg:aspect-[4/3] overflow-hidden bg-gray-50">
                {product.media?.url ? (
                  <img
                    src={product.media.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    loading="lazy"
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

                {/* Quick View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    product.slug && navigate(`/product/${product.slug}`);
                  }}
                  className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium text-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black text-center"
                >
                  Quick View
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors mb-2">
                  {product.name}
                </h3>

                {/* Color Dots */}
                {hasColors && (
                  <div className="flex items-center gap-1 mb-2">
                    {colors.slice(0, 4).map((color) => (
                      <span
                        key={color._id}
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                      ></span>
                    ))}
                    {colors.length > 4 && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        +{colors.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  {sellingPrice && (
                    <span className="text-lg sm:text-xl font-bold text-red-500">
                      {formatPrice(sellingPrice)}
                    </span>
                  )}
                  {marketPrice && marketPrice > sellingPrice && (
                    <span className="text-xs sm:text-sm line-through text-gray-400">
                      {formatPrice(marketPrice)}
                    </span>
                  )}
                  {!sellingPrice && !marketPrice && (
                    <span className="text-sm text-gray-400">
                      Price on request
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOutOfStock ? "bg-red-500" : "bg-green-500 animate-pulse"
                    }`}
                  ></span>
                  <span
                    className={`text-xs font-medium ${
                      isOutOfStock ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${product.variantSummary?.totalQuantity || 0} in stock`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendProducts;
