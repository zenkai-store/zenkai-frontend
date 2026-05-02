import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BulkUpload from "./BulkUpload";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
} from "lucide-react";
import VariantActions from "./VariantActions";

const VariantList = () => {
  const navigate = useNavigate();
  // ======================= STATES =======================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total_count: 0,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  });

  // ======================= ADD PRODUCT MODAL STATES =======================
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // ======================= SEARCH STATES =======================
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // ======================= CATEGORY → SEGMENT HELPERS =======================
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySegmentsMap, setCategorySegmentsMap] = useState({});

  // ======================= BULK UPLOAD STATES =======================
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // ======================= VARIANT ACTIONS STATES =======================
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);

  // ======================= DROPDOWN DATA =======================
  const [brands, setBrands] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [segmentsList, setSegmentsList] = useState([]);

  // ======================= UPLOAD STATES (for resetUploadState) =======================
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    product_code: "",
    product_category: [],
    description: "",
    segment: [],
    warranty: "",
    sub_code: "",
    colour: "",
    finish: "",
    mrp: "",
    alloy: "",
    weight_capacity: "",
    usability: "",
    in_box_content: "",
    tags: "",
    highlights: "",
  });

  // Helper function to reset upload state
  const resetUploadState = () => {
    setSelectedFile(null);
    setFileName("");
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess("");
    setUploading(false);
  };

  // ======================= FETCH FUNCTIONS =======================
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://modern-mahal-api.onrender.com/api/products/variants/overview?page=${currentPage}`
      );

      const variants = response.data.variants || [];
      const mappedProducts = variants.map((variant, index) => {
        // Get the status from API response
        const status = variant.status || "ACTIVE";

        // Determine boolean flags for UI display
        const isActive = status === "ACTIVE";
        const isInactive = status === "INACTIVE";
        const isOutOfStock = status === "OUT_OF_STOCK";
        const isDiscontinued = status === "DISCONTINUED";

        return {
          id: variant.variant_id || index + 1,
          sku:
            variant.sub_code ||
            variant.product_code ||
            `V${(index + 1).toString().padStart(3, "0")}`,
          name: variant.product_name || "Unknown Product",
          createdAt: variant.created_at || new Date().toISOString(),
          brand: variant.brand || "Unknown Brand",
          segment:
            typeof variant.segment === "string"
              ? variant.segment.replace(/[{}"]/g, "").split(",").join(", ")
              : Array.isArray(variant.segment)
              ? variant.segment.join(", ")
              : "Not Specified",
          mrp: parseFloat(variant.price),
          // Boolean flags for UI rendering
          active: isActive,
          inactive: isInactive,
          outofstock: isOutOfStock,
          discontinued: isDiscontinued,
          // PRESERVE THE ORIGINAL STATUS STRING - This is the key fix
          status: status,
          product_id: variant.product_id,
          variant_id: variant.variant_id,
          product_code: variant.product_code,
          category: variant.category || [],
          // Include all other fields that VariantActions needs
          sub_code: variant.sub_code || "",
        };
      });

      setProducts(mappedProducts);
      setPagination({
        page: response.data.page || 1,
        per_page: response.data.per_page || 20,
        total_count: response.data.total_count || 0,
        total_pages: response.data.total_pages || 1,
        next_page: response.data.next_page,
        prev_page: response.data.prev_page,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        axios.get("https://modern-mahal-api.onrender.com/api/brand"),
        axios.get("https://modern-mahal-api.onrender.com/api/category"),
      ]);

      setBrands(brandsRes.data.brands || []);
      setCategoriesList(categoriesRes.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  };

  const fetchSegmentsByCategory = async (categoryId, categoryName) => {
    try {
      const res = await axios.get(
        `https://modern-mahal-api.onrender.com/api/segment/category?id=${categoryId}`
      );

      setCategorySegmentsMap((prev) => ({
        ...prev,
        [categoryName]: res.data.segments || [],
      }));
    } catch (err) {
      console.error("Failed to fetch segments for category", categoryName);
    }
  };

  // ======================= USE EFFECTS =======================
  useEffect(() => {
    fetchProductDetails();
  }, [currentPage]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // ======================= HANDLERS =======================
  const handleDelete = (id) => alert(`Delete product ID: ${id}`);
  const handleUpdate = (id) => alert(`Update product ID: ${id}`);

  // Variant action handlers
  const handleEditVariant = (variantId) => {
    setSelectedVariant(variantId);
    setShowEditVariantModal(true);
  };

  const handleDeleteVariant = (variantId) => {
    setSelectedVariant(variantId);
    setShowDeleteVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setSelectedVariant(null);
    setShowEditVariantModal(false);
    setShowDeleteVariantModal(false);
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.product_code) {
      return setCreateError("Product name and product code are required.");
    }

    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      const payload = {
        name: formData.name,
        brand: formData.brand,
        product_code: formData.product_code,
        product_category: formData.product_category,
        description: formData.description,
        segment: formData.segment,
        warranty: formData.warranty,
        sub_code: formData.sub_code,
        colour: formData.colour,
        finish: formData.finish,
        mrp: Number(formData.mrp),
        alloy: formData.alloy,
        weight_capacity: formData.weight_capacity,
        usability: formData.usability.split(",").map((i) => i.trim()),
        in_box_content: formData.in_box_content.split(",").map((i) => i.trim()),
        tags: formData.tags.split(",").map((i) => i.trim()),
        highlights: formData.highlights.split(",").map((i) => i.trim()),
        status: "ACTIVE",
      };

      await axios.post(
        "https://modern-mahal-api.onrender.com/api/products",
        payload
      );

      setCreateSuccess("Product created successfully!");
      setShowAddModal(false);

      // Reset form
      setFormData({
        name: "",
        brand: "",
        product_code: "",
        product_category: [],
        description: "",
        segment: [],
        warranty: "",
        sub_code: "",
        colour: "",
        finish: "",
        mrp: "",
        alloy: "",
        weight_capacity: "",
        usability: "",
        in_box_content: "",
        tags: "",
        highlights: "",
      });

      setSelectedCategories([]);
      setCategorySegmentsMap({});
    } catch (err) {
      setCreateError(
        err?.response?.data?.message || "Failed to create product."
      );
    } finally {
      setCreating(false);
    }
  };

  // helper to format date and numbers
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const fmtNumber = (n) => n.toLocaleString();

  const currentProducts = products;

  // ======================= SEARCH HANDLER =======================
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      // If search query is empty, return to normal listing
      setIsSearchMode(false);
      setSearchResults([]);
      fetchProductDetails();
      return;
    }

    try {
      setSearching(true);
      setIsSearchMode(true);

      // Get token from localStorage
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");
      const token = adminToken || staffToken;

      if (!token) {
        alert("Authentication required. Please login again.");
        setSearching(false);
        return;
      }

      // Determine if query looks like a product code (alphanumeric with optional hyphens)
      const isCodeSearch = /^[A-Za-z0-9\-_]+$/.test(searchQuery.trim());

      const url = isCodeSearch
        ? `https://modern-mahal-api.onrender.com/api/products/search?code=${encodeURIComponent(
            searchQuery
          )}`
        : `https://modern-mahal-api.onrender.com/api/products/search?name=${encodeURIComponent(
            searchQuery
          )}`;

      console.log("Search URL:", url); // For debugging

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiProducts = response.data.products || [];

      // Map search results to match our variant table structure
      const mappedVariants = apiProducts
        .flatMap((product, productIndex) => {
          // If product has variants, map each variant
          if (product.variants && product.variants.length > 0) {
            return product.variants.map((variant, variantIndex) => {
              const status = variant.status || "ACTIVE";
              const isActive = status === "ACTIVE";
              const isInactive = status === "INACTIVE";
              const isOutOfStock = status === "OUT_OF_STOCK";
              const isDiscontinued = status === "DISCONTINUED";

              return {
                id: variant.id || `${productIndex}-${variantIndex}`,
                sku:
                  variant.sub_code ||
                  variant.product_code ||
                  `V${variantIndex + 1}`,
                name: product.product_name || "Unknown Product",
                createdAt:
                  variant.created_at ||
                  product.created_at ||
                  new Date().toISOString(),
                brand: product.brand || "Unknown Brand",
                segment: Array.isArray(product.segment)
                  ? product.segment.join(", ")
                  : product.segment || "Not Specified",
                mrp: parseFloat(variant.mrp || variant.price || 0),
                active: isActive,
                inactive: isInactive,
                outofstock: isOutOfStock,
                discontinued: isDiscontinued,
                status: status,
                product_id: product.id,
                variant_id: variant.id,
                product_code: product.product_code,
                category: product.product_category || [],
                sub_code: variant.sub_code || "",
                // Add any other fields needed for your table display
              };
            });
          } else {
            // If product has no variants, create a single entry from the product itself
            const status = product.status || "ACTIVE";
            const isActive = status === "ACTIVE";
            const isInactive = status === "INACTIVE";
            const isOutOfStock = status === "OUT_OF_STOCK";
            const isDiscontinued = status === "DISCONTINUED";

            return [
              {
                id: product.id || productIndex,
                sku: product.product_code || `P${productIndex + 1}`,
                name: product.product_name || "Unknown Product",
                createdAt: product.created_at || new Date().toISOString(),
                brand: product.brand || "Unknown Brand",
                segment: Array.isArray(product.segment)
                  ? product.segment.join(", ")
                  : product.segment || "Not Specified",
                mrp: parseFloat(product.mrp || product.price || 0),
                active: isActive,
                inactive: isInactive,
                outofstock: isOutOfStock,
                discontinued: isDiscontinued,
                status: status,
                product_id: product.id,
                variant_id: null, // No variant ID for product-only entries
                product_code: product.product_code,
                category: product.product_category || [],
                sub_code: "", // No sub_code for product-only entries
              },
            ];
          }
        })
        .flat(); // Flatten the array

      console.log("Mapped variants from search:", mappedVariants); // For debugging
      setSearchResults(mappedVariants);
    } catch (error) {
      console.error("Search error:", error);
      console.error("Error response:", error.response?.data);

      // Show more specific error message
      let errorMessage = "Search failed. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "Search endpoint not found. Please check API configuration.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
      // Fall back to normal listing on error
      setIsSearchMode(false);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Clear search and return to normal listing
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setSearchResults([]);
    // Only fetch details if not already loading
    if (!loading) {
      fetchProductDetails();
    }
  };

  return (
    <div className="p-6 w-full">
      {/* ======================= TOP BAR (UPDATED STYLE) ======================= */}
      <div className="flex items-center gap-6 mb-6">
        {/* Left: Title */}
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-extrabold text-pink-600">Variants</h2>
        </div>

        {/* Center: big pill search */}
        <div className="flex-1">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm">
                <Search className="text-gray-400 mr-3" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none text-sm placeholder-gray-400 bg-transparent"
                  placeholder="Search by variant code, product name, or sub code..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                )}
              </div>

              {/* Search button - hidden but triggered by form submit */}
              <button type="submit" className="hidden">
                Search
              </button>
            </form>

            {/* Search status indicator */}
            {searching && (
              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                <svg
                  className="animate-spin h-3 w-3"
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
                Searching...
              </div>
            )}

            {isSearchMode && !searching && (
              <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                <span>
                  Showing {searchResults.length} search result
                  {searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add Product
          </button>

          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Bulk Upload
          </button>
        </div>
      </div>

      {/* ======================= PRODUCT TABLE (DESIGN UPDATED) ======================= */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr className="border-b border-gray-200">
              <th className="py-4 px-5 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="py-4 px-5 text-left">Product Name/SKU</th>
              <th className="py-4 px-5 text-left">Created At</th>
              <th className="py-4 px-5 text-left">Brand</th>
              <th className="py-4 px-5 text-left">Segment</th>
              <th className="py-4 px-5 text-right">Available Quantity</th>
              <th className="py-4 px-5 text-left">Status</th>
              <th className="py-4 px-5 text-right">Price</th>
              <th className="py-4 px-5 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading || searching ? (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-500">
                      {searching
                        ? "Searching variants..."
                        : "Loading variants..."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : isSearchMode && searchResults.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      No variants found for "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try searching with a different term
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No variants found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add your first variant to get started
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              (isSearchMode ? searchResults : currentProducts).map((p) => (
                <tr
                  key={p.variant_id || p.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-5 align-top">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>

                  <td className="py-4 px-5 align-top">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex flex-col">
                          <span>SKU: {p.sku}</span>
                          <span className="text-gray-500">
                            Code: {p.product_code || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 align-top">
                    <div className="text-sm text-gray-600">
                      {fmtDate(p.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(p.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>

                  <td className="py-4 px-5 align-top">
                    <div className="text-sm text-gray-700 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {p.brand}
                    </div>
                  </td>

                  <td className="py-4 px-5 align-top">
                    <div className="max-w-[150px]">
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {p.segment}
                      </div>
                      {p.category && p.category.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.category.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {p.category.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{p.category.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5 align-top text-right">
                    <div className="text-sm text-gray-500 italic">
                      Syncing from Zoho...
                    </div>
                    <div className="text-xs text-gray-400">Coming soon</div>
                  </td>

                  <td className="py-4 px-5 align-top">
                    {p.active ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-sm font-medium border border-green-100">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="#16A34A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Active
                      </span>
                    ) : p.inactive ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-sm font-medium border border-red-100">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Inactive
                      </span>
                    ) : p.outofstock ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium border border-orange-100">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="#EA580C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Out of Stock
                      </span>
                    ) : p.discontinued ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-200">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Discontinued
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-200">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Unknown
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 align-top text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ₹{fmtNumber(p.mrp)}
                    </div>
                    <div className="text-xs text-gray-400">MRP</div>
                  </td>

                  <td className="py-4 px-5 align-top text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* 📦 PRODUCT DETAIL BUTTON */}
                      <button
                        onClick={() =>
                          navigate(
                            `/products/details/${p.product_id}?source=variants`
                          )
                        }
                        className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md hover:border-blue-300 transition-all"
                        title="Product Details"
                      >
                        <Package size={16} className="text-indigo-600" />
                      </button>

                      <button
                        onClick={() => handleEditVariant(p.variant_id)}
                        className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md hover:border-blue-300 transition-all"
                        title="Edit"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleDeleteVariant(p.variant_id)}
                        className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md hover:border-blue-300 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ======================= PAGINATION ======================= */}
      {!isSearchMode && products.length > 0 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            disabled={!pagination.prev_page || currentPage === 1}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            onClick={() => {
              if (pagination.prev_page) {
                setCurrentPage((prev) => prev - 1);
              }
            }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {currentPage} of {pagination.total_pages}
          </span>

          <button
            disabled={
              !pagination.next_page || currentPage === pagination.total_pages
            }
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            onClick={() => {
              if (pagination.next_page) {
                setCurrentPage((prev) => prev + 1);
              }
            }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create New Product
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Fill in the product details below
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              {createError && (
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
                    <span className="font-medium">{createError}</span>
                  </div>
                </div>
              )}

              {createSuccess && (
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
                    <span className="font-medium">{createSuccess}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., H Type Handle Glass Door"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., PROD-001"
                          value={formData.product_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              product_code: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <select
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                        >
                          <option value="">Select Brand</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          placeholder="Product description..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-32"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Categories Section */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Categories & Segments
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categories
                        </label>
                        <select
                          onChange={(e) => {
                            const categoryId = e.target.value;
                            const categoryObj = categoriesList.find(
                              (c) => c.id === categoryId
                            );
                            if (!categoryObj) return;

                            if (
                              !selectedCategories.includes(categoryObj.name)
                            ) {
                              setSelectedCategories((prev) => [
                                ...prev,
                                categoryObj.name,
                              ]);
                              setFormData((prev) => ({
                                ...prev,
                                product_category: [
                                  ...prev.product_category,
                                  categoryObj.name,
                                ],
                              }));
                              fetchSegmentsByCategory(
                                categoryObj.id,
                                categoryObj.name
                              );
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                        >
                          <option value="">Add a category</option>
                          {categoriesList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {/* Selected Categories */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedCategories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                              {cat}
                              <button
                                onClick={() => {
                                  setSelectedCategories((prev) =>
                                    prev.filter((c) => c !== cat)
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    product_category:
                                      prev.product_category.filter(
                                        (c) => c !== cat
                                      ),
                                  }));
                                }}
                                className="hover:text-purple-900"
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
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Segments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Segments
                        </label>
                        {Object.entries(categorySegmentsMap).map(
                          ([category, segments]) => (
                            <div key={category} className="mb-3 last:mb-0">
                              <div className="text-sm font-medium text-gray-600 mb-2">
                                {category}
                              </div>
                              <select
                                multiple
                                value={formData.segment}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    segment: Array.from(
                                      new Set([
                                        ...prev.segment,
                                        ...Array.from(
                                          e.target.selectedOptions,
                                          (o) => o.value
                                        ),
                                      ])
                                    ),
                                  }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition h-32"
                              >
                                {segments.map((s) => (
                                  <option key={s.id} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <div className="text-xs text-gray-500 mt-1">
                                Hold Ctrl/Cmd to select multiple
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Specifications */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warranty
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 5 Years"
                          value={formData.warranty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              warranty: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sub Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., VAR-001"
                          value={formData.sub_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sub_code: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Colour
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Silver"
                          value={formData.colour}
                          onChange={(e) =>
                            setFormData({ ...formData, colour: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Finish
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., SS Finish"
                          value={formData.finish}
                          onChange={(e) =>
                            setFormData({ ...formData, finish: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          MRP
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 4999"
                          value={formData.mrp}
                          onChange={(e) =>
                            setFormData({ ...formData, mrp: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alloy
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Stainless Steel"
                          value={formData.alloy}
                          onChange={(e) =>
                            setFormData({ ...formData, alloy: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight Capacity
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 100kg"
                          value={formData.weight_capacity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight_capacity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Additional Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Usability
                        </label>
                        <textarea
                          placeholder="Glass Door, Commercial, Residential..."
                          value={formData.usability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usability: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition h-24"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Separate items with commas
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          In-box Content
                        </label>
                        <textarea
                          placeholder="Handle, Screws, Manual..."
                          value={formData.in_box_content}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              in_box_content: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition h-24"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Separate items with commas
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags
                        </label>
                        <textarea
                          placeholder="premium, durable, modern..."
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition h-20"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Separate tags with commas
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Highlights
                        </label>
                        <textarea
                          placeholder="Easy Installation, Corrosion Resistant..."
                          value={formData.highlights}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              highlights: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition h-28"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Separate highlights with commas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are
                  required
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        name: "",
                        brand: "",
                        product_code: "",
                        product_category: [],
                        description: "",
                        segment: [],
                        warranty: "",
                        sub_code: "",
                        colour: "",
                        finish: "",
                        mrp: "",
                        alloy: "",
                        weight_capacity: "",
                        usability: "",
                        in_box_content: "",
                        tags: "",
                        highlights: "",
                      });
                      setSelectedCategories([]);
                      setCategorySegmentsMap({});
                      setCreateError("");
                      setCreateSuccess("");
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    disabled={creating}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    {creating ? (
                      <span className="flex items-center gap-2">
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
                        Creating...
                      </span>
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUpload
          onClose={() => setShowBulkUploadModal(false)}
          refreshCallback={fetchProductDetails}
          onSuccess={(data) => {
            console.log("Bulk upload successful:", data);
          }}
        />
      )}

      {/* ======================= VARIANT ACTIONS MODALS ======================= */}
      {selectedVariant && (
        <>
          {/* Edit Variant Modal */}
          {showEditVariantModal && (
            <VariantActions
              key={`edit-${selectedVariant}`}
              variantId={selectedVariant}
              onClose={handleCloseVariantModal}
              showEditModal={true}
            />
          )}

          {/* Delete Variant Modal */}
          {showDeleteVariantModal && (
            <VariantActions
              key={`delete-${selectedVariant}`}
              variantId={selectedVariant}
              onClose={handleCloseVariantModal}
              showDeleteModal={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VariantList;
