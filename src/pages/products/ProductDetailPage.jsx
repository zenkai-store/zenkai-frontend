import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BASEURL from "../../config/baseURL";
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Plus,
  Tag,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Palette,
  DollarSign,
  Layers,
  Box,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  Clock,
  User,
  Settings,
  Info,
  FileText,
  ShoppingBag,
  TrendingDown,
  BadgePercent,
  Hash,
  List,
  AlignLeft,
  Minus,
  Circle,
  Award,
  Zap,
  Target,
  BarChart3,
  Grid,
  Star,
} from "lucide-react";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const variantFileInputRef = useRef(null);
  const productMediaInputRef = useRef(null);
  const variantMediaInputRef = useRef(null);

  // ======================= STATES =======================
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("all");

  // Variants state
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [expandedVariants, setExpandedVariants] = useState(new Set());

  // Modal states
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  // Action states
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Media management states
  const [selectedVariantForMedia, setSelectedVariantForMedia] = useState(null);
  const [showManageMediaModal, setShowManageMediaModal] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const [variantMediaFiles, setVariantMediaFiles] = useState([]);

  // Categories for edit modal
  const [categories, setCategories] = useState([]);

  // Variant edit states
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantEditFormData, setVariantEditFormData] = useState({
    color: { name: "", code: "#ff0000" },
    pricing: {
      costPrice: "",
      marginalPrice: "",
      marketPrice: "",
      sellingPrice: "",
      onSalePrice: null,
    },
    quantity: "",
    isActive: true,
    isDefault: false,
    isOnSale: false,
  });
  const [variantEditLoading, setVariantEditLoading] = useState(false);
  const [variantEditError, setVariantEditError] = useState("");
  const [variantEditSuccess, setVariantEditSuccess] = useState("");

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

  // Product media upload
  const [productMedia, setProductMedia] = useState([]);

  // Edit product form
  const [editFormData, setEditFormData] = useState({
    name: "",
    productId: "",
    description: "",
    productDetails: "",
    isActive: true,
  });

  // ======================= FETCH PRODUCT DETAILS =======================
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${BASEURL}/api/products/${productId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setProduct(response.data.data);
        setVariants(response.data.data.variants || []);
        setEditFormData({
          name: response.data.data.name || "",
          productId: response.data.data.productId || "",
          description: "",
          productDetails: "",
          isActive: response.data.data.isActive !== false,
        });
      } else {
        setError("Failed to load product details");
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError(err.response?.data?.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // ======================= FETCH CATEGORIES ========================
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

  // Fetch variants separately
  const fetchVariants = async () => {
    try {
      setLoadingVariants(true);
      const response = await axios.get(
        `${BASEURL}/api/admin/products/${productId}/variants`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setVariants(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchCategories();
    }
  }, [productId]);

  // ======================= UTILITY FUNCTIONS =======================
  const calculateDiscount = (marketPrice, onSalePrice) => {
    if (!marketPrice || !onSalePrice || marketPrice <= 0) return 0;
    return Math.round(((marketPrice - onSalePrice) / marketPrice) * 100);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================= VARIANT MANAGEMENT =======================
  const toggleVariantExpand = (variantId) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

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
    if (
      !variantFormData.color.name ||
      !variantFormData.pricing.sellingPrice ||
      !variantFormData.pricing.marketPrice
    ) {
      setActionError(
        "Color name, market price, and selling price are required.",
      );
      return;
    }

    try {
      setCreating(true);
      setActionError("");
      setActionSuccess("");

      const formDataToSend = new FormData();

      const { media, ...variantData } = variantFormData;
      formDataToSend.append("variant", JSON.stringify(variantData));

      variantFormData.media.forEach((file) => {
        formDataToSend.append("media", file);
      });

      const response = await axios.post(
        `${BASEURL}/api/admin/products/${productId}/variants`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setActionSuccess("Variant added successfully!");
        setTimeout(() => {
          setShowAddVariantModal(false);
          resetVariantForm();
          fetchProductDetails();
          setActionSuccess("");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to add variant:", error);
      setActionError(error.response?.data?.message || "Failed to add variant.");
    } finally {
      setCreating(false);
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
    setActionError("");
    if (variantFileInputRef.current) {
      variantFileInputRef.current.value = "";
    }
  };

  // ======================= PRODUCT MEDIA MANAGEMENT =======================
  const handleProductMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    setProductMedia((prev) => [...prev, ...files]);
  };

  const removeProductMedia = (index) => {
    setProductMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProductMedia = async () => {
    if (productMedia.length === 0) {
      setActionError("Please select at least one image.");
      return;
    }

    try {
      setUploading(true);
      setActionError("");
      setActionSuccess("");

      const formData = new FormData();
      productMedia.forEach((file) => {
        formData.append("media", file);
      });

      const response = await axios.post(
        `${BASEURL}/api/admin/products/${productId}/media`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setActionSuccess("Media added successfully!");
        setTimeout(() => {
          setShowAddMediaModal(false);
          setProductMedia([]);
          fetchProductDetails();
          setActionSuccess("");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to add media:", error);
      setActionError(error.response?.data?.message || "Failed to add media.");
    } finally {
      setUploading(false);
    }
  };

  // ======================= PRODUCT ACTIONS =======================
  const handleUpdateProduct = async () => {
    try {
      setCreating(true);
      setActionError("");

      const response = await axios.put(
        `${BASEURL}/api/admin/products/${productId}`,
        {
          name: editFormData.name,
          isActive: editFormData.isActive,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        setActionSuccess("Product updated successfully!");
        setTimeout(() => {
          setShowEditProductModal(false);
          fetchProductDetails();
          setActionSuccess("");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      setActionError(
        error.response?.data?.message || "Failed to update product.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setCreating(true);

      await axios.delete(`${BASEURL}/api/admin/products/${productId}`, {
        withCredentials: true,
      });

      navigate("/admin/products/list");
    } catch (error) {
      console.error("Failed to delete product:", error);
      setActionError(
        error.response?.data?.message || "Failed to delete product.",
      );
      setShowDeleteProductModal(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?"))
      return;

    try {
      await axios.delete(
        `${BASEURL}/api/admin/products/${productId}/variants/${variantId}`,
        { withCredentials: true },
      );
      fetchProductDetails();
    } catch (error) {
      console.error("Failed to delete variant:", error);
      alert("Failed to delete variant.");
    }
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;
    try {
      setVariantEditLoading(true);
      setVariantEditError("");
      setVariantEditSuccess("");

      const response = await axios.put(
        `${BASEURL}/api/admin/products/${productId}/variants/${editingVariant._id}`,
        {
          color: variantEditFormData.color,
          pricing: variantEditFormData.pricing,
          quantity: variantEditFormData.quantity,
          isActive: variantEditFormData.isActive,
          isDefault: variantEditFormData.isDefault,
          isOnSale: variantEditFormData.isOnSale,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        setVariantEditSuccess("Variant updated successfully!");
        setTimeout(() => {
          setShowEditVariantModal(false);
          setEditingVariant(null);
          fetchProductDetails();
          setVariantEditSuccess("");
        }, 1500);
      }
    } catch (error) {
      setVariantEditError(
        error.response?.data?.message || "Failed to update variant.",
      );
    } finally {
      setVariantEditLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  // ======================= STATS CALCULATION =======================
  const calculateStats = () => {
    if (!variants.length)
      return {
        totalStock: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        onSaleCount: 0,
      };

    const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    const prices = variants
      .map((v) => v.pricing?.sellingPrice || 0)
      .filter((p) => p > 0);
    const avgPrice = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const onSaleCount = variants.filter((v) => v.isOnSale).length;

    return { totalStock, avgPrice, minPrice, maxPrice, onSaleCount };
  };

  const stats = calculateStats();

  // ======================= MEDIA MANAGEMENT FUNCTIONS =======================
  const openManageMediaModal = (variant) => {
    setSelectedVariantForMedia(variant);
    setVariantMediaFiles([]);
    setActionError("");
    setActionSuccess("");
    setShowManageMediaModal(true);
  };

  const handleVariantMediaFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setVariantMediaFiles((prev) => [...prev, ...files]);
  };

  const removeVariantMediaFile = (index) => {
    setVariantMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadVariantMedia = async () => {
    if (!selectedVariantForMedia || variantMediaFiles.length === 0) {
      setActionError("Please select at least one image to upload.");
      return;
    }

    try {
      setUploading(true);
      setActionError("");
      setActionSuccess("");

      const formData = new FormData();
      variantMediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      const response = await axios.post(
        `${BASEURL}/api/admin/products/${productId}/variants/${selectedVariantForMedia._id}/media`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setActionSuccess("Media uploaded successfully!");
        setVariantMediaFiles([]);
        setTimeout(() => {
          fetchProductDetails();
          setActionSuccess("");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
      setActionError(
        error.response?.data?.message || "Failed to upload media.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVariantMedia = async (variantId, publicId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      setDeletingMediaId(publicId);
      setActionError("");

      // URL-encode the public_id to handle slashes in Cloudinary path
      const encodedPublicId = encodeURIComponent(publicId);

      const response = await axios.delete(
        `${BASEURL}/api/admin/products/${productId}/variants/${variantId}/media/${encodedPublicId}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setActionSuccess("Image deleted successfully!");
        setTimeout(() => {
          fetchProductDetails();
          setActionSuccess("");
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      setActionError(
        error.response?.data?.message || "Failed to delete media.",
      );
    } finally {
      setDeletingMediaId(null);
    }
  };

  // ======================= DESCRIPTION RENDERER =======================
  const renderDescriptionItem = (item, index) => {
    const icons = {
      topic: (
        <FileText size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
      ),
      line: <Minus size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />,
      bullet: (
        <Circle
          size={8}
          className="text-red-400 flex-shrink-0 mt-1.5"
          fill="currentColor"
        />
      ),
    };

    const styles = {
      topic:
        "text-white font-semibold text-base border-b border-gray-700/50 pb-2",
      line: "text-gray-300 text-sm leading-relaxed",
      bullet: "text-gray-300 text-sm ml-2",
    };

    return (
      <div key={index} className="flex items-start gap-2">
        {icons[item.type] || icons.bullet}
        <p className={styles[item.type] || styles.line}>{item.content}</p>
      </div>
    );
  };

  // ======================= LOADING STATE =======================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ======================= ERROR STATE =======================
  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-gray-700 shadow-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Product Not Found
          </h3>
          <p className="text-gray-400 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/admin/products/list")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3.5 rounded-xl hover:from-red-600 hover:to-pink-700 transition font-medium shadow-lg shadow-red-500/25"
          >
            <ArrowLeft size={18} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ======================= MAIN RENDER =======================
  return (
    <div className="space-y-6 pb-8">
      {/* ======================= HEADER BREADCRUMB ======================= */}
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <button
          onClick={() => navigate("/admin/products/list")}
          className="hover:text-white transition"
        >
          Products
        </button>
        <span>/</span>
        <span className="text-white truncate max-w-md">{product.name}</span>
      </div>

      {/* ======================= HERO HEADER ======================= */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {variants[0]?.media?.[0]?.url ? (
                <div className="relative group">
                  <img
                    src={variants[0].media[0].url}
                    alt={product.name}
                    className="w-full lg:w-64 h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition" />
                </div>
              ) : (
                <div className="w-full lg:w-64 h-64 bg-gray-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-600">
                  <ImageIcon className="w-16 h-16 text-gray-500" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-mono text-sm font-medium">
                      <Hash size={14} />
                      {product.productId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                      ></span>
                      {product.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                {/* Price Summary */}
                {variants.length > 0 && variants[0]?.pricing && (
                  <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 flex-shrink-0">
                    {variants[0].isOnSale && variants[0].pricing.onSalePrice ? (
                      <div className="text-center">
                        <p className="text-gray-500 text-xs line-through mb-1">
                          {formatPrice(variants[0].pricing.marketPrice)}
                        </p>
                        <p className="text-3xl font-bold text-green-400">
                          {formatPrice(variants[0].pricing.onSalePrice)}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-400 text-xs font-bold mt-1">
                          <BadgePercent size={12} />
                          {calculateDiscount(
                            variants[0].pricing.marketPrice,
                            variants[0].pricing.onSalePrice,
                          )}
                          % OFF
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">
                          Market Price
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {formatPrice(variants[0].pricing.marketPrice)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Sell: {formatPrice(variants[0].pricing.sellingPrice)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.categories.map((cat) => (
                    <span
                      key={cat._id}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-full text-red-300 text-sm font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Created {formatDate(product.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Updated {formatDate(product.updatedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers size={14} />
                  {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-3 flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddVariantModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition text-sm font-medium"
          >
            <Plus size={16} />
            Add Variant
          </button>

          <button
            onClick={() => setShowEditProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 transition text-sm font-medium"
          >
            <Edit size={16} />
            Edit Product
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600 transition text-sm font-medium"
          >
            <Copy size={16} />
            Copy Link
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowDeleteProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete Product
          </button>
        </div>
      </div>

      {/* ======================= STATS CARDS ======================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Layers size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{variants.length}</p>
          <p className="text-gray-400 text-sm mt-1">Total Variants</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Box size={18} className="text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalStock}</p>
          <p className="text-gray-400 text-sm mt-1">Total Stock</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign size={18} className="text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatPrice(stats.minPrice)}
            {stats.maxPrice > stats.minPrice && (
              <span className="text-lg text-gray-400">
                {" "}
                — {formatPrice(stats.maxPrice)}
              </span>
            )}
          </p>
          <p className="text-gray-400 text-sm mt-1">Price Range</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <BarChart3 size={18} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatPrice(Math.round(stats.avgPrice))}
          </p>
          <p className="text-gray-400 text-sm mt-1">Average Price</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <BadgePercent size={18} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.onSaleCount}</p>
          <p className="text-gray-400 text-sm mt-1">On Sale</p>
        </div>
      </div>

      {/* ======================= MAIN CONTENT ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Description & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== DESCRIPTION CARD ===== */}
          {product.description && product.description.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={22} className="text-red-400" />
                  Product Description
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {product.description.map((item, index) =>
                  renderDescriptionItem(item, index),
                )}
              </div>
            </div>
          )}

          {/* ===== PRODUCT DETAILS / SPECIFICATIONS CARD ===== */}
          {product.productDetails && product.productDetails.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Grid size={22} className="text-blue-400" />
                  Technical Specifications
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.productDetails.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-gray-600 transition group"
                    >
                      <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition">
                        {item.topic}
                      </span>
                      <span className="text-white text-sm font-medium text-right ml-4 max-w-[60%]">
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== AVAILABLE COLORS ===== */}
          {product.variantSummary?.availableColors &&
            product.variantSummary.availableColors.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Palette size={22} className="text-purple-400" />
                    Available Colors
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {product.variantSummary.availableColors.map(
                      (color, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition"
                        >
                          <span
                            className="w-8 h-8 rounded-full border-2 border-gray-600 shadow-inner"
                            style={{ backgroundColor: color.code }}
                          />
                          <div>
                            <span className="text-white font-medium text-sm block">
                              {color.name}
                            </span>
                            <span className="text-gray-500 text-xs font-mono">
                              {color.code}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Right Column - Pricing & Media */}
        <div className="space-y-6">
          {/* ===== PRICING CARD ===== */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign size={22} className="text-yellow-400" />
                Pricing Overview
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {variants.map((variant) => (
                <div
                  key={variant._id}
                  className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: variant.color?.code }}
                    />
                    <span className="text-white font-medium text-sm">
                      {variant.color?.name}
                    </span>
                    {variant.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Market Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        Market Price
                      </span>
                      <span
                        className={`text-white font-semibold ${variant.isOnSale && variant.pricing.onSalePrice ? "line-through text-gray-500" : ""}`}
                      >
                        {formatPrice(variant.pricing.marketPrice)}
                      </span>
                    </div>

                    {/* Selling Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        Selling Price
                      </span>
                      <span className="text-white font-semibold">
                        {formatPrice(variant.pricing.sellingPrice)}
                      </span>
                    </div>

                    {/* On Sale Price */}
                    {variant.isOnSale && variant.pricing.onSalePrice && (
                      <div className="flex justify-between items-center bg-green-500/10 rounded-lg px-3 py-2 border border-green-500/20">
                        <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                          <BadgePercent size={14} />
                          Sale Price
                        </span>
                        <div className="text-right">
                          <span className="text-green-400 font-bold text-lg">
                            {formatPrice(variant.pricing.onSalePrice)}
                          </span>
                          <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 rounded text-green-400 text-xs font-bold">
                            -
                            {calculateDiscount(
                              variant.pricing.marketPrice,
                              variant.pricing.onSalePrice,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Internal Pricing (Collapsible) */}
                    <details className="group">
                      <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-400 transition flex items-center gap-1">
                        <ChevronDown
                          size={12}
                          className="group-open:rotate-180 transition-transform"
                        />
                        Internal Pricing
                      </summary>
                      <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Cost Price</span>
                          <span className="text-gray-400">
                            {formatPrice(variant.pricing.costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Marginal Price</span>
                          <span className="text-gray-400">
                            {formatPrice(variant.pricing.marginalPrice)}
                          </span>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Stock */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Stock</span>
                    <span
                      className={`font-semibold ${variant.quantity > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {variant.quantity} units
                    </span>
                  </div>
                </div>
              ))}

              {variants.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No pricing data available</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== MEDIA GALLERY PER VARIANT ===== */}
          {variants.map((variant) => (
            <div
              key={variant._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg"
            >
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-green-400" />
                  <h3 className="text-white font-semibold text-sm">
                    {variant.color?.name} Images
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-400">
                    {variant.media?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => openManageMediaModal(variant)}
                  className="p-1.5 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
                  title="Manage Images"
                >
                  <Edit size={14} />
                </button>
              </div>
              <div className="p-3">
                {variant.media && variant.media.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {variant.media.slice(0, 6).map((media, idx) => (
                        <div
                          key={idx}
                          className="relative group cursor-pointer"
                        >
                          <img
                            src={media.url}
                            alt={`${variant.color?.name} ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg hover:ring-2 hover:ring-red-500 transition"
                          />
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center"
                          >
                            <Eye size={18} className="text-white" />
                          </a>
                        </div>
                      ))}
                    </div>
                    {variant.media.length > 6 && (
                      <button
                        onClick={() => openManageMediaModal(variant)}
                        className="w-full mt-2 text-center text-gray-400 text-xs hover:text-red-400 transition py-1"
                      >
                        +{variant.media.length - 6} more — View All
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">No images</p>
                    <button
                      onClick={() => openManageMediaModal(variant)}
                      className="mt-2 text-red-400 hover:text-red-300 text-xs font-medium transition"
                    >
                      <Plus size={12} className="inline mr-1" />
                      Add Images
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {variants.length === 0 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 text-center">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No variants available</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================= VARIANTS TABLE ======================= */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers size={22} className="text-purple-400" />
            All Variants
            <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 font-normal">
              {variants.length}
            </span>
          </h2>
          <button
            onClick={fetchVariants}
            className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
            title="Refresh variants"
          >
            <RefreshCw
              size={16}
              className={loadingVariants ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loadingVariants ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-16">
              <Box className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No variants yet</p>
              <button
                onClick={() => setShowAddVariantModal(true)}
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition"
              >
                <Plus size={16} />
                Add your first variant
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Color
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Market Price
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Sell Price
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Sale
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-4 text-center text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {variants.map((variant) => (
                  <tr
                    key={variant._id}
                    className="hover:bg-gray-800/30 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {variant.media?.[0]?.url ? (
                          <img
                            src={variant.media[0].url}
                            alt={variant.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[200px]">
                            {variant.name}
                          </p>
                          {variant.isDefault && (
                            <span className="text-blue-400 text-xs">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-xs font-mono">
                        {variant.sku}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: variant.color?.code }}
                        />
                        <span className="text-gray-300 text-sm">
                          {variant.color?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-white font-medium ${variant.isOnSale && variant.pricing.onSalePrice ? "line-through text-gray-500" : ""}`}
                      >
                        {formatPrice(variant.pricing.marketPrice)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">
                        {formatPrice(variant.pricing.sellingPrice)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {variant.isOnSale && variant.pricing.onSalePrice ? (
                        <div>
                          <p className="text-green-400 font-semibold">
                            {formatPrice(variant.pricing.onSalePrice)}
                          </p>
                          <span className="text-green-500 text-xs font-bold">
                            -
                            {calculateDiscount(
                              variant.pricing.marketPrice,
                              variant.pricing.onSalePrice,
                            )}
                            %
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold ${variant.quantity > 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {variant.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          variant.isActive
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleVariantExpand(variant._id)}
                          className="p-1.5 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
                          title="View Details"
                        >
                          {expandedVariants.has(variant._id) ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingVariant(variant);
                            setVariantEditFormData({
                              color: variant.color || {
                                name: "",
                                code: "#ff0000",
                              },
                              pricing: {
                                costPrice: variant.pricing?.costPrice || "",
                                marginalPrice:
                                  variant.pricing?.marginalPrice || "",
                                marketPrice: variant.pricing?.marketPrice || "",
                                sellingPrice:
                                  variant.pricing?.sellingPrice || "",
                                onSalePrice:
                                  variant.pricing?.onSalePrice || null,
                              },
                              quantity: variant.quantity || "",
                              isActive: variant.isActive !== false,
                              isDefault: variant.isDefault || false,
                              isOnSale: variant.isOnSale || false,
                            });
                            setShowEditVariantModal(true);
                          }}
                          className="p-1.5 bg-gray-700 rounded text-gray-400 hover:text-white transition"
                          title="Edit Variant"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant._id)}
                          className="p-1.5 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                          title="Delete Variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ======================= ADD VARIANT MODAL ======================= */}
      {showAddVariantModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Add New Variant
                </h2>
                <button
                  onClick={() => {
                    setShowAddVariantModal(false);
                    resetVariantForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-400 flex-shrink-0"
                  />
                  <span className="text-red-400 text-sm">{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-green-400 flex-shrink-0"
                  />
                  <span className="text-green-400 text-sm">
                    {actionSuccess}
                  </span>
                </div>
              )}

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
                    placeholder="e.g., Matte Black"
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
                    min="0"
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
                    min="0"
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
                    min="0"
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
                    placeholder="Sale price"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Color Code
                  </label>
                  <div className="flex items-center gap-2">
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
                      className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
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
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <details className="group">
                <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-400 transition flex items-center gap-1">
                  <ChevronDown
                    size={12}
                    className="group-open:rotate-180 transition-transform"
                  />
                  Internal Pricing (Cost & Marginal)
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1">
                      Cost Price
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
                      min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1">
                      Marginal Price
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
                      min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                    />
                  </div>
                </div>
              </details>

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
                  <p>Click to upload images</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                </button>

                {variantFormData.media.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {variantFormData.media.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
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

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddVariantModal(false);
                    resetVariantForm();
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVariant}
                  disabled={
                    creating ||
                    !variantFormData.color.name ||
                    !variantFormData.pricing.marketPrice ||
                    !variantFormData.pricing.sellingPrice
                  }
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {creating ? "Creating..." : "Add Variant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= ADD MEDIA MODAL ======================= */}
      {showAddMediaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Add Product Media
                </h2>
                <button
                  onClick={() => {
                    setShowAddMediaModal(false);
                    setProductMedia([]);
                    setActionError("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400">{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-green-400">{actionSuccess}</span>
                </div>
              )}

              <input
                type="file"
                ref={productMediaInputRef}
                multiple
                accept="image/*"
                onChange={handleProductMediaSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => productMediaInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-400 hover:border-gray-600 hover:text-gray-300 transition"
              >
                <Upload size={32} className="mx-auto mb-3" />
                <p className="font-medium">Click to select images</p>
                <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
              </button>

              {productMedia.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productMedia.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeProductMedia(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddMediaModal(false);
                    setProductMedia([]);
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProductMedia}
                  disabled={uploading || productMedia.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MANAGE VARIANT MEDIA MODAL ======================= */}
      {showManageMediaModal && selectedVariantForMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon size={20} className="text-green-400" />
                    Manage Images
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-600"
                      style={{
                        backgroundColor: selectedVariantForMedia.color?.code,
                      }}
                    />
                    {selectedVariantForMedia.color?.name} Variant
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowManageMediaModal(false);
                    setSelectedVariantForMedia(null);
                    setVariantMediaFiles([]);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {actionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-400 flex-shrink-0"
                  />
                  <span className="text-red-400 text-sm">{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-green-400 flex-shrink-0"
                  />
                  <span className="text-green-400 text-sm">
                    {actionSuccess}
                  </span>
                </div>
              )}

              {/* ===== EXISTING IMAGES ===== */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  Existing Images
                  <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-400 font-normal">
                    {selectedVariantForMedia.media?.length || 0}
                  </span>
                </h3>

                {selectedVariantForMedia.media &&
                selectedVariantForMedia.media.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedVariantForMedia.media.map((media, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={media.url}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-gray-700"
                        />
                        {/* Hover Overlay with Actions */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 rounded-xl transition flex flex-col items-center justify-center gap-2">
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition"
                            title="View Full Size"
                          >
                            <Eye size={18} />
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteVariantMedia(
                                selectedVariantForMedia._id,
                                media.public_id,
                              )
                            }
                            disabled={deletingMediaId === media.public_id}
                            className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition disabled:opacity-50"
                            title="Delete Image"
                          >
                            {deletingMediaId === media.public_id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                        {/* Public ID Badge */}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-gray-400 text-[10px] truncate max-w-[90%]">
                          {media.public_id?.substring(0, 20)}...
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
                    <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No images uploaded for this variant
                    </p>
                  </div>
                )}
              </div>

              {/* ===== DIVIDER ===== */}
              <div className="border-t border-gray-700"></div>

              {/* ===== UPLOAD NEW IMAGES ===== */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Upload size={16} className="text-green-400" />
                  Upload New Images
                </h3>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleVariantMediaFileSelect}
                  className="hidden"
                  id="variantMediaUpload"
                />
                <label
                  htmlFor="variantMediaUpload"
                  className="block w-full border-2 border-dashed border-gray-700 rounded-xl p-6 text-center text-gray-400 hover:border-green-500 hover:text-green-400 transition cursor-pointer"
                >
                  <Upload size={28} className="mx-auto mb-2" />
                  <p className="font-medium">Click to select images</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                </label>

                {variantMediaFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-2">
                      {variantMediaFiles.length} file
                      {variantMediaFiles.length > 1 ? "s" : ""} selected
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {variantMediaFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            onClick={() => removeVariantMediaFile(index)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            <X size={11} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUploadVariantMedia}
                      disabled={uploading}
                      className="mt-3 w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </span>
                      ) : (
                        `Upload ${variantMediaFiles.length} Image${variantMediaFiles.length > 1 ? "s" : ""}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT PRODUCT MODAL (Enhanced) ======================= */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Product</h2>
                <button
                  onClick={() => {
                    setShowEditProductModal(false);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {actionError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400">{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-green-400">{actionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.productId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          productId: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Categories
                    </label>
                    <CategoryDropdown
                      categories={categories}
                      selectedIds={editFormData.categories || []}
                      onChange={(ids) =>
                        setEditFormData({ ...editFormData, categories: ids })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <DescriptionBuilder
                      items={editFormData.descriptionItems || []}
                      onChange={(items) =>
                        setEditFormData({
                          ...editFormData,
                          descriptionItems: items,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Product Details */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Product Details (topic: detail format)
                    </label>
                    <ProductDetailsBuilder
                      items={editFormData.productDetailsItems || []}
                      onChange={(items) =>
                        setEditFormData({
                          ...editFormData,
                          productDetailsItems: items,
                        })
                      }
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.isActive}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isActive: e.target.value === "true",
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditProductModal(false);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProduct}
                  disabled={creating}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {creating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE PRODUCT MODAL ======================= */}
      {showDeleteProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle size={40} className="text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-3">
                Delete Product
              </h2>
              <p className="text-gray-400 text-center text-lg">
                Are you sure you want to delete "
                <span className="text-white font-medium">{product.name}</span>"?
              </p>
              <p className="text-red-400/70 text-center text-sm mt-2">
                This action cannot be undone. All variants will also be deleted.
              </p>
            </div>
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteProductModal(false)}
                  className="px-8 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={creating}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition font-medium shadow-lg shadow-red-500/25"
                >
                  {creating ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT VARIANT MODAL ======================= */}
      {showEditVariantModal && editingVariant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Edit Variant: {editingVariant.name}
                </h2>
                <button
                  onClick={() => {
                    setShowEditVariantModal(false);
                    setEditingVariant(null);
                    setVariantEditError("");
                    setVariantEditSuccess("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {variantEditError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400 text-sm">
                    {variantEditError}
                  </span>
                </div>
              )}
              {variantEditSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-green-400 text-sm">
                    {variantEditSuccess}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Color Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={variantEditFormData.color.name}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        color: {
                          ...variantEditFormData.color,
                          name: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={variantEditFormData.quantity}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        quantity: e.target.value,
                      })
                    }
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
                    value={variantEditFormData.pricing.marketPrice}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        pricing: {
                          ...variantEditFormData.pricing,
                          marketPrice: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Selling Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={variantEditFormData.pricing.sellingPrice}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        pricing: {
                          ...variantEditFormData.pricing,
                          sellingPrice: e.target.value,
                        },
                      })
                    }
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
                    value={variantEditFormData.pricing.onSalePrice || ""}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        pricing: {
                          ...variantEditFormData.pricing,
                          onSalePrice: e.target.value || null,
                        },
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Color Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={variantEditFormData.color.code}
                      onChange={(e) =>
                        setVariantEditFormData({
                          ...variantEditFormData,
                          color: {
                            ...variantEditFormData.color,
                            code: e.target.value,
                          },
                        })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                    />
                    <input
                      type="text"
                      value={variantEditFormData.color.code}
                      onChange={(e) =>
                        setVariantEditFormData({
                          ...variantEditFormData,
                          color: {
                            ...variantEditFormData.color,
                            code: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Is Active
                  </label>
                  <select
                    value={variantEditFormData.isActive}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Is Default
                  </label>
                  <select
                    value={variantEditFormData.isDefault}
                    onChange={(e) =>
                      setVariantEditFormData({
                        ...variantEditFormData,
                        isDefault: e.target.value === "true",
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Is On Sale
                </label>
                <select
                  value={variantEditFormData.isOnSale}
                  onChange={(e) =>
                    setVariantEditFormData({
                      ...variantEditFormData,
                      isOnSale: e.target.value === "true",
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Internal Pricing (collapsible) */}
              <details className="group">
                <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-400 transition flex items-center gap-1">
                  <ChevronDown
                    size={12}
                    className="group-open:rotate-180 transition-transform"
                  />
                  Internal Pricing (Cost & Marginal)
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1">
                      Cost Price
                    </label>
                    <input
                      type="number"
                      value={variantEditFormData.pricing.costPrice}
                      onChange={(e) =>
                        setVariantEditFormData({
                          ...variantEditFormData,
                          pricing: {
                            ...variantEditFormData.pricing,
                            costPrice: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1">
                      Marginal Price
                    </label>
                    <input
                      type="number"
                      value={variantEditFormData.pricing.marginalPrice}
                      onChange={(e) =>
                        setVariantEditFormData({
                          ...variantEditFormData,
                          pricing: {
                            ...variantEditFormData.pricing,
                            marginalPrice: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition text-sm"
                    />
                  </div>
                </div>
              </details>
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditVariantModal(false);
                    setEditingVariant(null);
                    setVariantEditError("");
                    setVariantEditSuccess("");
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVariant}
                  disabled={variantEditLoading}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {variantEditLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
