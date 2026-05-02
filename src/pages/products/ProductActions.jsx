import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, AlertCircle, Check, X } from "lucide-react";

const ProductEditDeleteModal = ({
  productId,
  onClose,
  onSuccess,
  productData,
}) => {
  const [activeTab, setActiveTab] = useState("edit"); // 'edit' or 'delete'
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const adminToken = localStorage.getItem("mm_admin_token");
    setIsAdmin(!!adminToken);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "edit"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("edit")}
          >
            <div className="flex items-center justify-center gap-2">
              <Edit size={18} />
              Edit Product
            </div>
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "delete"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("delete")}
          >
            <div className="flex items-center justify-center gap-2">
              <Trash2 size={18} />
              Delete Product
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === "edit" ? (
            <EditProductTab
              productId={productId}
              onClose={onClose}
              onSuccess={onSuccess}
              initialData={productData}
            />
          ) : (
            <DeleteProductTab
              productId={productId}
              onClose={onClose}
              onSuccess={onSuccess}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Product Component
const EditProductTab = ({ productId, onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    warranty: "",
    categories: [],
    segments: [],
  });

  // Dropdown data
  const [brands, setBrands] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [segmentsList, setSegmentsList] = useState([]);
  const [categorySegmentsMap, setCategorySegmentsMap] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch initial product data and dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get token
        const adminToken = localStorage.getItem("mm_admin_token");
        const staffToken = localStorage.getItem("mm_staff_token");
        const token = adminToken || staffToken;

        if (!token) {
          setError("Authentication required. Please login again.");
          return;
        }

        // Fetch brands and categories in parallel
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get("https://modern-mahal-api.onrender.com/api/brand"),
          axios.get("https://modern-mahal-api.onrender.com/api/category"),
        ]);

        setBrands(brandsRes.data.brands || []);
        setCategoriesList(categoriesRes.data.categories || []);

        // If initialData is provided, use it
        if (initialData) {
          setFormData({
            name: initialData.name || "",
            brand: initialData.brand_id || "",
            description: initialData.description || "",
            warranty: initialData.warranty || "",
            categories: initialData.categories || [],
            segments: initialData.segments || [],
          });

          // Set selected categories
          if (initialData.categories) {
            setSelectedCategories(initialData.categories);

            // Fetch segments for each category
            for (const categoryId of initialData.categories) {
              await fetchSegmentsByCategory(categoryId);
            }
          }
        } else {
          // Fetch product details
          const productRes = await axios.get(
            `https://modern-mahal-api.onrender.com/api/products/${productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const product = productRes.data.product || {};
          setFormData({
            name: product.name || "",
            brand: product.brand_id || "",
            description: product.description || "",
            warranty: product.warranty || "",
            categories: product.categories || [],
            segments: product.segments || [],
          });

          // Set selected categories
          if (product.categories) {
            setSelectedCategories(product.categories);

            // Fetch segments for each category
            for (const categoryId of product.categories) {
              await fetchSegmentsByCategory(categoryId);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, initialData]);

  // Fetch segments by category
  const fetchSegmentsByCategory = async (categoryId) => {
    try {
      const res = await axios.get(
        `https://modern-mahal-api.onrender.com/api/segment/category?id=${categoryId}`
      );

      const category = categoriesList.find((c) => c.id === categoryId);
      if (category) {
        setCategorySegmentsMap((prev) => ({
          ...prev,
          [categoryId]: res.data.segments || [],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch segments:", err);
    }
  };

  // Handle category selection
  const handleCategorySelect = async (categoryId) => {
    if (!categoryId) return;

    const categoryObj = categoriesList.find((c) => c.id === categoryId);
    if (!categoryObj) return;

    // Add to selected categories if not already present
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryId],
      }));

      // Fetch segments for this category
      await fetchSegmentsByCategory(categoryId);
    }
  };

  // Remove category
  const removeCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
      segments: prev.segments.filter((segmentId) => {
        // Only remove segments if they belong exclusively to this category
        const segment = segmentsList.find((s) => s.id === segmentId);
        return segment ? segment.category_id !== categoryId : true;
      }),
    }));
  };

  // Handle segment selection
  const handleSegmentSelect = (segmentId, categoryId) => {
    if (!segmentId) return;

    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.includes(segmentId)
        ? prev.segments.filter((id) => id !== segmentId)
        : [...prev.segments, segmentId],
    }));
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!formData.name) {
      setError("Product name is required");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      // Get token
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");
      const token = adminToken || staffToken;

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      // Prepare payload
      const payload = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        warranty: formData.warranty,
        categories: formData.categories,
        segments: formData.segments,
      };

      // Make API call
      const response = await axios.put(
        `https://modern-mahal-api.onrender.com/api/products/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Product updated successfully!");

      // Call success callback after delay
      setTimeout(() => {
        onSuccess && onSuccess(response.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-500">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="sticky top-0 bg-white pb-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Update product information below
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2 text-red-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 text-green-700">
            <Check size={16} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Form Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter product name"
            />
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <select
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Warranty */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Warranty
            </label>
            <input
              type="text"
              value={formData.warranty}
              onChange={(e) =>
                setFormData({ ...formData, warranty: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., 5 Years"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Categories
            </label>
            <select
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
            >
              <option value="">Add a category</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Selected Categories */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedCategories.map((catId) => {
                const category = categoriesList.find((c) => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {category?.name || catId}
                    <button
                      onClick={() => removeCategory(catId)}
                      className="hover:text-purple-900 p-0.5"
                      aria-label={`Remove ${category?.name}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Product description..."
              rows={4}
            />
          </div>

          {/* Segments by Category */}
          {selectedCategories.length > 0 && (
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Segments
              </label>
              <div className="space-y-3 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {selectedCategories.map((catId) => {
                  const category = categoriesList.find((c) => c.id === catId);
                  const segments = categorySegmentsMap[catId] || [];

                  return segments.length > 0 ? (
                    <div key={catId} className="space-y-2">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {category?.name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {segments.map((segment) => (
                          <label
                            key={segment.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={formData.segments.includes(segment.id)}
                              onChange={() =>
                                handleSegmentSelect(segment.id, catId)
                              }
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700 truncate">
                              {segment.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select segments for each category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || !formData.name}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Product Component
const DeleteProductTab = ({ productId, onClose, onSuccess, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteType, setDeleteType] = useState("soft"); // 'soft' or 'hard'
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!isConfirmed) {
      setError("Please confirm by checking the checkbox");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Get token
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");
      const token = adminToken || staffToken;

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      // For hard delete, ensure user is admin
      if (deleteType === "hard" && !adminToken) {
        setError("Only administrators can perform hard delete");
        return;
      }

      let url, method;

      if (deleteType === "soft") {
        url = `https://modern-mahal-api.onrender.com/api/products/${productId}/soft-delete`;
        method = "PATCH";
      } else {
        url = `https://modern-mahal-api.onrender.com/api/products/${productId}`;
        method = "DELETE";
      }

      const response = await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess(
        `${deleteType === "soft" ? "Soft" : "Hard"} delete successful!`
      );

      // Call success callback after delay
      setTimeout(() => {
        onSuccess && onSuccess(response.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to ${deleteType} delete product`
      );
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationText = () => {
    if (deleteType === "soft") {
      return "I understand this will mark the product as deleted but keep it in the database";
    } else {
      return "I understand this will permanently delete the product and all associated data";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-yellow-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <h4 className="font-medium text-yellow-800">Warning</h4>
            <p className="text-sm text-yellow-700 mt-1">
              {deleteType === "soft"
                ? "Soft delete will mark the product as deleted but keep it in the database for recovery."
                : "Hard delete will permanently remove the product and all associated data. This action cannot be undone."}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Delete Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeleteType("soft")}
            className={`p-4 border rounded-lg transition-colors ${
              deleteType === "soft"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">Soft Delete</div>
              <div className="text-xs text-gray-500 mt-1">
                Mark as deleted (recoverable)
              </div>
            </div>
          </button>
          <button
            onClick={() => setDeleteType("hard")}
            disabled={!isAdmin}
            className={`p-4 border rounded-lg transition-colors ${
              deleteType === "hard"
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:bg-gray-50"
            } ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900 flex items-center gap-2">
                Hard Delete
                {!isAdmin && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Admin Only
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Permanent deletion
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 rounded text-red-600 focus:ring-red-500"
          />
          <div>
            <div className="font-medium text-gray-900">Confirm Deletion</div>
            <div className="text-sm text-gray-500 mt-1">
              {getConfirmationText()}
            </div>
          </div>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "DELETE" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setIsConfirmed(e.target.value === "DELETE");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            placeholder="Type DELETE here"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <Check size={18} />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading || !isConfirmed}
          className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
            deleteType === "hard"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-orange-600 hover:bg-orange-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deleting...
            </span>
          ) : (
            `Confirm ${deleteType === "soft" ? "Soft" : "Hard"} Delete`
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductEditDeleteModal;
