import React, { useState, useEffect } from "react";
import axios from "axios";
import BASEURL from "../../../config/baseURL";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Layers,
  Tag,
  Hash,
  ListOrdered,
  FileText,
  Calendar,
  Clock,
  GripVertical,
  FolderOpen,
  Box,
  ArrowUp,
  ArrowDown,
  Save,
} from "lucide-react";

const Categories = () => {
  // ======================= STATES =======================
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Action states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Form data for create
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: "",
  });

  // Form data for edit
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    displayOrder: "",
  });

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ======================= FETCH CATEGORIES =======================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${BASEURL}/api/admin/categories`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ======================= CREATE CATEGORY =======================
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      setActionError("Category name is required.");
      return;
    }

    try {
      setCreating(true);
      setActionError("");
      setActionSuccess("");

      const response = await axios.post(
        `${BASEURL}/api/admin/categories`,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          displayOrder: formData.displayOrder
            ? parseInt(formData.displayOrder)
            : categories.length + 1,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        setActionSuccess("Category created successfully!");
        setTimeout(() => {
          setShowCreateModal(false);
          resetForm();
          fetchCategories();
          setActionSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to create category:", err);
      setActionError(
        err.response?.data?.message || "Failed to create category",
      );
    } finally {
      setCreating(false);
    }
  };

  // ======================= UPDATE CATEGORY =======================
  const handleUpdateCategory = async () => {
    if (!editFormData.name.trim()) {
      setActionError("Category name is required.");
      return;
    }

    try {
      setUpdating(true);
      setActionError("");
      setActionSuccess("");

      const response = await axios.put(
        `${BASEURL}/api/admin/categories/${selectedCategory._id}`,
        {
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
          displayOrder: editFormData.displayOrder
            ? parseInt(editFormData.displayOrder)
            : selectedCategory.displayOrder,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        setActionSuccess("Category updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setSelectedCategory(null);
          fetchCategories();
          setActionSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      setActionError(
        err.response?.data?.message || "Failed to update category",
      );
    } finally {
      setUpdating(false);
    }
  };

  // ======================= DELETE CATEGORY =======================
  const handleDeleteCategory = async () => {
    if (deleteConfirmText !== selectedCategory?.name) return;

    try {
      setDeleting(true);
      setActionError("");

      await axios.delete(
        `${BASEURL}/api/admin/categories/${selectedCategory._id}`,
        { withCredentials: true },
      );

      setShowDeleteModal(false);
      setSelectedCategory(null);
      setDeleteConfirmText("");
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setActionError(
        err.response?.data?.message || "Failed to delete category",
      );
      setDeleting(false);
    }
  };

  // ======================= HELPER FUNCTIONS =======================
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      displayOrder: "",
    });
    setActionError("");
    setActionSuccess("");
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name || "",
      description: category.description || "",
      displayOrder: category.displayOrder?.toString() || "",
    });
    setActionError("");
    setActionSuccess("");
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteConfirmText("");
    setActionError("");
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategorySlug = (slug) => {
    if (!slug) return "—";
    return slug.length > 30 ? slug.substring(0, 30) + "..." : slug;
  };

  // ======================= FILTERED CATEGORIES =======================
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.slug?.toLowerCase().includes(query)
    );
  });

  // ======================= STATS =======================
  const stats = [
    {
      title: "Total Categories",
      value: categories.length,
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Categories",
      value: categories.filter((c) => c.isActive !== false).length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "With Description",
      value: categories.filter((c) => c.description).length,
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Max Display Order",
      value:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.displayOrder || 0))
          : 0,
      icon: ListOrdered,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

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
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name, slug, or description..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-gray-500 text-xs mt-2 ml-1">
              Found {filteredCategories.length} categor
              {filteredCategories.length !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchCategories}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Refresh categories"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Add Category Button */}
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition shadow-lg hover:shadow-red-500/25"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* ======================= CATEGORIES GRID ======================= */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading categories...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-medium"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-12 text-center">
          {searchQuery ? (
            <>
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No Results Found
              </h3>
              <p className="text-gray-400 mb-4">
                No categories match "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-red-400 hover:text-red-300 font-medium transition"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No Categories Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first category to organize your products
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition font-medium shadow-lg"
              >
                <Plus size={18} />
                Create Category
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-red-500/10 rounded-xl flex-shrink-0">
                      <Tag size={20} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {category.name}
                      </h3>
                      <p className="text-gray-500 text-xs font-mono mt-0.5 truncate">
                        {getCategorySlug(category.slug)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {category.description ? (
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                    {category.description}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm italic mb-3">
                    No description provided
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered size={13} />
                    Order: {category.displayOrder || "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatDate(category.createdAt)}
                  </span>
                </div>
              </div>

              {/* Card Footer with Actions */}
              <div className="px-5 py-3 border-t border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition"
                    title="Edit Category"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(category)}
                    className="p-2 bg-gray-700 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================= CATEGORY COUNT ======================= */}
      {!loading && filteredCategories.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Showing {filteredCategories.length} of {categories.length} categor
          {categories.length !== 1 ? "ies" : "y"}
        </div>
      )}

      {/* ======================= CREATE CATEGORY MODAL ======================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag size={20} className="text-red-400" />
                    Create New Category
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Organize your products with a new category
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
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

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Diecast"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: e.target.value })
                  }
                  placeholder={categories.length + 1}
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Lower numbers appear first. Leave empty for auto-assign.
                </p>
              </div>

              {/* Slug Preview */}
              {formData.name.trim() && (
                <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-gray-500 text-xs mb-1">Slug Preview</p>
                  <p className="text-gray-300 font-mono text-sm">
                    {formData.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  <span className="text-red-400">*</span> Required field
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    disabled={creating || !formData.name.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                  >
                    {creating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      "Create Category"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT CATEGORY MODAL ======================= */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit size={20} className="text-yellow-400" />
                    Edit Category
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Update "{selectedCategory.name}"
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                    setActionError("");
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
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

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editFormData.displayOrder}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      displayOrder: e.target.value,
                    })
                  }
                  placeholder={selectedCategory.displayOrder?.toString()}
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              {/* Current Slug (Read-only) */}
              <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-gray-500 text-xs mb-1">Slug</p>
                <p className="text-gray-400 font-mono text-sm">
                  {selectedCategory.slug}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                    setActionError("");
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={updating || !editFormData.name.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {updating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MODAL ======================= */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Delete Category
              </h2>
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete "
                <span className="text-white font-medium">
                  {selectedCategory.name}
                </span>
                "?
              </p>
              <p className="text-red-400/70 text-sm mb-6">
                This action cannot be undone. Products in this category will not
                be deleted but will lose this category association.
              </p>

              <div className="text-left">
                <label className="block text-gray-400 text-sm mb-2">
                  Type{" "}
                  <span className="text-white font-bold">
                    {selectedCategory.name}
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={selectedCategory.name}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition text-center font-medium"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                    setDeleteConfirmText("");
                    setActionError("");
                  }}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={
                    deleting || deleteConfirmText !== selectedCategory.name
                  }
                  className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-red-500/25"
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Category"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
