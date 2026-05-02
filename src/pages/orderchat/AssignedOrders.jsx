import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { io } from "socket.io-client";
import {
  ReceiptIndianRupee,
  Users,
  User,
  Package,
  MessageSquare,
  Search,
  Filter,
  Paperclip,
  Send,
  ShoppingCart,
  ShoppingBag,
  Calendar,
  IndianRupee,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Loader2,
  Tag,
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Info,
  Settings,
  TicketPercent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../../api/api";
import AddItemsModal from "../../components/Modals/AddItemsModal";
import ManageItemsModal from "../../components/Modals/ManageItemsModal";
import ApplyDiscountModal from "../../components/Modals/ApplyDiscount";

let globalSocket = null;

const AssignedOrders = () => {
  const token =
    localStorage.getItem("mm_admin_token") ||
    localStorage.getItem("mm_staff_token");

  // States for templates list
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTemplateBoxExpanded, setIsTemplateBoxExpanded] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showApplyDiscountModal, setShowApplyDiscountModal] = useState(false);

  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingItems, setAddingItems] = useState({});
  const [notes, setNotes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [showManageItemsModal, setShowManageItemsModal] = useState(false);
  const [updatingQuantities, setUpdatingQuantities] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});

  const [socketStatus, setSocketStatus] = useState("disconnected");

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const chatContainerRef = useRef(null);
  const isUserNearBottomRef = useRef(true);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const isSocketAuthenticatedRef = useRef(false);
  const currentTemplateIdRef = useRef(null);

  // Replace the WebSocket useEffect with this:
  useEffect(() => {
    if (!token) return;

    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setSocketStatus("connected");
      return;
    }

    console.log("🚀 Creating WebSocket connection...");

    const socket = io("wss://modern-mahal-api.onrender.com", {
      transports: ["websocket"], // WebSocket ONLY - no polling
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
    });

    globalSocket = socket;
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "✅ WebSocket connected! Transport:",
        socket.io.engine.transport.name,
      );
      setSocketStatus("connected");

      if (currentTemplateIdRef.current) {
        socket.emit("join-template", currentTemplateIdRef.current);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Connection failed:", error.message);
      // If WebSocket fails, show error - don't fall back to polling
      setSocketStatus("websocket_failed");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected:", reason);
      setSocketStatus("disconnected");

      // If server closed connection, clear socket
      if (reason === "io server disconnect") {
        globalSocket = null;
        socketRef.current = null;
      }
    });

    socket.on("join-template-success", (payload) => {
      console.log("✅ Joined room:", payload);
      setSocketStatus("authenticated");
      isSocketAuthenticatedRef.current = true;
    });

    socket.on("new-message", (payload) => {
      console.log("💬 NEW MESSAGE RECEIVED:", payload);

      const messageData = payload.message || payload;
      const templateId = payload.template_id || messageData.template_id;

      console.log("Template ID from message:", templateId); // Add this log
      console.log("Current template ID:", currentTemplateIdRef.current);

      if (templateId === currentTemplateIdRef.current) {
        setChatMessages((prev) => {
          if (prev.some((msg) => msg.id === messageData.id)) return prev;
          return [...prev, messageData].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at),
          );
        });
      }
    });

    // NO CLEANUP - Let socket persist across Strict Mode
  }, [token]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 120; // px from bottom
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      isUserNearBottomRef.current = distanceFromBottom < threshold;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Decode JWT token to get user info
  const getCurrentUserInfo = () => {
    try {
      const token =
        localStorage.getItem("mm_admin_token") ||
        localStorage.getItem("mm_staff_token");
      if (!token) return null;

      const decoded = jwtDecode(token);
      return {
        id: decoded.userId || decoded.id || decoded.sub,
        role:
          decoded.role ||
          (localStorage.getItem("mm_admin_token") ? "ADMIN" : "STAFF"),
        name: decoded.name || decoded.email || "User",
      };
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  // Fetch assigned templates
  const fetchAssignedTemplates = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/api/order-templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const templateData = response.data.templates || [];
      setTemplates(templateData);

      // Select first template by default if none selected
      if (templateData.length > 0 && !selectedTemplate) {
        handleSelectTemplate(templateData[0]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load assigned templates. Please try again.",
      );
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch template details and chats
  const fetchTemplateDetails = async (templateId) => {
    try {
      setTemplateLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/order-templates/${templateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const details = response.data.template;
      setTemplateDetails(details);
      setChatMessages(details.chats || []);

      const scrollToBottomIfNeeded = () => {
        const container = chatContainerRef.current;
        if (!container) return;

        if (isUserNearBottomRef.current) {
          // Small delay to ensure DOM is updated
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 100);
        }
      };

      setChatMessages(details.chats || []);

      setTimeout(() => {
        scrollToBottomIfNeeded();
      }, 0);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load template details.",
      );
      console.error("Error fetching template details:", err);
    } finally {
      setTemplateLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTemplates();
  }, []);

  // Search products
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/products/search?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setSearchResults(response.data.products || []);
    } catch (err) {
      console.error("Error searching products:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId, variantId, increment) => {
    const key = `${productId}-${variantId}`;
    setQuantities((prev) => {
      const current = prev[key] || 0;
      const newQuantity = increment ? current + 1 : Math.max(0, current - 1);
      return { ...prev, [key]: newQuantity };
    });
  };

  // Handle note change
  const handleNoteChange = (productId, variantId, note) => {
    const key = `${productId}-${variantId}`;
    setNotes((prev) => ({ ...prev, [key]: note }));
  };

  // Add item to template
  const handleAddItem = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    const quantity = quantities[key] || 0;
    const note = notes[key] || "";

    if (quantity === 0) {
      alert("Please set quantity greater than 0");
      return;
    }

    if (!templateDetails) return;

    try {
      setAddingItems((prev) => ({ ...prev, [key]: true }));

      await axios.post(
        `${BASE_URL}/api/order-templates/${templateDetails.id}/items`,
        {
          product_id: productId,
          variant_id: variantId,
          quantity: quantity,
          notes: note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Reset this item's state
      setQuantities((prev) => ({ ...prev, [key]: 0 }));
      setNotes((prev) => ({ ...prev, [key]: "" }));

      // Refresh template details
      fetchTemplateDetails(templateDetails.id);

      // Show success message
      setSuccessMessage("Item added successfully!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error adding item:", err);
      alert(
        err?.response?.data?.message || "Failed to add item. Please try again.",
      );
    } finally {
      setAddingItems((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Reset modal state
  const resetModalState = () => {
    setSearchTerm("");
    setSearchResults([]);
    setQuantities({});
    setNotes({});
    setAddingItems({});
  };

  // Close modal and refresh
  const handleCloseModal = () => {
    resetModalState();
    setShowAddItemsModal(false);
    // Refresh template details
    if (templateDetails) {
      fetchTemplateDetails(templateDetails.id);
    }
  };

  // Refresh template details after discount applied
  const handleDiscountApplied = () => {
    if (selectedTemplate) {
      fetchTemplateDetails(selectedTemplate.id);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    try {
      setUpdatingQuantities((prev) => ({ ...prev, [itemId]: true }));

      await axios.put(
        `${BASE_URL}/api/order-templates/items/${itemId}/quantity`,
        {
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Refresh template details
      if (templateDetails) {
        fetchTemplateDetails(templateDetails.id);
      }

      setSuccessMessage("Quantity updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update quantity. Please try again.",
      );
    } finally {
      setUpdatingQuantities((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from template
  const handleRemoveItem = async (itemId, notes = "") => {
    try {
      setRemovingItems((prev) => ({ ...prev, [itemId]: true }));

      await axios.delete(`${BASE_URL}/api/order-templates/items/${itemId}`, {
        data: { notes },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchTemplateDetails(templateDetails.id);

      setSuccessMessage("Item removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Update item status
  const handleUpdateStatus = async (itemId, newStatus, notes = "") => {
    const item = templateDetails?.items?.find((item) => item.id === itemId);
    if (!item) return;

    // Check if status can be changed
    const blockedStatuses = ["IN_CART", "DELIVERED", "DELIVERING"];
    if (blockedStatuses.includes(item.status)) {
      alert(
        `Cannot change status for items that are ${item.status}. The template is already in action.`,
      );
      return;
    }

    // Ask for notes if changing to CANCELLED
    if (newStatus === "CANCELLED" && !notes) {
      notes = prompt("Please provide a reason for cancellation:");
      if (notes === null) return; // User cancelled
    }

    try {
      setUpdatingStatus((prev) => ({ ...prev, [itemId]: true }));

      await axios.patch(
        `${BASE_URL}/api/order-templates/items/${itemId}/status`,
        {
          status: newStatus,
          notes: notes || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Refresh template details
      if (templateDetails) {
        fetchTemplateDetails(templateDetails.id);
      }

      setSuccessMessage(`Status updated to ${newStatus} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update status. Please try again.",
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Check if status can be changed
  const canChangeStatus = (status) => {
    const blockedStatuses = ["IN_CART", "DELIVERED", "DELIVERING"];
    return !blockedStatuses.includes(status);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format relative time (e.g., "1m ago")
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateString);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          color: "bg-amber-100 text-amber-700",
          label: "Draft",
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-700",
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-700",
          label: "In Progress",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-700",
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          label: status,
        };
    }
  };

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount || 0));
  };

  // Handle template selection
  const handleSelectTemplate = (template) => {
    console.log("📋 Selecting template:", template.id);
    setSelectedTemplate(template);
    setCurrentImageIndex(0);
    isUserNearBottomRef.current = true;
    currentTemplateIdRef.current = template.id;

    fetchTemplateDetails(template.id);

    // Use Socket.IO's connected property, not WebSocket readyState
    const socket = globalSocket || socketRef.current;
    if (socket?.connected) {
      console.log("🚀 Joining template room:", template.id);
      socket.emit("join-template", template.id);
    } else {
      console.log("⏳ Socket not ready, will auto-join on connect");
    }
  };

  // Add this useEffect to auto-join when socket connects after template selection
  useEffect(() => {
    if (
      socketStatus === "connected" &&
      currentTemplateIdRef.current &&
      globalSocket?.connected
    ) {
      console.log(
        "🔄 Auto-joining template after socket connected:",
        currentTemplateIdRef.current,
      );
      globalSocket.emit("join-template", currentTemplateIdRef.current);
    }
  }, [socketStatus]);

  // Filter templates based on search
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.title.toLowerCase().includes(query) ||
      template.user_name.toLowerCase().includes(query) ||
      template.user_email.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query)
    );
  });

  // Handle send message (websocket)
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTemplate) return;

    const currentUser = getCurrentUserInfo();
    if (!currentUser) return;

    const messageText = newMessage.trim();

    const tempMessage = {
      id: `temp_${Date.now()}`,
      template_id: selectedTemplate.id,
      message: messageText,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    // Use Socket.IO emit
    const socket = globalSocket || socketRef.current;
    if (socket?.connected) {
      const payload = {
        template_id: selectedTemplate.id,
        message: messageText,
      };
      socket.emit("send-message", payload);
      console.log("📤 Sent message via Socket.IO:", payload);
    } else {
      console.log("⚠️ Socket not connected, using API fallback");
      sendMessageViaAPI(messageText, tempMessage.id);
    }
  };

  // Update the API fallback function
  const sendMessageViaAPI = async (message, tempId) => {
    if (!selectedTemplate) return;

    console.log("📨 Using API fallback for message sending");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/order-templates/${selectedTemplate.id}/chats`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.chat) {
        // Replace temporary message with server response
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? response.data.chat : msg)),
        );
        console.log("✅ Message sent via API");
      }
    } catch (err) {
      console.error("❌ Failed to send message via API:", err);

      // Remove the optimistic message
      setChatMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      alert("Failed to send message. Please check your connection.");
    }
  };

  // Handle file attachment
  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // This will be implemented with WebSocket later
      console.log("Selected file:", file);
    }
  };

  // Navigate item images
  const handleNextImage = () => {
    if (templateDetails?.items && templateDetails.items.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === templateDetails.items.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const handlePrevImage = () => {
    if (templateDetails?.items && templateDetails.items.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? templateDetails.items.length - 1 : prev - 1,
      );
    }
  };

  // Check if current user is the sender
  const isCurrentUserSender = (senderId) => {
    const currentUser = getCurrentUserInfo();
    return currentUser?.id === senderId;
  };

  // Group messages by date with proper ordering
  const groupMessagesByDate = () => {
    const grouped = {};
    // Sort messages by date (oldest first)
    const sortedMessages = [...chatMessages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );

    sortedMessages.forEach((message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });

    // Sort dates (oldest first)
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b),
    );

    const result = {};
    sortedDates.forEach((date) => {
      result[date] = grouped[date];
    });

    return result;
  };

  const messagesByDate = groupMessagesByDate();

  // Price Breakdown Modal Component
  const PriceBreakdownModal = () => {
    if (!templateDetails || !showPriceModal) return null;

    const items = templateDetails.items || [];
    const discounts = templateDetails.discounts || [];

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const itemTotal =
        parseFloat(item.original_unit_price || item.unit_price_snapshot) *
        item.quantity;
      return sum + itemTotal;
    }, 0);

    const totalDiscount =
      parseFloat(templateDetails.total_discount_amount) || 0;
    const totalCost = subtotal - totalDiscount;

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
                <h2 className="text-2xl font-bold text-gray-900">
                  Price Breakdown
                </h2>
                <p className="text-gray-600 mt-1">
                  Template: {templateDetails.title || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setShowPriceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Sub Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Colour
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Finish
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Unit Price
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Discount %
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Discount Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      After Discount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemTotal =
                      parseFloat(
                        item.unit_price_snapshot || item.original_unit_price,
                      ) * item.quantity;
                    const originalTotal = parseFloat(
                      item.original_total_price ||
                        item.original_unit_price * item.quantity,
                    );
                    const discountedTotal = parseFloat(
                      item.discounted_total_price || originalTotal,
                    );
                    const discountAmount = originalTotal - discountedTotal;
                    const discountPercentage = item.discount_percentage || 0;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.brand_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {item.sub_code || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {item.colour_name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {item.finish_name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatCurrency(item.unit_price_snapshot)}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatCurrency(itemTotal)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {discountPercentage > 0
                            ? `${discountPercentage}%`
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-red-600 font-medium">
                          {discountAmount > 0
                            ? `-${formatCurrency(discountAmount)}`
                            : "-"}
                        </td>
                        <td className="py-3 px-4 font-medium text-emerald-600">
                          {formatCurrency(discountedTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Add discounts summary section */}
              {discounts.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Applied Discounts
                  </h4>
                  <div className="space-y-2">
                    {discounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-700">
                              {discount.value}
                              {discount.discount_mode === "PERCENTAGE"
                                ? "%"
                                : " ₹"}
                            </span>
                            <span className="text-sm text-gray-600">
                              • {discount.discount_mode}
                            </span>
                          </div>
                          {discount.segments?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {discount.segments.map((seg) => (
                                <span
                                  key={seg.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700"
                                >
                                  {seg.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Expires</p>
                          <p className="text-sm font-medium">
                            {new Date(discount.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(totalDiscount)}
                  </span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Cost:</span>
                  <span className="text-emerald-600">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Template Status:{" "}
                    <span className="font-medium text-gray-900">
                      {templateDetails.status}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Items Count:{" "}
                    <span className="font-medium text-gray-900">
                      {items.length}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Created:{" "}
                    <span className="font-medium text-gray-900">
                      {formatDate(templateDetails.created_at)}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Last Updated:{" "}
                    <span className="font-medium text-gray-900">
                      {formatDate(templateDetails.updated_at)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Check Items Modal Component
  const CheckItemsModal = () => {
    if (!templateDetails || !showItemsModal) return null;

    const items = templateDetails.items || [];

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
                <h2 className="text-2xl font-bold text-gray-900">
                  Check Items
                </h2>
                <p className="text-gray-600 mt-1">
                  {items.length} items in template: {templateDetails.title}
                </p>
              </div>
              <button
                onClick={() => setShowItemsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600">
                  No items found
                </p>
                <p className="text-gray-500 mt-2">
                  This template doesn't contain any items yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Item Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Item #{index + 1} • Status:{" "}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(item.status).color}`}
                              >
                                {item.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(
                              parseFloat(item.unit_price_snapshot) *
                                item.quantity,
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} ×{" "}
                            {formatCurrency(item.unit_price_snapshot)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Item Details Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Image and Basic Info */}
                        <div className="space-y-4">
                          {/* Product Image */}
                          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <Package className="w-16 h-16 mb-2" />
                                <p className="text-sm">No image available</p>
                              </div>
                            )}
                          </div>

                          {/* Basic Info */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              Basic Information
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-600">Brand</p>
                                <p className="font-medium">{item.brand_name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Product Code
                                </p>
                                <p className="font-medium">
                                  {item.product_code}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Sub Code
                                </p>
                                <p className="font-medium">{item.sub_code}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Quantity
                                </p>
                                <p className="font-medium">{item.quantity}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle Column: Product Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Product Details
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600">
                                Product Name
                              </p>
                              <p className="font-medium">{item.product_name}</p>
                            </div>
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
                                Current MRP
                              </p>
                              <p className="font-medium text-emerald-600">
                                {formatCurrency(item.current_mrp)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Unit Price (Snapshot)
                              </p>
                              <p className="font-medium">
                                {formatCurrency(item.unit_price_snapshot)}
                              </p>
                            </div>
                          </div>

                          {/* Pricing Details */}
                          <div className="bg-gray-50 rounded-lg p-3 mt-4">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Pricing Summary
                            </h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  Unit Price:
                                </span>
                                <span>
                                  {formatCurrency(item.unit_price_snapshot)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Quantity:</span>
                                <span>{item.quantity}</span>
                              </div>
                              <div className="h-px bg-gray-200 my-1"></div>
                              <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-emerald-600">
                                  {formatCurrency(
                                    parseFloat(item.unit_price_snapshot) *
                                      item.quantity,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: IDs and Metadata */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Identifiers & Metadata
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600">Item ID</p>
                              <p className="font-mono text-sm truncate">
                                {item.id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Product ID
                              </p>
                              <p className="font-mono text-sm truncate">
                                {item.product_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Variant ID
                              </p>
                              <p className="font-mono text-sm truncate">
                                {item.variant_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Template ID
                              </p>
                              <p className="font-mono text-sm truncate">
                                {item.template_id}
                              </p>
                            </div>
                          </div>

                          {/* Status Information */}
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-900">
                              Status Information
                            </h5>
                            <div>
                              <p className="text-xs text-gray-600">Status</p>
                              <p className="font-medium">{item.status}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Last Status Date
                              </p>
                              <p className="font-medium">
                                {formatDate(item.last_status_date)} at{" "}
                                {formatTime(item.last_status_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Added By</p>
                              <p className="font-medium">{item.added_by}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Added At</p>
                              <p className="font-medium">
                                {formatDate(item.added_at)} at{" "}
                                {formatTime(item.added_at)}
                              </p>
                            </div>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <h5 className="font-semibold text-amber-900 mb-1">
                                Notes
                              </h5>
                              <p className="text-sm text-amber-800">
                                {item.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Summary Footer */}
            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {items.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(
                        items.reduce(
                          (sum, item) =>
                            sum +
                            parseFloat(item.unit_price_snapshot) *
                              item.quantity,
                          0,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowItemsModal(false)}
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

  // Information Modal Component
  const InformationModal = () => {
    if (!templateDetails || !showInfoModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Template Information
                </h2>
                <p className="text-gray-600 mt-1">
                  Complete details of this template
                </p>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Template Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Template Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Template ID</p>
                    <p className="font-medium text-gray-900">
                      {templateDetails.id}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium text-gray-900">
                      {templateDetails.title}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-gray-900">
                      {templateDetails.description || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(templateDetails.status).color}`}
                    >
                      {templateDetails.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(templateDetails.total_cost)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-medium text-gray-900">
                      {templateDetails.created_by}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(templateDetails.created_at)} at{" "}
                        {formatTime(templateDetails.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(templateDetails.updated_at)} at{" "}
                        {formatTime(templateDetails.updated_at)}
                      </p>
                    </div>
                  </div>
                  {templateDetails.finalized_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Finalized</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(templateDetails.finalized_at)} at{" "}
                          {formatTime(templateDetails.finalized_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User & Staff Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {templateDetails.user_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {templateDetails.user_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {templateDetails.user_phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {templateDetails.user_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Staff Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Staff Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Staff Name</p>
                      <p className="font-medium text-gray-900">
                        {templateDetails.staff_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Staff Email</p>
                      <p className="font-medium text-gray-900">
                        {templateDetails.staff_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Staff ID</p>
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {templateDetails.staff_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Items Summary
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {templateDetails.items?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Status Distribution
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {["CANCELLED", "DELIVERING", "PENDING"].map(
                          (status) => {
                            const count =
                              templateDetails.items?.filter(
                                (item) => item.status === status,
                              ).length || 0;
                            if (count === 0) return null;
                            return (
                              <span
                                key={status}
                                className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(status).color}`}
                              >
                                {count} {status}
                              </span>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden overscroll-none">
      {/* Top Notifications (non-scrollable) */}
      <div className="flex-shrink-0 px-2">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 mb-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 mb-2"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </div>

      {/* Main Content - Full Height Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 h-[calc(100vh-50px)] overflow-hidden">
        {/* Left Column - Assigned Templates List */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            {/* Search and Filter Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Assigned Chats ({templates.length})
                </h2>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search in dashboard..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Templates List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-lg">Loading assigned chats...</p>
                </div>
              ) : error ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500 p-6">
                  <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                  <p className="text-red-600 text-lg mb-2">
                    Failed to load chats
                  </p>
                  <p className="text-gray-600 mb-6 text-center">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchAssignedTemplates}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500 p-6">
                  <MessageSquare className="w-20 h-20 text-gray-300 mb-6" />
                  <p className="text-xl text-gray-600 mb-2">
                    No assigned chats
                  </p>
                  <p className="text-gray-500 mb-6 text-center">
                    You don't have any assigned order-chat templates yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredTemplates.map((template) => {
                    const statusInfo = getStatusInfo(template.status);
                    const isSelected = selectedTemplate?.id === template.id;

                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleSelectTemplate(template)}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-l-4 border-emerald-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <User className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {template.user_name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(template.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {template.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {template.item_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {template.chat_count}
                                </span>
                              </div>
                            </div>
                            {template.unread_messages > 0 && (
                              <div className="mt-2 text-xs font-medium text-emerald-600">
                                {template.unread_messages} unread message
                                {template.unread_messages > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            {!selectedTemplate ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
                <MessageSquare className="w-20 h-20 text-gray-300 mb-6" />
                <p className="text-xl text-gray-600 mb-2">Select a chat</p>
                <p className="text-gray-500 text-center max-w-md">
                  Choose an assigned order-chat template from the list to start
                  messaging with the customer
                </p>
              </div>
            ) : (
              <>
                {/* User Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {selectedTemplate.user_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">
                          ID: {selectedTemplate.user_id?.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  {/*To be REMOVED*/}
                  {/* Add this to your JSX */}
                  <button
                    onClick={() => {
                      console.log("🔍 WebSocket Debug Info:", {
                        socket: socketRef.current,
                        readyState: socketRef.current?.readyState,
                        readyStateText:
                          socketRef.current?.readyState === 0
                            ? "CONNECTING"
                            : socketRef.current?.readyState === 1
                              ? "OPEN"
                              : socketRef.current?.readyState === 2
                                ? "CLOSING"
                                : socketRef.current?.readyState === 3
                                  ? "CLOSED"
                                  : "UNKNOWN",
                        isAuthenticated: isSocketAuthenticatedRef.current,
                        currentTemplate: selectedTemplate?.id,
                        messagesCount: chatMessages.length,
                        socketStatus: socketStatus,
                      });

                      // Test sending a message
                      if (
                        socketRef.current?.readyState === WebSocket.OPEN &&
                        isSocketAuthenticatedRef.current &&
                        selectedTemplate?.id
                      ) {
                        const testPayload = {
                          template_id: selectedTemplate.id,
                          message: "Test message from debug",
                        };
                        console.log("📤 Sending test message:", testPayload);
                        socketRef.current.send(
                          `42["send-message",${JSON.stringify(testPayload)}]`,
                        );
                      }
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    title="Debug WebSocket"
                  >
                    Debug WS
                  </button>
                  {/*LAST LINE*/}
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Template Details Red Box */}
                {templateDetails && (
                  <div className="relative border-b border-gray-200 flex-shrink-0 px-4 pt-4">
                    {/* Collapse Toggle Button - Always Visible */}
                    <div className="rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          setIsTemplateBoxExpanded(!isTemplateBoxExpanded)
                        }
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            {isTemplateBoxExpanded ? (
                              <ChevronUp className="w-4 h-4 text-white" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-sm">
                              {selectedTemplate.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/90">
                                Template: {templateDetails.id.substring(0, 8)}
                                ...
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(templateDetails.status).color}`}
                              >
                                {getStatusInfo(templateDetails.status).label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            {formatCurrency(templateDetails.total_cost)}
                          </span>
                          <span className="text-xs text-white/80">
                            • {templateDetails.items?.length || 0} items
                          </span>
                        </div>
                      </button>

                      {/* Collapsible Content */}
                      <AnimatePresence>
                        {isTemplateBoxExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                              {/* Top Section: Images and Active Order Badge */}
                              <div className="flex items-start justify-between mb-4">
                                {/* Product Images */}
                                <div className="flex gap-2">
                                  {templateDetails.items &&
                                    templateDetails.items
                                      .slice(0, 3)
                                      .map((item, index) => (
                                        <div
                                          key={item.id}
                                          className="w-12 h-12 bg-white rounded-md overflow-hidden flex items-center justify-center border-2 border-white"
                                        >
                                          {item.product_image ? (
                                            <img
                                              src={item.product_image}
                                              alt={item.product_name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="text-gray-400 text-xs text-center p-1">
                                              No image
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  {templateDetails.items &&
                                    templateDetails.items.length > 3 && (
                                      <div className="w-12 h-12 bg-white/20 rounded-md flex items-center justify-center border-2 border-white/30">
                                        <span className="text-xs font-bold text-white">
                                          +{templateDetails.items.length - 3}
                                        </span>
                                      </div>
                                    )}
                                </div>

                                {/* Active Order Badge */}
                                <div className="bg-red-100 px-3 py-1 rounded-full">
                                  <span className="text-red-600 text-xs font-medium">
                                    Active Order
                                  </span>
                                </div>
                              </div>

                              {/* Template Details Grid - Compact Version */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                {/* Template ID */}
                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Template ID
                                  </p>
                                  <p className="text-xs font-medium truncate">
                                    {templateDetails.id.substring(0, 10)}...
                                  </p>
                                </div>

                                {/* Created By */}
                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Created By
                                  </p>
                                  <p className="text-xs font-medium">
                                    {templateDetails.created_by}
                                  </p>
                                </div>

                                {/* Customer */}
                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Customer
                                  </p>
                                  <p className="text-xs font-medium truncate">
                                    {templateDetails.user_name}
                                  </p>
                                </div>

                                {/* Staff */}
                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Assigned Staff
                                  </p>
                                  <p className="text-xs font-medium truncate">
                                    {templateDetails.staff_name}
                                  </p>
                                </div>
                              </div>

                              {/* Dates Row */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Created
                                  </p>
                                  <p className="text-xs font-medium">
                                    {formatDate(templateDetails.created_at)}
                                  </p>
                                </div>

                                <div className="bg-white/10 p-2 rounded-lg">
                                  <p className="text-xs text-white/80 mb-1">
                                    Last Updated
                                  </p>
                                  <p className="text-xs font-medium">
                                    {formatDate(templateDetails.updated_at)}
                                  </p>
                                </div>

                                {templateDetails.finalized_at && (
                                  <div className="bg-white/10 p-2 rounded-lg">
                                    <p className="text-xs text-white/80 mb-1">
                                      Finalized
                                    </p>
                                    <p className="text-xs font-medium">
                                      {formatDate(templateDetails.finalized_at)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="h-px bg-red-400 mb-3"></div>

                              {/* Bottom Controls */}
                              <div className="flex items-center justify-between">
                                {/* Left side: Check Items Button and Image Navigation */}
                                <div className="flex items-center gap-2">
                                  {/* Check Items Button */}
                                  <button
                                    onClick={() => setShowItemsModal(true)}
                                    className="bg-white text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex items-center gap-2 shadow-lg"
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                    Check Items
                                  </button>

                                  {/* Add Items Button */}
                                  <button
                                    onClick={() => setShowAddItemsModal(true)}
                                    className="bg-white text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex items-center gap-2 shadow-lg"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add Items
                                  </button>

                                  {/* Manage Items Button */}
                                  <button
                                    onClick={() =>
                                      setShowManageItemsModal(true)
                                    }
                                    className="bg-white text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex items-center gap-2 shadow-lg"
                                  >
                                    <Settings className="w-4 h-4" />
                                    Manage Items
                                  </button>

                                  {/* Apply Discount Button */}
                                  <button
                                    onClick={() =>
                                      setShowApplyDiscountModal(true)
                                    }
                                    className="bg-white text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex items-center gap-2 shadow-lg"
                                  >
                                    <TicketPercent className="w-4 h-4" />
                                    Apply Discount
                                  </button>
                                </div>

                                {/* Right side: Action Buttons */}
                                <div className="flex items-center gap-2">
                                  {/* Rupee Button (Price Breakdown) */}
                                  <button
                                    onClick={() => setShowPriceModal(true)}
                                    className="p-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                                    title="Price Breakdown"
                                  >
                                    <IndianRupee className="w-4 h-4" />
                                  </button>

                                  {/* Invoice Button */}
                                  <button
                                    className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                                    title="Generate Invoice"
                                  >
                                    <ReceiptIndianRupee className="w-4 h-4" />
                                  </button>

                                  {/* Information Button */}
                                  <button
                                    onClick={() => setShowInfoModal(true)}
                                    className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                    title="More Information"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Chat Messages Area - Scrollable */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
                >
                  {templateLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-600">
                        No messages yet
                      </p>
                      <p className="text-gray-500 text-center max-w-md mt-2">
                        Start the conversation by sending your first message to{" "}
                        {selectedTemplate.user_name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(messagesByDate).map(
                        ([date, messages]) => (
                          <div key={date} className="space-y-4">
                            {/* Date Separator */}
                            <div className="flex justify-center">
                              <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700">
                                {date === new Date().toLocaleDateString()
                                  ? "Today"
                                  : date}
                              </div>
                            </div>

                            {/* Messages for this date */}
                            <div className="space-y-3">
                              {messages.map((chat) => {
                                const isCurrentUser = isCurrentUserSender(
                                  chat.sender_id,
                                );
                                const isStaffOrAdmin =
                                  chat.sender_role === "STAFF" ||
                                  chat.sender_role === "ADMIN";

                                // Staff/Admin messages on right, User messages on left
                                const messageAlignment = isStaffOrAdmin
                                  ? "right"
                                  : "left";

                                return (
                                  <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${messageAlignment === "right" ? "justify-end" : "justify-start"}`}
                                  >
                                    <div className="max-w-[75%]">
                                      <div
                                        className={`p-3 rounded-2xl ${
                                          messageAlignment === "right"
                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-none"
                                            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-bl-none"
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap text-sm">
                                          {chat.message}
                                        </p>
                                      </div>
                                      <div
                                        className={`mt-1 flex items-center gap-2 text-xs ${
                                          messageAlignment === "right"
                                            ? "justify-end text-gray-500"
                                            : "justify-start text-gray-500"
                                        }`}
                                      >
                                        <span>
                                          {formatTime(chat.created_at)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {chat.sender_name} ({chat.sender_role}
                                          )
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  {/* Scroll to bottom button */}
                  {showScrollToBottom && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        const container = chatContainerRef.current;
                        if (container) {
                          container.scrollTop = container.scrollHeight;
                        }
                      }}
                      className="fixed bottom-32 right-8 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-10"
                      title="Scroll to bottom"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                {/* Message Input Area */}
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      onClick={handleFileAttachment}
                      className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-xl font-medium transition-colors ${
                        newMessage.trim()
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <PriceBreakdownModal />
      <InformationModal />
      <CheckItemsModal />
      <ManageItemsModal
        show={showManageItemsModal}
        onClose={() => setShowManageItemsModal(false)}
        templateDetails={templateDetails}
        updatingQuantities={updatingQuantities}
        removingItems={removingItems}
        updatingStatus={updatingStatus}
        canChangeStatus={canChangeStatus}
        getStatusInfo={getStatusInfo}
        formatCurrency={formatCurrency}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        handleUpdateStatus={handleUpdateStatus}
      />

      <AddItemsModal
        templateDetails={templateDetails}
        showAddItemsModal={showAddItemsModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchKeyPress={handleSearchKeyPress}
        handleSearch={handleSearch}
        searchLoading={searchLoading}
        searchResults={searchResults}
        quantities={quantities}
        notes={notes}
        addingItems={addingItems}
        handleQuantityChange={handleQuantityChange}
        handleNoteChange={handleNoteChange}
        handleAddItem={handleAddItem}
        resetModalState={resetModalState}
        handleCloseModal={handleCloseModal}
        formatCurrency={formatCurrency}
      />

      <ApplyDiscountModal
        show={showApplyDiscountModal}
        onClose={() => setShowApplyDiscountModal(false)}
        templateDetails={templateDetails}
        onDiscountApplied={handleDiscountApplied}
      />
    </div>
  );
};

export default AssignedOrders;
