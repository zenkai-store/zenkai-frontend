import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASEURL from "../../config/baseURL";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  Tag,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Palette,
  Box,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";

const ProductsList = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ======================= STATES =======================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const variantFileInputRef = useRef(null);

  // Categories and dropdown data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Expanded product rows for variants
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [productVariants, setProductVariants] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(new Set());

  // Form data for new product
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    categories: [],
    descriptionItems: [], // Array of {type: "topic"|"line"|"bullet", content: ""}
    productDetailsItems: [], // Array of {topic: "", detail: ""}
    defaultVariant: {
      color: { name: "", code: "#000000" },
      pricing: {
        costPrice: "",
        marginalPrice: "",
        marketPrice: "",
        sellingPrice: "",
        onSalePrice: null,
      },
      quantity: "",
    },
    media: [],
  });

  // Variant form data
  const [variantFormData, setVariantFormData] = useState({
    color: { name: "", code: "#ff0000" },
    pricing: {
      costPrice: "",
      marginalPrice: "",
      marketPrice: "",
      sellingPrice: "",
      onSalePrice: null,
    },
    quantity: "",
    media: [],
  });

  // ======================= FETCH PRODUCTS =======================
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      // 👉 If category filter is active → use filter API
      if (filterCategory) {
        const response = await axios.get(
          `${BASEURL}/api/products/category/${filterCategory}`,
          {
            params: { page, limit: 20 },
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setProducts(response.data.data || []);
          setPagination(response.data.pagination || pagination);
        }

        return; // 🚨 IMPORTANT: stop here
      }

      // 👉 Otherwise normal fetch
      const response = await axios.get(`${BASEURL}/api/products`, {
        params: { page, limit: 20 },
        withCredentials: true,
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASEURL}/api/admin/categories`, {
        withCredentials: false,
      });
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, filterCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ======================= SEARCH HANDLER =======================
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      fetchProducts(1);
      return;
    }

    try {
      setSearching(true);
      setIsSearchMode(true);

      const response = await axios.get(`${BASEURL}/api/products/search`, {
        params: { q: searchQuery.trim(), page: 1, limit: 20 },
        withCredentials: true,
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    fetchProducts(1);
  };

  // ======================= FILTER BY CATEGORY =======================
  const handleFilterByCategory = (categoryId) => {
    setFilterCategory(categoryId);
    setCurrentPage(1); // reset page
  };

  // ======================= CREATE PRODUCT =======================
  const handleCreateProduct = async () => {
    if (!formData.name || !formData.productId) {
      setCreateError("Product name and Product ID are required.");
      return;
    }

    if (!formData.defaultVariant.pricing.marketPrice) {
      setCreateError("Market price is required for the default variant.");
      return;
    }

    if (!formData.defaultVariant.pricing.sellingPrice) {
      setCreateError("Selling price is required for the default variant.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      const formDataToSend = new FormData();
      formDataToSend.append("productId", formData.productId);
      formDataToSend.append("name", formData.name);

      // Send quantity as well (backend may use it)
      formDataToSend.append(
        "quantity",
        formData.defaultVariant.quantity || "0",
      );

      // Categories as JSON array
      formDataToSend.append("categories", JSON.stringify(formData.categories));

      // Description as structured array
      formDataToSend.append(
        "description",
        JSON.stringify(formData.descriptionItems),
      );

      // Product details as structured array
      formDataToSend.append(
        "productDetails",
        JSON.stringify(formData.productDetailsItems),
      );

      // Default variant
      formDataToSend.append(
        "defaultVariant",
        JSON.stringify(formData.defaultVariant),
      );

      // Append media files
      formData.media.forEach((file) => {
        formDataToSend.append("media", file);
      });

      const response = await axios.post(
        `${BASEURL}/api/admin/products`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setCreateSuccess("Product created successfully!");
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
          fetchProducts(currentPage);
        }, 1500);
      }
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create product.",
      );
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      name: "",
      descriptionItems: [],
      productDetailsItems: [],
      categories: [],
      defaultVariant: {
        color: { name: "", code: "#000000" },
        pricing: {
          costPrice: "",
          marginalPrice: "",
          marketPrice: "",
          sellingPrice: "",
          onSalePrice: null,
        },
        quantity: "",
      },
      media: [],
    });
    setCreateError("");
    setCreateSuccess("");
  };

  // ======================= HANDLE FILE UPLOAD =======================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files],
    }));
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // ======================= VARIANT MANAGEMENT =======================
  const toggleProductExpand = async (productId) => {
    const newExpanded = new Set(expandedProducts);

    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
      // Fetch variants if not already loaded
      if (!productVariants[productId]) {
        await fetchProductVariants(productId);
      }
    }

    setExpandedProducts(newExpanded);
  };

  const fetchProductVariants = async (productId) => {
    try {
      setLoadingVariants((prev) => new Set(prev).add(productId));

      const response = await axios.get(
        `${BASEURL}/api/admin/products/${productId}/variants`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setProductVariants((prev) => ({
          ...prev,
          [productId]: response.data.data || [],
        }));
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    } finally {
      setLoadingVariants((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Variant file upload handlers
  const handleVariantFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setVariantFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files],
    }));
  };

  const removeVariantFile = (index) => {
    setVariantFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = async () => {
    if (!selectedProduct) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("variant", JSON.stringify(variantFormData));

      variantFormData.media.forEach((file) => {
        formDataToSend.append("media", file);
      });

      const response = await axios.post(
        `${BASEURL}/api/admin/products/${selectedProduct._id}/variants`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setShowVariantModal(false);
        resetVariantForm();
        fetchProductVariants(selectedProduct._id);
      }
    } catch (error) {
      console.error("Failed to add variant:", error);
    }
  };

  const resetVariantForm = () => {
    setVariantFormData({
      color: { name: "", code: "#ff0000" },
      pricing: {
        costPrice: "",
        marginalPrice: "",
        marketPrice: "",
        sellingPrice: "",
        onSalePrice: null,
      },
      quantity: "",
      media: [],
    });
    // Clear file input
    if (variantFileInputRef.current) {
      variantFileInputRef.current.value = "";
    }
  };

  // ======================= DELETE PRODUCT =======================
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(
        `${BASEURL}/api/admin/products/${selectedProduct._id}`,
        { withCredentials: true },
      );

      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  // ======================= STATS DATA =======================
  const stats = [
    {
      title: "Total Products",
      value: pagination.total || 0,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Products",
      value: products.filter((p) => p.isActive).length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: Layers,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg. Price",
      value:
        products.length > 0
          ? `$${Math.round(products.reduce((acc, p) => acc + (p.variantSummary?.minPrice || 0), 0) / products.length)}`
          : "$0",
      icon: DollarSign,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  // ======================= CATEGORY DROPDOWN COMPONENT =======================
  const CategoryDropdown = ({ categories, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCategories = categories.filter((cat) =>
      selectedIds.includes(cat._id),
    );

    const toggleCategory = (catId) => {
      const newSelection = selectedIds.includes(catId)
        ? selectedIds.filter((id) => id !== catId)
        : [...selectedIds, catId];
      onChange(newSelection);
    };

    const removeCategory = (catId) => {
      onChange(selectedIds.filter((id) => id !== catId));
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-left text-white focus:outline-none focus:border-red-500 transition flex items-center justify-between"
        >
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selectedCategories.length > 0 ? (
              selectedCategories.map((cat) => (
                <span
                  key={cat._id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(cat._id);
                    }}
                    className="hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">Select categories...</span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ml-2 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No categories available
              </div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat._id)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-700 transition ${
                    selectedIds.includes(cat._id)
                      ? "text-red-400 bg-red-500/10"
                      : "text-gray-300"
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedIds.includes(cat._id) && (
                    <CheckCircle
                      size={16}
                      className="text-red-400 flex-shrink-0"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // ======================= DESCRIPTION BUILDER COMPONENT =======================
  const DescriptionBuilder = ({ items, onChange }) => {
    const typeOptions = [
      { value: "topic", label: "Topic", icon: "📌" },
      { value: "line", label: "Line", icon: "📝" },
      { value: "bullet", label: "Bullet", icon: "•" },
    ];

    const addItem = () => {
      onChange([...items, { type: "topic", content: "" }]);
    };

    const removeItem = (index) => {
      onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      onChange(newItems);
    };

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* Type Selector */}
            <div className="relative">
              <select
                value={item.type}
                onChange={(e) => updateItem(index, "type", e.target.value)}
                className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition pr-8 cursor-pointer"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Content Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={item.content}
                onChange={(e) => updateItem(index, "content", e.target.value)}
                placeholder={
                  item.type === "topic"
                    ? "Enter heading/topic..."
                    : item.type === "line"
                      ? "Enter description line..."
                      : "Enter bullet point..."
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition text-sm"
              />
              {/* Type indicator */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono uppercase">
                {item.type}
              </span>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500 text-sm">
              No description items added yet
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-600 rounded-xl py-3 text-gray-400 hover:border-red-500 hover:text-red-400 transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Add Description Item
        </button>
      </div>
    );
  };

  // ======================= PRODUCT DETAILS BUILDER COMPONENT =======================
  const ProductDetailsBuilder = ({ items, onChange }) => {
    const addItem = () => {
      onChange([...items, { topic: "", detail: "" }]);
    };

    const removeItem = (index) => {
      onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      onChange(newItems);
    };

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.topic}
                onChange={(e) => updateItem(index, "topic", e.target.value)}
                placeholder="Topic (e.g., Engine)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition text-sm"
              />
              <input
                type="text"
                value={item.detail}
                onChange={(e) => updateItem(index, "detail", e.target.value)}
                placeholder="Detail (e.g., 5.2L V10)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500 text-sm">
              No product details added yet
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-600 rounded-xl py-3 text-gray-400 hover:border-red-500 hover:text-red-400 transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Add Detail
        </button>
      </div>
    );
  };

  // ======================= RENDER =======================
  return (
    <div className="space-y-6">
      {/* ======================= STATS CARDS ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon
                    size={22}
                    className={`text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================= HEADER ACTIONS ======================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or ID..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-20 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>

          {isSearchMode && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                Showing search results for "{searchQuery}"
              </span>
              <button
                onClick={handleClearSearch}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setIsSearchMode(false); // disable search mode
              handleFilterByCategory(e.target.value);
            }}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchProducts(currentPage)}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} />
          </button>

          {/* Add Product Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition shadow-lg hover:shadow-red-500/25"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* ======================= PRODUCTS TABLE ======================= */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Product
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Product ID
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Category
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Price Range
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Stock
                </th>
                <th className="py-4 px-4 text-center text-gray-400 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading || searching ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">
                        {searching
                          ? "Searching products..."
                          : "Loading products..."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400">No products found</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Add your first product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <React.Fragment key={product._id}>
                    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.media?.url ? (
                            <img
                              src={product.media.url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : product.variants?.[0]?.media?.[0]?.url ? (
                            <img
                              src={product.variants[0].media[0].url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {product.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-red-400 font-mono text-sm">
                          {product.productId}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.slice(0, 2).map((cat) => (
                            <span
                              key={cat._id}
                              className="px-2 py-1 bg-gray-700 rounded-full text-gray-300 text-xs"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {product.categories?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-700 rounded-full text-gray-300 text-xs">
                              +{product.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white">
                          {product.pricing?.sellingPrice ? (
                            <>${product.pricing.sellingPrice}</>
                          ) : product.variantSummary?.minPrice ? (
                            <>
                              ${product.variantSummary.minPrice}
                              {product.variantSummary.maxPrice &&
                                product.variantSummary.maxPrice >
                                  product.variantSummary.minPrice && (
                                  <> - ${product.variantSummary.maxPrice}</>
                                )}
                            </>
                          ) : (
                            "$0"
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`${product.variantSummary?.totalQuantity > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {product.variantSummary?.totalQuantity || 0} units
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleProductExpand(product._id)}
                            className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
                            title="View Variants"
                          >
                            {expandedProducts.has(product._id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/products/${product._id}`)
                            }
                            className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowVariantModal(true);
                            }}
                            className="p-2 bg-gray-700 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-gray-600 transition"
                            title="Add Variant"
                          >
                            <Layers size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product._id}`)
                            }
                            className="p-2 bg-gray-700 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-gray-600 transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 bg-gray-700 rounded-lg text-red-400 hover:text-red-300 hover:bg-gray-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Variants Row */}
                    {expandedProducts.has(product._id) && (
                      <tr>
                        <td colSpan="7" className="bg-gray-800/30 p-0">
                          <div className="p-4 border-t border-gray-700">
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Palette size={16} className="text-gray-400" />
                              Variants
                            </h4>

                            {loadingVariants.has(product._id) ? (
                              <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : productVariants[product._id]?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-700">
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        Variant
                                      </th>
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        SKU
                                      </th>
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        Color
                                      </th>
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        Price
                                      </th>
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        Stock
                                      </th>
                                      <th className="py-2 px-3 text-left text-gray-400 text-xs font-medium">
                                        Status
                                      </th>
                                      <th className="py-2 px-3 text-center text-gray-400 text-xs font-medium">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {productVariants[product._id].map(
                                      (variant) => (
                                        <tr
                                          key={variant._id}
                                          className="border-b border-gray-700/50 last:border-0"
                                        >
                                          <td className="py-3 px-3">
                                            <div className="flex items-center gap-3">
                                              {variant.media?.[0]?.url ? (
                                                <img
                                                  src={variant.media[0].url}
                                                  alt={variant.name}
                                                  className="w-10 h-10 rounded object-cover"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                                                  <Package className="w-5 h-5 text-gray-500" />
                                                </div>
                                              )}
                                              <span className="text-white text-sm">
                                                {variant.name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span className="text-gray-400 text-xs font-mono">
                                              {variant.sku}
                                            </span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                              <span
                                                className="w-4 h-4 rounded-full border border-gray-600"
                                                style={{
                                                  backgroundColor:
                                                    variant.color?.code,
                                                }}
                                              />
                                              <span className="text-gray-300 text-sm">
                                                {variant.color?.name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div>
                                              <p className="text-white text-sm">
                                                ${variant.pricing?.sellingPrice}
                                              </p>
                                              {variant.isOnSale &&
                                                variant.pricing
                                                  ?.onSalePrice && (
                                                  <p className="text-green-400 text-xs">
                                                    Sale: $
                                                    {
                                                      variant.pricing
                                                        .onSalePrice
                                                    }
                                                  </p>
                                                )}
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span
                                              className={`${variant.quantity > 0 ? "text-green-400" : "text-red-400"} text-sm`}
                                            >
                                              {variant.quantity} units
                                            </span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span
                                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                variant.isActive
                                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                                              }`}
                                            >
                                              <span
                                                className={`w-1.5 h-1.5 rounded-full ${variant.isActive ? "bg-green-400" : "bg-red-400"}`}
                                              ></span>
                                              {variant.isActive
                                                ? "Active"
                                                : "Inactive"}
                                            </span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div className="flex items-center justify-center gap-1">
                                              <button
                                                className="p-1.5 bg-gray-700 rounded text-gray-400 hover:text-white transition"
                                                title="Edit Variant"
                                              >
                                                <Edit size={14} />
                                              </button>
                                              <button
                                                className="p-1.5 bg-gray-700 rounded text-red-400 hover:text-red-300 transition"
                                                title="Delete Variant"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm text-center py-4">
                                No variants found for this product
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= PAGINATION ======================= */}
      {!isSearchMode && products.length > 0 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <span className="text-gray-400">
            Page {currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ======================= ADD PRODUCT MODAL ======================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Create New Product
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Fill in the product details below
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {createError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400">{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-green-400">{createSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.productId}
                      onChange={(e) =>
                        setFormData({ ...formData, productId: e.target.value })
                      }
                      placeholder="e.g., LAMBO-STO-001"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Lamborghini Huracan STO"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  {/* ===== CATEGORY DROPDOWN WITH TAGS ===== */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Categories
                    </label>
                    <CategoryDropdown
                      categories={categories}
                      selectedIds={formData.categories}
                      onChange={(ids) =>
                        setFormData({ ...formData, categories: ids })
                      }
                    />
                  </div>

                  {/* ===== STRUCTURED DESCRIPTION BUILDER ===== */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <DescriptionBuilder
                      items={formData.descriptionItems}
                      onChange={(items) =>
                        setFormData({ ...formData, descriptionItems: items })
                      }
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product Details (topic: detail format)
                    </label>
                    <ProductDetailsBuilder
                      items={formData.productDetailsItems}
                      onChange={(items) =>
                        setFormData({ ...formData, productDetailsItems: items })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Variant Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.defaultVariant.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultVariant: {
                            ...formData.defaultVariant,
                            quantity: e.target.value,
                          },
                        })
                      }
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Color Name
                      </label>
                      <input
                        type="text"
                        value={formData.defaultVariant.color.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              color: {
                                ...formData.defaultVariant.color,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., Black"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Color Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.defaultVariant.color.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              defaultVariant: {
                                ...formData.defaultVariant,
                                color: {
                                  ...formData.defaultVariant.color,
                                  code: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                        />
                        <input
                          type="text"
                          value={formData.defaultVariant.color.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              defaultVariant: {
                                ...formData.defaultVariant,
                                color: {
                                  ...formData.defaultVariant.color,
                                  code: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="#000000"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Market Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.defaultVariant.pricing.marketPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              pricing: {
                                ...formData.defaultVariant.pricing,
                                marketPrice: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Selling Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.defaultVariant.pricing.sellingPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              pricing: {
                                ...formData.defaultVariant.pricing,
                                sellingPrice: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        On-Sale Price{" "}
                        <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={
                          formData.defaultVariant.pricing.onSalePrice || ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              pricing: {
                                ...formData.defaultVariant.pricing,
                                onSalePrice: e.target.value || null,
                              },
                            },
                          })
                        }
                        placeholder="Leave empty if not on sale"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Discount %
                      </label>
                      <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-green-400 font-medium flex items-center">
                        {formData.defaultVariant.pricing.onSalePrice &&
                        formData.defaultVariant.pricing.marketPrice
                          ? `${Math.round(
                              ((Number(
                                formData.defaultVariant.pricing.marketPrice,
                              ) -
                                Number(
                                  formData.defaultVariant.pricing.onSalePrice,
                                )) /
                                Number(
                                  formData.defaultVariant.pricing.marketPrice,
                                )) *
                                100,
                            )}% OFF`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Hidden fields for cost/marginal price (admin-only internal use) */}
                  <div className="grid grid-cols-2 gap-3 opacity-50 hover:opacity-100 transition">
                    <div>
                      <label className="block text-gray-500 text-xs font-medium mb-1">
                        Cost Price (Internal)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultVariant.pricing.costPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              pricing: {
                                ...formData.defaultVariant.pricing,
                                costPrice: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-medium mb-1">
                        Marginal Price (Internal)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultVariant.pricing.marginalPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVariant: {
                              ...formData.defaultVariant,
                              pricing: {
                                ...formData.defaultVariant.pricing,
                                marginalPrice: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="0"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product Images
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 text-center text-gray-400 hover:border-gray-600 hover:text-gray-300 transition"
                    >
                      <Upload size={24} className="mx-auto mb-2" />
                      <p>Click to upload images</p>
                      <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                    </button>

                    {formData.media.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {formData.media.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-16 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">
                  Fields marked with <span className="text-red-400">*</span> are
                  required
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    disabled={creating}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity:50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                  >
                    {creating ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= ADD VARIANT MODAL ======================= */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Add Variant to {selectedProduct.name}
                </h2>
                <button
                  onClick={() => {
                    setShowVariantModal(false);
                    resetVariantForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Color Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={variantFormData.color.name}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        color: {
                          ...variantFormData.color,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Blue"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={variantFormData.quantity}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Market Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={variantFormData.pricing.marketPrice}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        pricing: {
                          ...variantFormData.pricing,
                          marketPrice: e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Selling Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={variantFormData.pricing.sellingPrice}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        pricing: {
                          ...variantFormData.pricing,
                          sellingPrice: e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    On-Sale Price{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={variantFormData.pricing.onSalePrice || ""}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        pricing: {
                          ...variantFormData.pricing,
                          onSalePrice: e.target.value || null,
                        },
                      })
                    }
                    placeholder="Leave empty if not on sale"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Discount %
                  </label>
                  <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-green-400 font-medium flex items-center">
                    {variantFormData.pricing.onSalePrice &&
                    variantFormData.pricing.marketPrice
                      ? `${Math.round(
                          ((Number(variantFormData.pricing.marketPrice) -
                            Number(variantFormData.pricing.onSalePrice)) /
                            Number(variantFormData.pricing.marketPrice)) *
                            100,
                        )}% OFF`
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Hidden fields for cost/marginal price */}
              <div className="grid grid-cols-2 gap-3 opacity-50 hover:opacity-100 transition">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1">
                    Cost Price (Internal)
                  </label>
                  <input
                    type="number"
                    value={variantFormData.pricing.costPrice}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        pricing: {
                          ...variantFormData.pricing,
                          costPrice: e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1">
                    Marginal Price (Internal)
                  </label>
                  <input
                    type="number"
                    value={variantFormData.pricing.marginalPrice}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        pricing: {
                          ...variantFormData.pricing,
                          marginalPrice: e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Color Code
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={variantFormData.color.code}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        color: {
                          ...variantFormData.color,
                          code: e.target.value,
                        },
                      })
                    }
                    className="w-16 h-12 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                  />
                  <input
                    type="text"
                    value={variantFormData.color.code}
                    onChange={(e) =>
                      setVariantFormData({
                        ...variantFormData,
                        color: {
                          ...variantFormData.color,
                          code: e.target.value,
                        },
                      })
                    }
                    placeholder="#000000"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Variant Media Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Variant Images
                </label>
                <input
                  type="file"
                  ref={variantFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleVariantFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => variantFileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 text-center text-gray-400 hover:border-gray-600 hover:text-gray-300 transition"
                >
                  <Upload size={24} className="mx-auto mb-2" />
                  <p>Click to upload variant images</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                </button>

                {variantFormData.media.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {variantFormData.media.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Variant ${index}`}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeVariantFile(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowVariantModal(false);
                    resetVariantForm();
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVariant}
                  disabled={
                    !variantFormData.color.name ||
                    !variantFormData.pricing.marketPrice ||
                    !variantFormData.pricing.sellingPrice
                  }
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  Add Variant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MODAL ======================= */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">
                Delete Product
              </h2>
              <p className="text-gray-400 text-center">
                Are you sure you want to delete "{selectedProduct.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
