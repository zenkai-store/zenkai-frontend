import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MessageSquare,
  Search,
  Loader2,
  Plus,
  Minus,
  X,
} from "lucide-react";

// Add Items Modal Component
const AddItemsModal = ({
  templateDetails,
  showAddItemsModal,
  searchTerm,
  setSearchTerm,
  handleSearchKeyPress,
  handleSearch,
  searchLoading,
  searchResults,
  quantities,
  notes,
  addingItems,
  handleQuantityChange,
  handleNoteChange,
  handleAddItem,
  resetModalState,
  handleCloseModal,
  formatCurrency,
}) => {
  if (!templateDetails || !showAddItemsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Items</h2>
              <p className="text-gray-600 mt-1">
                Template: {templateDetails.title}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or code..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={searchLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                searchLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {searchLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </motion.button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Search for products by name, product code, or description
          </p>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-lg">Searching products...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Search className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-xl font-medium text-gray-600">
                {searchTerm ? "No products found" : "Search for products"}
              </p>
              <p className="text-gray-500 mt-2 text-center max-w-md">
                {searchTerm
                  ? "No products match your search. Try a different search term."
                  : "Enter a product name or code in the search bar above to find products."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Product Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.product_image ? (
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-600">Brand</p>
                            <p className="font-medium">{product.brand}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Code</p>
                            <p className="font-medium">
                              {product.product_code}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Variants</p>
                            <p className="font-medium">
                              {product.variants.length}
                            </p>
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variants List */}
                  <div className="divide-y divide-gray-100">
                    {product.variants.map((variant) => {
                      const key = `${product.id}-${variant.id}`;
                      const quantity = quantities[key] || 0;
                      const note = notes[key] || "";
                      const isAdding = addingItems[key] || false;

                      return (
                        <div key={variant.id} className="p-4 hover:bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Variant Details */}
                            <div className="lg:col-span-5">
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                  {variant.sub_code}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">
                                    Colour: {variant.colour}
                                  </span>
                                  <span className="text-gray-600">
                                    Finish: {variant.finish}
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {formatCurrency(variant.mrp)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Control */}
                            <div className="lg:col-span-3">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      variant.id,
                                      false,
                                    )
                                  }
                                  className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100 transition-colors"
                                  disabled={quantity === 0}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <div className="px-4 py-2 border-y border-gray-300 min-w-[60px] text-center">
                                  <span className="font-medium">
                                    {quantity}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      variant.id,
                                      true,
                                    )
                                  }
                                  className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Notes Input */}
                            <div className="lg:col-span-3">
                              <input
                                type="text"
                                placeholder="Add notes (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                                value={note}
                                onChange={(e) =>
                                  handleNoteChange(
                                    product.id,
                                    variant.id,
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* Add Button */}
                            <div className="lg:col-span-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleAddItem(product.id, variant.id)
                                }
                                disabled={quantity === 0 || isAdding}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                  quantity === 0
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : isAdding
                                      ? "bg-emerald-400 text-white cursor-not-allowed"
                                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                              >
                                {isAdding ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  "Add"
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {searchResults.length > 0
                ? `Found ${searchResults.length} product${searchResults.length !== 1 ? "s" : ""} with ${searchResults.reduce(
                    (sum, product) => sum + product.variants.length,
                    0,
                  )} variants`
                : "Search for products to add"}
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetModalState}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(AddItemsModal);
