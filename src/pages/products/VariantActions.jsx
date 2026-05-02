import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Edit, Trash2, AlertCircle } from "lucide-react";

const EditVariantModal = ({
  variant,
  updating,
  updateError,
  updateSuccess,
  onClose,
  handleUpdateVariant,
}) => {
  const [editForm, setEditForm] = useState({
    mrp: "",
    alloy: "",
    weight_capacity: "",
    usability: "",
    in_box_content: "",
    tags: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (variant) {
      setEditForm({
        mrp: variant.mrp ?? "",
        alloy: variant.alloy ?? "",
        weight_capacity: variant.weight_capacity ?? "",
        usability: variant.usability ?? "",
        in_box_content: variant.in_box_content ?? "",
        tags: variant.tags ?? "",
        status: variant.status ?? "ACTIVE",
      });
    }
  }, [variant]);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Update Variant
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update details for{" "}
                <span className="font-semibold text-blue-600">
                  {variant?.sub_code}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={updating}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {updateError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{updateError}</span>
                </div>
              </div>
            )}

            {updateSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{updateSuccess}</span>
                </div>
              </div>
            )}

            {/* Grid Layout for Better Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* MRP */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.mrp}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mrp: e.target.value })
                    }
                    placeholder="e.g., 5200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    disabled={updating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum Retail Price
                  </p>
                </div>

                {/* Alloy */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Alloy / Material
                  </label>
                  <input
                    type="text"
                    value={editForm.alloy}
                    onChange={(e) =>
                      setEditForm({ ...editForm, alloy: e.target.value })
                    }
                    placeholder="e.g., SS304, Aluminium"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    disabled={updating}
                  />
                </div>

                {/* Weight Capacity */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    Weight Capacity
                  </label>
                  <input
                    type="text"
                    value={editForm.weight_capacity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        weight_capacity: e.target.value,
                      })
                    }
                    placeholder="e.g., 80kg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    disabled={updating}
                  />
                </div>

                {/* Status */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    disabled={updating}
                  >
                    <option value="ACTIVE" className="text-green-600">
                      🟢 Active
                    </option>
                    <option value="INACTIVE" className="text-red-600">
                      🔴 Inactive
                    </option>
                    <option value="OUT_OF_STOCK" className="text-orange-600">
                      🟠 Out of Stock
                    </option>
                    <option value="DISCONTINUED" className="text-gray-600">
                      ⚫ Discontinued
                    </option>
                  </select>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                {/* Usability */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Usability
                  </label>
                  <textarea
                    value={editForm.usability}
                    onChange={(e) =>
                      setEditForm({ ...editForm, usability: e.target.value })
                    }
                    placeholder="e.g., Wooden Door, Metal Door, Commercial Use"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white h-28"
                    disabled={updating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas
                  </p>
                </div>

                {/* In-box Content */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    In-box Content
                  </label>
                  <textarea
                    value={editForm.in_box_content}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        in_box_content: e.target.value,
                      })
                    }
                    placeholder="e.g., Screws, Manual, Warranty Card, Template"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white h-28"
                    disabled={updating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas
                  </p>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tags: e.target.value })
                    }
                    placeholder="e.g., premium, durable, modern, eco-friendly"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    disabled={updating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer - Always Visible */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Variant:</span>{" "}
              {variant?.sub_code}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={updating}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
              <button
                onClick={() => handleUpdateVariant(editForm)}
                disabled={updating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update Variant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VariantActions = ({
  variantId,
  onClose,
  showEditModal = false,
  showDeleteModal = false,
}) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Delete Modal States
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteStep, setDeleteStep] = useState(1); // 1: confirm, 2: success

  const [variant, setVariant] = useState(null);
  const [loadingVariant, setLoadingVariant] = useState(false);

  const fetchProductDetails = async () => {
    try {
      setLoadingVariant(true);
      setUpdateError("");

      const res = await axios.get(
        `https://modern-mahal-api.onrender.com/api/products/variant/${variantId}/details`
      );

      if (res.data?.variant) {
        const variantData = res.data.variant;
        // Helper function to safely parse JSON strings
        const parseJsonField = (field) => {
          if (!field) return "";
          try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) {
              return parsed.join(", ");
            } else if (typeof parsed === "string") {
              return parsed;
            } else {
              return field;
            }
          } catch (err) {
            console.warn("Failed to parse JSON field:", field, err);
            return field; // Return original if parsing fails
          }
        };

        const parsedVariant = {
          ...variantData,
          alloy: parseJsonField(variantData.alloy),
          usability: parseJsonField(variantData.usability),
          in_box_content: parseJsonField(variantData.in_box_content),
          tags: variantData.tags || "",
          mrp: variantData.mrp || "",
          weight_capacity: variantData.weight_capacity || "",
          status: variantData.status || "ACTIVE",
        };
        setVariant(parsedVariant);
      } else {
        setUpdateError("Failed to load variant data");
      }
    } catch (err) {
      console.error("Failed to fetch variant details", err);
      setUpdateError(
        err.response?.data?.message ||
          "Failed to load variant details. Please try again."
      );
    } finally {
      setLoadingVariant(false);
    }
  };

  useEffect(() => {
    if (variantId) {
      fetchProductDetails();
    }
  }, [variantId]);

  // ======================= UPDATE VARIANT =======================
  const handleUpdateVariant = async (editForm) => {
    if (!variantId) {
      setUpdateError("Variant ID is required");
      return;
    }

    try {
      setUpdating(true);
      setUpdateError("");
      setUpdateSuccess("");

      // Get token from localStorage
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");
      const token = adminToken || staffToken;

      if (!token) {
        setUpdateError("Authentication required. Please login again.");
        setUpdating(false);
        return;
      }

      // Prepare payload - convert empty strings to null for API
      const payload = {
        mrp: editForm.mrp ? Number(editForm.mrp) : null,
        alloy: editForm.alloy || null,
        weight_capacity: editForm.weight_capacity || null,
        usability: editForm.usability || null,
        in_box_content: editForm.in_box_content || null,
        tags: editForm.tags || null,
        status: editForm.status || "ACTIVE", // Always include status, default to ACTIVE
      };

      // Don't remove null/empty values - let API handle them
      // The API might expect certain fields even if they're null

      const response = await axios.put(
        `https://modern-mahal-api.onrender.com/api/products/variant/${variantId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUpdateSuccess("Variant updated successfully!");

      // Close modal after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to update variant:", err);
      console.error("Error details:", err.response?.data);

      setUpdateError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update variant. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ======================= DELETE VARIANT =======================
  const handleDeleteVariant = async () => {
    if (!variantId) {
      setDeleteError("Variant ID is required");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      // Check user role
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");

      let url;
      let method;
      let token;

      if (adminToken) {
        // ADMIN: Hard delete
        url = `https://modern-mahal-api.onrender.com/api/products/variant/${variantId}`;
        method = "DELETE";
        token = adminToken;
      } else if (staffToken) {
        // STAFF: Soft delete
        url = `https://modern-mahal-api.onrender.com/api/products/variant/${variantId}/soft-delete`;
        method = "PATCH";
        token = staffToken;
      } else {
        setDeleteError("Authentication required. Please login again.");
        setDeleting(false);
        return;
      }

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setDeleteStep(2); // Show success message

      // Close modal after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to delete variant:", err);
      setDeleteError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete variant. Please try again."
      );
      setDeleting(false);
    }
  };

  // ======================= DELETE CONFIRMATION MODAL =======================
  const DeleteConfirmationModal = () => {
    const isAdmin = !!localStorage.getItem("mm_admin_token");
    const isStaff = !!localStorage.getItem("mm_staff_token");

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
          {deleteStep === 1 ? (
            <>
              {/* Modal Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Delete Variant
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Confirm deletion of {variant?.sub_code}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    disabled={deleting}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {deleteError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">{deleteError}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">
                      Warning: This action cannot be undone
                    </h4>
                    <p className="text-sm text-red-700">
                      You are about to delete variant{" "}
                      <strong>{variant?.sub_code}</strong>.
                      {isAdmin
                        ? " This is a HARD DELETE and will permanently remove the variant from the database."
                        : " This is a SOFT DELETE and will mark the variant as inactive."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Variant Code:</span>
                    <span className="font-medium">{variant?.sub_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-medium">
                      ₹{variant?.mrp?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Status:</span>
                    <span className="font-medium">
                      {variant?.status || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delete Type:</span>
                    <span
                      className={`font-medium ${
                        isAdmin ? "text-red-600" : "text-orange-600"
                      }`}
                    >
                      {isAdmin ? "HARD DELETE (Admin)" : "SOFT DELETE (Staff)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onClose}
                    disabled={deleting}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteVariant}
                    disabled={deleting}
                    className={`px-6 py-2.5 ${
                      isAdmin
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                    } text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2`}
                  >
                    {deleting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      `Delete Variant${isAdmin ? " (Hard)" : " (Soft)"}`
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Success Step
            <>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Variant Deleted Successfully
                </h3>
                <p className="text-gray-600 mb-6">
                  Variant <strong>{variant?.sub_code}</strong> has been{" "}
                  {localStorage.getItem("mm_admin_token")
                    ? "permanently removed"
                    : "soft deleted"}
                  .
                </p>
                <div className="text-sm text-gray-500">
                  This modal will close automatically...
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render the appropriate modal
  return (
    <>
      {showEditModal && (
        <EditVariantModal
          variant={variant}
          updating={updating}
          updateError={updateError}
          updateSuccess={updateSuccess}
          onClose={onClose}
          handleUpdateVariant={handleUpdateVariant}
        />
      )}

      {showDeleteModal && <DeleteConfirmationModal />}
    </>
  );
};

export default VariantActions;
