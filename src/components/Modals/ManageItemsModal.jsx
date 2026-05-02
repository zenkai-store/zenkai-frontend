import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Minus,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Info,
  Settings,
  X,
  IndianRupee,
  Tag,
  CheckCircle,
  Ban,
} from "lucide-react";

const ManageItemsModal = ({
  show,
  onClose,
  templateDetails,
  updatingQuantities,
  removingItems,
  updatingStatus,
  canChangeStatus,
  getStatusInfo,
  formatCurrency,
  handleUpdateQuantity,
  handleRemoveItem,
  handleUpdateStatus,
}) => {
  if (!show || !templateDetails) return null;

  const items = templateDetails.items || [];
  const [localQuantities, setLocalQuantities] = useState({});
  const [removeNotes, setRemoveNotes] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});

  const handleRemoveWithNotes = (itemId) => {
    const note = removeNotes[itemId] || "";
    handleRemoveItem(itemId, note);
  };

  const handleQuantityChange = (itemId, increment) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const currentQty = localQuantities[itemId] || item.quantity;
    const newQty = increment ? currentQty + 1 : Math.max(1, currentQty - 1);

    setLocalQuantities((prev) => ({ ...prev, [itemId]: newQty }));
    handleUpdateQuantity(itemId, newQty);
  };

  // Calculate totals
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.unit_price_snapshot) * item.quantity,
    0,
  );
  const lockedItems = items.filter(
    (item) => !canChangeStatus(item.status),
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Manage Items
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Template: {templateDetails.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold">{totalItems}</span> items
                </span>
                <span className="text-gray-700">
                  <span className="font-semibold">{totalQuantity}</span> total
                  quantity
                </span>
                <span className="text-emerald-600 font-semibold">
                  {formatCurrency(totalValue)}
                </span>
                {lockedItems > 0 && (
                  <span className="text-amber-600">
                    <span className="font-semibold">{lockedItems}</span> locked
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Package className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-xl font-medium text-gray-600">
                No items found
              </p>
              <p className="text-gray-500 mt-2 text-center max-w-md">
                This template doesn't contain any items to manage. Use the "Add
                Items" button to add products.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items List */}
              {items.map((item) => {
                const itemTotal =
                  parseFloat(item.unit_price_snapshot) * item.quantity;
                const locked = !canChangeStatus(item.status);
                const currentQty = localQuantities[item.id] || item.quantity;
                const isUpdating = updatingQuantities[item.id] || false;
                const isRemoving = removingItems[item.id] || false;
                const isUpdatingStatus = updatingStatus[item.id] || false;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Item Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Product Image */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {item.product_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-600">
                                {item.brand_name}
                              </span>
                              <span className="text-sm text-gray-600">•</span>
                              <span className="text-sm text-gray-600">
                                {item.sub_code}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusInfo(item.status).color}`}
                          >
                            {item.status}
                          </span>
                          {locked && (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Cannot modify</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Specifications */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Specifications
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-600">Colour</p>
                              <p className="font-medium">
                                {item.colour_name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Finish</p>
                              <p className="font-medium">
                                {item.finish_name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Unit Price
                              </p>
                              <p className="font-medium">
                                {formatCurrency(item.unit_price_snapshot)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Current MRP
                              </p>
                              <p className="font-medium text-emerald-600">
                                {formatCurrency(item.current_mrp)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Middle Column: Quantity Management */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">
                            Quantity Control
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, false)
                                }
                                disabled={
                                  locked || isUpdating || currentQty <= 1
                                }
                                className={`p-2 border border-gray-300 rounded-l-lg transition-colors ${
                                  locked || isUpdating || currentQty <= 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="px-4 py-2 border-y border-gray-300 min-w-[80px] text-center">
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  <span className="font-bold text-lg">
                                    {currentQty}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, true)
                                }
                                disabled={locked || isUpdating}
                                className={`p-2 border border-gray-300 rounded-r-lg transition-colors ${
                                  locked || isUpdating
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Total Value
                              </p>
                              <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">
                            Item Actions
                          </h4>
                          <div className="space-y-2">
                            {/* Status Buttons */}
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: locked ? 1 : 1.02 }}
                                whileTap={{ scale: locked ? 1 : 0.98 }}
                                onClick={() =>
                                  handleUpdateStatus(item.id, "ACTIVE")
                                }
                                disabled={
                                  locked ||
                                  isUpdatingStatus ||
                                  item.status === "ACTIVE"
                                }
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                  locked ||
                                  isUpdatingStatus ||
                                  item.status === "ACTIVE"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {isUpdatingStatus &&
                                item.status !== "ACTIVE" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Active
                                  </>
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: locked ? 1 : 1.02 }}
                                whileTap={{ scale: locked ? 1 : 0.98 }}
                                onClick={() =>
                                  handleUpdateStatus(item.id, "CANCELLED")
                                }
                                disabled={
                                  locked ||
                                  isUpdatingStatus ||
                                  item.status === "CANCELLED"
                                }
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                  locked ||
                                  isUpdatingStatus ||
                                  item.status === "CANCELLED"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                              >
                                {isUpdatingStatus &&
                                item.status !== "CANCELLED" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    Cancel
                                  </>
                                )}
                              </motion.button>
                            </div>

                            {/* Remove Button with Notes */}
                            <AnimatePresence>
                              {expandedNotes[item.id] && !locked && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <input
                                    type="text"
                                    placeholder="Reason for removal (optional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                                    value={removeNotes[item.id] || ""}
                                    onChange={(e) =>
                                      setRemoveNotes((prev) => ({
                                        ...prev,
                                        [item.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <motion.button
                              whileHover={{ scale: locked ? 1 : 1.02 }}
                              whileTap={{ scale: locked ? 1 : 0.98 }}
                              onClick={() => {
                                if (!locked) {
                                  if (!expandedNotes[item.id]) {
                                    setExpandedNotes((prev) => ({
                                      ...prev,
                                      [item.id]: true,
                                    }));
                                  } else {
                                    handleRemoveWithNotes(item.id);
                                  }
                                }
                              }}
                              disabled={locked || isRemoving}
                              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                locked
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : isRemoving
                                    ? "bg-red-400 text-white cursor-not-allowed"
                                    : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              {isRemoving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  {expandedNotes[item.id]
                                    ? "Confirm Remove"
                                    : "Remove Item"}
                                </>
                              )}
                            </motion.button>

                            {expandedNotes[item.id] && !locked && (
                              <button
                                onClick={() =>
                                  setExpandedNotes((prev) => ({
                                    ...prev,
                                    [item.id]: false,
                                  }))
                                }
                                className="w-full py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                Cancel removal
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Information Panel */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Important Information
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>
                          Items with status{" "}
                          <span className="font-semibold">
                            IN_CART, DELIVERED, or DELIVERING
                          </span>{" "}
                          cannot be modified
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>
                          Cancelling items requires a reason (optional but
                          recommended)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>Quantity cannot be reduced below 1</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>All changes are saved immediately</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {totalItems} item{totalItems !== 1 ? "s" : ""}
              {lockedItems > 0 && (
                <span className="ml-2 text-amber-600">
                  • {lockedItems} item{lockedItems !== 1 ? "s" : ""} locked
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default memo(ManageItemsModal);
