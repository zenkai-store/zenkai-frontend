import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Car,
  ShoppingBag,
  Coffee,
  Home,
  Briefcase,
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Clock,
  User,
} from "lucide-react";

const Expenses = () => {
  // ======================= STATES =======================
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Action states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    category: "other",
    description: "",
    amount: "",
    paymentMethod: "cash",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "other",
    description: "",
    amount: "",
    paymentMethod: "cash",
    expenseDate: "",
  });

  // Delete agreement
  const [deleteAgree, setDeleteAgree] = useState(false);

  // ======================= CATEGORY OPTIONS =======================
  const categories = [
    { value: "all", label: "All Categories", icon: Filter },
    { value: "travel", label: "Travel", icon: Car },
    { value: "stock", label: "Stock", icon: Briefcase },
    { value: "equipment", label: "Equipment", icon: TrendingUp },
    { value: "maintainence", label: "Maintainence", icon: Zap },
    { value: "other", label: "Other", icon: FileText },
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "bank", label: "Bank Transfer" },
    { value: "upi", label: "UPI" },
  ];

  // ======================= FETCH EXPENSES =======================
  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(`/api/admin/expenses`, {
        params: { page, limit: 20 },
      });

      if (response.data.success) {
        setExpenses(response.data.data || []);
        setPagination(
          response.data.pagination || { total: 0, page: 1, pages: 1 },
        );
      } else {
        setError("Failed to fetch expenses");
      }
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setError(err.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage]);

  // ======================= CREATE EXPENSE =======================
  const handleCreateExpense = async () => {
    if (!formData.title.trim() || !formData.amount) {
      setActionError("Title and amount are required.");
      return;
    }

    try {
      setCreating(true);
      setActionError("");
      setActionSuccess("");

      const response = await axiosClient.post(
        `/api/admin/expenses`,
        {
          title: formData.title.trim(),
          category: formData.category,
          description: formData.description.trim(),
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          expenseDate: formData.expenseDate,
        },
      );

      if (response.data.success) {
        setActionSuccess("Expense created successfully!");
        setTimeout(() => {
          setShowCreateModal(false);
          resetForm();
          fetchExpenses(currentPage);
          setActionSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to create expense:", err);
      setActionError(err.response?.data?.message || "Failed to create expense");
    } finally {
      setCreating(false);
    }
  };

  // ======================= UPDATE EXPENSE =======================
  const handleUpdateExpense = async () => {
    if (!editFormData.title.trim() || !editFormData.amount) {
      setActionError("Title and amount are required.");
      return;
    }

    try {
      setUpdating(true);
      setActionError("");
      setActionSuccess("");

      const response = await axiosClient.put(
        `/api/admin/expenses/${selectedExpense._id}`,
        {
          title: editFormData.title.trim(),
          category: editFormData.category,
          description: editFormData.description.trim(),
          amount: parseFloat(editFormData.amount),
          paymentMethod: editFormData.paymentMethod,
          expenseDate: editFormData.expenseDate,
        },
      );

      if (response.data.success) {
        setActionSuccess("Expense updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setSelectedExpense(null);
          fetchExpenses(currentPage);
          setActionSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to update expense:", err);
      setActionError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setUpdating(false);
    }
  };

  // ======================= DELETE EXPENSE ======================= */
  const handleDeleteExpense = async () => {
    if (!deleteAgree) return;

    try {
      setDeleting(true);

      await axiosClient.delete(
        `/api/admin/expenses/${selectedExpense._id}`,
      );

      setShowDeleteModal(false);
      setSelectedExpense(null);
      setDeleteAgree(false);
      fetchExpenses(currentPage);
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setActionError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  };

  // ======================= HELPER FUNCTIONS =======================
  const resetForm = () => {
    setFormData({
      title: "",
      category: "other",
      description: "",
      amount: "",
      paymentMethod: "cash",
      expenseDate: new Date().toISOString().split("T")[0],
    });
    setActionError("");
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setEditFormData({
      title: expense.title || "",
      category: expense.category || "other",
      description: expense.description || "",
      amount: expense.amount?.toString() || "",
      paymentMethod: expense.paymentMethod || "cash",
      expenseDate: expense.expenseDate ? expense.expenseDate.split("T")[0] : "",
    });
    setActionError("");
    setActionSuccess("");
    setShowEditModal(true);
  };

  const openDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setDeleteAgree(false);
    setActionError("");
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    const Icon = category?.icon || FileText;
    return <Icon size={16} />;
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      cash: { color: "green", label: "Cash" },
      card: { color: "blue", label: "Card" },
      bank_transfer: { color: "purple", label: "Bank Transfer" },
      upi: { color: "orange", label: "UPI" },
    };
    return badges[method] || { color: "gray", label: method };
  };

  // ======================= FILTERED EXPENSES =======================
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchQuery === "" ||
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || expense.category === filterCategory;

    const matchesPayment =
      filterPaymentMethod === "all" ||
      expense.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  // ======================= STATS CALCULATION =======================
  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0,
  );
  const avgExpense =
    filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  const categoryBreakdown = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  // ======================= STATS CARDS =======================
  const stats = [
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: DollarSign,
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Total Transactions",
      value: filteredExpenses.length,
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Average Expense",
      value: formatCurrency(avgExpense),
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "This Month",
      value: formatCurrency(
        filteredExpenses
          .filter((e) => {
            const date = new Date(e.expenseDate);
            const now = new Date();
            return (
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
            );
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0),
      ),
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
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

      {/* ======================= CATEGORY BREAKDOWN ======================= */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Tag size={18} className="text-gray-400" />
            Category Breakdown
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryBreakdown).map(([category, amount]) => {
              const cat = categories.find((c) => c.value === category);
              const Icon = cat?.icon || FileText;
              return (
                <div
                  key={category}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <Icon size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    {cat?.label || category}
                  </span>
                  <span className="text-white font-medium">
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              placeholder="Search expenses..."
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
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchExpenses(currentPage)}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} />
          </button>

          {/* Export Button */}
          <button
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Export to CSV"
          >
            <Download size={18} />
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition shadow-lg hover:shadow-red-500/25"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* ======================= EXPENSES TABLE ======================= */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Title
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Category
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Amount
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Payment
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Date
                </th>
                <th className="py-4 px-4 text-left text-gray-400 text-sm font-medium">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">Loading expenses...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                      <p className="text-red-400">{error}</p>
                      <button
                        onClick={() => fetchExpenses(currentPage)}
                        className="mt-3 text-gray-400 hover:text-white text-sm"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400">No expenses found</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Add your first expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const paymentBadge = getPaymentMethodBadge(
                    expense.paymentMethod,
                  );
                  return (
                    <tr
                      key={expense._id}
                      className="border-b border-gray-700/50 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {expense.title}
                          </p>
                          {expense.description && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {getCategoryIcon(expense.category)}
                          </span>
                          <span className="text-gray-300">
                            {categories.find(
                              (c) => c.value === expense.category,
                            )?.label || expense.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${paymentBadge.color}-500/10 text-${paymentBadge.color}-400 border border-${paymentBadge.color}-500/20`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Calendar size={14} />
                          {formatDate(expense.expenseDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-500" />
                          <span className="text-gray-400 text-sm">
                            {expense.createdBy?.email?.split("@")[0] || "Admin"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= PAGINATION ======================= */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-gray-400">
            Page {currentPage} of {pagination.pages}
          </span>

          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ======================= CREATE EXPENSE MODAL ======================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Add New Expense
                </h2>
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

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Office Supplies"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Amount <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expenseDate: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                  >
                    {categories
                      .filter((c) => c.value !== "all")
                      .map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition"
                  >
                    {paymentMethods
                      .filter((m) => m.value !== "all")
                      .map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                  </select>
                </div>
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
                  placeholder="Additional details..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-end gap-3">
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
                  onClick={handleCreateExpense}
                  disabled={creating}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
                >
                  {creating ? "Creating..." : "Add Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
