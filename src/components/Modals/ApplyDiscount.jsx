import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Percent,
  IndianRupee,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
} from "lucide-react";
import { BASE_URL } from "../../api/api";

import DeleteConfirmationModal from "./DeleteConfirmationModal";

const ApplyDiscountModal = ({
  show,
  onClose,
  templateDetails,
  onDiscountApplied,
}) => {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [segmentExpanded, setSegmentExpanded] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [existingDiscounts, setExistingDiscounts] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    return (
      localStorage.getItem("mm_admin_token") ||
      localStorage.getItem("mm_staff_token")
    );
  };

  // Fetch segments
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/api/segment/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.segments) {
        setSegments(response.data.segments);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load segments. Please try again.",
      );
      console.error("Error fetching segments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async () => {
    if (!discountToDelete) return;

    try {
      setDeleting(true);
      const token = getToken();

      await axios.delete(
        `${BASE_URL}/api/discount/manual/${discountToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Remove from local state
      setExistingDiscounts((prev) =>
        prev.filter((d) => d.id !== discountToDelete.id),
      );

      // Refresh template details
      if (onDiscountApplied) {
        onDiscountApplied();
      }

      setSuccess("Discount deleted successfully!");
      setShowDeleteModal(false);
      setDiscountToDelete(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete discount. Please try again.",
      );
      console.error("Error deleting discount:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Initialize existing discounts from template details
  useEffect(() => {
    if (templateDetails?.discounts) {
      setExistingDiscounts(templateDetails.discounts);
    }
  }, [templateDetails]);

  // Set default expiry date (30 days from now)
  useEffect(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const formattedDate = thirtyDaysFromNow.toISOString().split("T")[0];
    setExpiryDate(formattedDate);
  }, []);

  // Fetch segments when modal opens
  useEffect(() => {
    if (show) {
      fetchSegments();
      setError("");
      setSuccess("");
      setSelectedSegments([]);
      setDiscountValue("");
    }
  }, [show]);

  // Handle segment selection
  const handleSegmentToggle = (segmentId) => {
    setSelectedSegments((prev) => {
      if (prev.includes(segmentId)) {
        return prev.filter((id) => id !== segmentId);
      } else {
        return [...prev, segmentId];
      }
    });
  };

  // Validate form
  const validateForm = () => {
    if (!discountValue || parseFloat(discountValue) <= 0) {
      setError("Please enter a valid discount value");
      return false;
    }

    if (discountType === "PERCENTAGE" && parseFloat(discountValue) > 100) {
      setError("Percentage discount cannot exceed 100%");
      return false;
    }

    if (selectedSegments.length === 0) {
      setError("Please select at least one segment");
      return false;
    }

    if (!expiryDate) {
      setError("Please select an expiry date");
      return false;
    }

    return true;
  };

  // Create discount
  const handleCreateDiscount = async () => {
    if (!validateForm()) return;
    if (!templateDetails) return;

    try {
      setApplyingDiscount(true);
      setError("");
      setSuccess("");

      const token = getToken();
      const expiryDateTime = new Date(expiryDate);
      expiryDateTime.setHours(23, 59, 59, 999);

      const payload = {
        user_id: templateDetails.user_id,
        discount_mode: discountType,
        template_id: templateDetails.id,
        value: parseFloat(discountValue),
        expires_at: expiryDateTime.toISOString(),
        segment_ids: selectedSegments,
      };

      const response = await axios.post(
        `${BASE_URL}/api/discount/manual`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.discount) {
        setSuccess("Discount created successfully!");

        // Refresh template details via callback
        if (onDiscountApplied) {
          setTimeout(() => {
            onDiscountApplied();
            onClose();
          }, 1500);
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create discount. Please try again.",
      );
      console.error("Error creating discount:", err);
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  // Calculate discount summary
  const calculateDiscountSummary = () => {
    if (!templateDetails?.items || !discountValue) return null;

    const applicableItems = templateDetails.items.filter((item) =>
      item.segments?.some((seg) => selectedSegments.includes(seg.id)),
    );

    const totalBeforeDiscount = applicableItems.reduce(
      (sum, item) =>
        sum +
        parseFloat(
          item.original_total_price || item.original_unit_price * item.quantity,
        ),
      0,
    );

    let discountAmount = 0;
    let totalAfterDiscount = 0;

    if (discountType === "PERCENTAGE") {
      discountAmount = (totalBeforeDiscount * parseFloat(discountValue)) / 100;
    } else {
      // Fixed amount per item or total? Assuming per item for calculation
      discountAmount = parseFloat(discountValue) * applicableItems.length;
    }

    totalAfterDiscount = Math.max(0, totalBeforeDiscount - discountAmount);

    return {
      applicableItems: applicableItems.length,
      totalBeforeDiscount,
      discountAmount,
      totalAfterDiscount,
    };
  };

  const summary = calculateDiscountSummary();

  // Get segment names for display
  const getSelectedSegmentNames = () => {
    return selectedSegments
      .map((id) => segments.find((seg) => seg.id === id)?.name)
      .filter(Boolean);
  };

  // Get items with selected segments
  const getItemsWithSelectedSegments = () => {
    if (!templateDetails?.items) return [];
    return templateDetails.items.filter((item) =>
      item.segments?.some((seg) => selectedSegments.includes(seg.id)),
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TicketPercent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Apply Discount
                </h2>
                <p className="text-gray-600 mt-1">
                  Template: {templateDetails?.title || "N/A"}
                </p>
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
          <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDiscountType("PERCENTAGE")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      discountType === "PERCENTAGE"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Percent className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Percentage</span>
                  </button>
                  <button
                    onClick={() => setDiscountType("FIXED_AMOUNT")}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      discountType === "FIXED_AMOUNT"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IndianRupee className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Fixed Amount</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Discount Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {discountType === "PERCENTAGE" ? (
                      <Percent className="h-5 w-5 text-gray-400" />
                    ) : (
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={discountType === "PERCENTAGE" ? "100" : undefined}
                    step="0.01"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    placeholder={
                      discountType === "PERCENTAGE"
                        ? "Enter percentage"
                        : "Enter amount"
                    }
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Expiry Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Segments Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  Apply to Segments
                </label>
                <button
                  onClick={() => setSegmentExpanded(!segmentExpanded)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  {segmentExpanded ? "Collapse" : "Expand"}
                  {segmentExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : segments.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                  No segments found
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Selected Segments Preview */}
                  {selectedSegments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected Segments:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedSegmentNames().map((name, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Segments Checkboxes */}
                  <AnimatePresence>
                    {segmentExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="max-h-60 overflow-y-auto p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {segments.map((segment) => (
                                <label
                                  key={segment.id}
                                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedSegments.includes(segment.id)
                                      ? "bg-purple-50 border border-purple-200"
                                      : "hover:bg-gray-50 border border-transparent"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                    checked={selectedSegments.includes(
                                      segment.id,
                                    )}
                                    onChange={() =>
                                      handleSegmentToggle(segment.id)
                                    }
                                  />
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      {segment.name}
                                    </p>
                                    {segment.categories?.length > 0 && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {segment.categories.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Discount Preview */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  Discount Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Applicable Items</p>
                    <p className="text-lg font-bold text-gray-900">
                      {summary.applicableItems} items
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Original Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(summary.totalBeforeDiscount)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Discount Amount</p>
                    <p className="text-lg font-bold text-red-600">
                      -{formatCurrency(summary.discountAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      Final Total
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      {formatCurrency(summary.totalAfterDiscount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Existing Discounts */}
            {existingDiscounts.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    Existing Discounts ({existingDiscounts.length})
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {existingDiscounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {discount.value}
                              {discount.discount_mode === "PERCENTAGE"
                                ? "%"
                                : " ₹"}
                            </span>
                            <span className="text-xs text-gray-600">
                              • {discount.discount_mode}
                            </span>
                          </div>
                          {discount.segments?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {discount.segments.map((seg) => (
                                <span
                                  key={seg.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700"
                                >
                                  {seg.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Expires</p>
                            <p className="text-xs font-medium">
                              {new Date(
                                discount.expires_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setDiscountToDelete(discount);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete discount"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={applyingDiscount}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDiscount}
              disabled={
                applyingDiscount ||
                !discountValue ||
                selectedSegments.length === 0
              }
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {applyingDiscount ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <TicketPercent className="w-4 h-4" />
                  Apply Discount
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDiscountToDelete(null);
        }}
        onConfirm={handleDeleteDiscount}
        discount={discountToDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default ApplyDiscountModal;
