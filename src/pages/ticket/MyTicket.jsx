import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  Paperclip,
  Download,
  Phone,
  Mail,
  Globe,
  Clock,
  Eye,
  Copy,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  UserCog,
  FileText,
  Send,
} from "lucide-react";
import { BASE_URL } from "../../api/api";

const MyTicket = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Replace the dummyTickets declaration (around line 19-74) with:
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update ticket
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Add this after the state declarations:
  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("mm_staff_token");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50, // ticketsPerPage
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const response = await fetch(
        `${BASE_URL}/api/tickets/staff/all?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets?.tickets || []);
      setTotalTickets(data.tickets?.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Replace the pagination section (around line 90-94) with:
  const ticketsPerPage = 50;
  const totalPages = Math.ceil(totalTickets / ticketsPerPage);
  // Note: We're not slicing locally since API handles pagination
  // currentTickets is now just the tickets array from API
  const currentTickets = tickets;

  // Update the formatDate function to handle API date format:
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / 3600000);

    if (diffHours < 24) {
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-sm";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-600 shadow-sm";
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-600 shadow-sm";
    }
  };

  const copyToClipboard = async (text) => {
    if (!text || text === "N/A") return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status) {
      case "SOLVED":
        return {
          color: "text-green-600 bg-green-50",
          icon: <CheckCircle size={14} />,
        };
      case "IN_PROGRESS":
        return {
          color: "text-blue-600 bg-blue-50",
          icon: <ClockIcon size={14} />,
        };
      case "HOLD":
        return {
          color: "text-yellow-600 bg-yellow-50",
          icon: <AlertCircle size={14} />,
        };
      case "FAILED":
        return { color: "text-red-600 bg-red-50", icon: <XCircle size={14} /> };
      default: // UNSOLVED
        return {
          color: "text-gray-600 bg-gray-50",
          icon: <ClockIcon size={14} />,
        };
    }
  };

  // Get user avatar color
  const getUserColor = (name) => {
    const colors = [
      "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600",
      "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600",
      "bg-gradient-to-r from-green-100 to-emerald-100 text-green-600",
      "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Replace the current handleTicketClick function with:
  const handleTicketClick = async (ticket) => {
    try {
      const token =
        localStorage.getItem("mm_staff_token") ||
        localStorage.getItem("mm_admin_token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/tickets/details/${ticket.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the API response to match our component structure
      const formattedTicket = {
        id: data.ticket.id,
        title: data.ticket.title,
        type: data.ticket.type,
        status: data.ticket.status,
        priority: data.ticket.priority,
        created_at: data.ticket.created_at,
        updated_at: data.ticket.updated_at,
        message: data.ticket.message,
        assigned_staff: data.ticket.staff_name || "Unassigned",

        // User information from API
        user: {
          name: data.ticket.user_name || "Unknown User",
          avatar: data.ticket.user_name ? data.ticket.user_name.charAt(0) : "U",
          phone: data.ticket.phone_number || "N/A",
          email: data.ticket.email_address || "N/A",
          work_email:
            data.ticket.work_email_address ||
            data.ticket.email_address ||
            "N/A",
        },

        // Attachments from API
        attachments: data.attachments
          ? data.attachments.map((attach) => ({
              name: attach.filename || "Attachment",
              size: attach.file_size
                ? `${Math.round(attach.file_size / 1024)}kb`
                : "N/A",
              type: attach.file_type || "file",
              url: attach.file_url || attach.url,
            }))
          : [],

        // Activities from API
        activities: data.activities
          ? data.activities.map((activity) => ({
              user:
                activity.actor_id === data.ticket.user_id
                  ? data.ticket.user_name
                  : activity.actor_name || "Staff",
              action:
                activity.action.toLowerCase() === "created"
                  ? "created the Ticket"
                  : activity.action.toLowerCase() === "updated"
                    ? "updated the Ticket"
                    : activity.action.toLowerCase() === "commented"
                      ? "commented on the Ticket"
                      : activity.action.toLowerCase() === "assigned"
                        ? "assigned the Ticket"
                        : `${activity.action.toLowerCase()} the Ticket`,
              time: formatActivityTime(activity.created_at),
            }))
          : [],
      };

      setSelectedTicket(formattedTicket);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      // Fallback to basic ticket data
      setSelectedTicket({
        ...ticket,
        user: {
          name: ticket.user_name || "Unknown User",
          avatar: ticket.user_name ? ticket.user_name.charAt(0) : "U",
          phone: "N/A",
          email: "N/A",
          work_email: "N/A",
        },
        message: "Unable to load ticket details",
        assigned_staff: "Unassigned",
        attachments: [],
        activities: [],
      });
    }
  };

  const updateTicketStatus = async (newStatus) => {
    if (!selectedTicket || newStatus === selectedTicket.status) return;

    try {
      setUpdatingStatus(true);

      const token = localStorage.getItem("mm_staff_token");

      const response = await fetch(
        `${BASE_URL}/api/tickets/admin/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }

      // Update selected ticket locally
      setSelectedTicket((prev) => ({
        ...prev,
        status: newStatus,
      }));

      // Update ticket in list
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: newStatus } : t,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add this function after the formatDate function:
  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / 60000);
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Add this function after the formatActivityTime function:
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="w-full h-full">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Middle Section - Ticket Listing */}
        <div className="flex-1 border-r border-gray-200 flex flex-col min-h-0">
          <div>
            {/* Search and Filter Bar */}
            <div className="flex items-center justify-between mb-5 ">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Ticket ID or Name"
                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    className="bg-transparent border-none focus:outline-none text-sm text-gray-700"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="UNSOLVED">Unsolved</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="HOLD">On Hold</option>
                    <option value="SOLVED">Solved</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-500 rb-2 mr-2">
                Showing {(currentPage - 1) * ticketsPerPage + 1}-
                {Math.min(currentPage * ticketsPerPage, totalTickets)} of{" "}
                {totalTickets} tickets
              </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Loading tickets...
                    </h3>
                  </div>
                ) : error ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle size={24} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Error loading tickets
                    </h3>
                    <p className="text-gray-500">{error}</p>
                    <button
                      onClick={fetchTickets}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : currentTickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No tickets found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  currentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedTicket?.id === ticket.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* User Avatar */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${getUserColor(
                                ticket.user_name || "U",
                              )}`}
                            >
                              {ticket.avatar_url ? (
                                <img
                                  src={ticket.avatar_url}
                                  alt={ticket.user_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-medium text-lg">
                                  {ticket.user_name?.charAt(0) || "U"}
                                </span>
                              )}
                            </div>

                            {/* Ticket Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                  {ticket.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {/* Priority Badge */}
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                      ticket.priority,
                                    )}`}
                                  >
                                    {ticket.priority}
                                  </span>
                                  {/* Status Badge */}
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                      getStatusConfig(ticket.status).color
                                    }`}
                                  >
                                    {getStatusConfig(ticket.status).icon}
                                    {ticket.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-gray-400">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-600">
                                    #{ticket.id}
                                  </span>
                                </div>
                                <span>{formatDate(ticket.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pb-8">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                        disabled={page === "..."}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                          page === currentPage
                            ? "bg-gradient-to-r from-[#ffe4ec] to-[#ffd9e4] text-[#d10f55] border-[#ffd9e4] font-medium"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                        } ${
                          page === "..."
                            ? "cursor-default hover:bg-transparent"
                            : ""
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Ticket Details */}
        <div className="w-1/3 min-w-[500px] border-l border-gray-200 flex flex-col min-h-0">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {selectedTicket.user.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Ticket ID: #{selectedTicket.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                        updatingStatus
                          ? "bg-gray-200 text-gray-500 border-gray-300"
                          : getPriorityColor(selectedTicket.priority)
                      }`}
                    >
                      {updatingStatus
                        ? "Updating..."
                        : selectedTicket?.priority}
                    </div>
                    {selectedTicket && (
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(e.target.value)}
                        disabled={updatingStatus}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50"
                      >
                        <option value="UNSOLVED">Unsolved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="HOLD">On Hold</option>
                        <option value="SOLVED">Solved</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ticket Type</p>
                    <p className="font-medium text-gray-700">
                      {selectedTicket.type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <p className="font-medium text-gray-700 flex items-center gap-1">
                      <UserCog size={12} />
                      {selectedTicket.assigned_staff}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="font-medium text-gray-700">
                      {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Title and Time */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedTicket.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedTicket.created_at)}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  from {selectedTicket.user.name}
                </p>

                {/* Message */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments &&
                selectedTicket.attachments.length > 0 ? (
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Paperclip size={16} />
                      Attachments ({selectedTicket.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedTicket.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-xl p-4 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                          {file.url && (
                            <button
                              onClick={() => window.open(file.url, "_blank")}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View attachment"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Paperclip size={16} />
                      Attachments
                    </h4>
                    <p className="text-gray-500 text-sm">No attachments</p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Full Customer Details */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Customer Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Phone Number
                      </span>
                      <span className="font-medium flex items-center gap-2">
                        <Phone size={14} />
                        {selectedTicket.user.phone}
                        <button
                          onClick={() =>
                            copyToClipboard(selectedTicket.user.phone)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy phone number"
                        >
                          <Copy size={14} />
                        </button>
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Email Address
                      </span>
                      <span className="font-medium flex items-center gap-2">
                        <Mail size={14} />
                        {selectedTicket.user.email}
                        <button
                          onClick={() =>
                            copyToClipboard(selectedTicket.user.email)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy email"
                        >
                          <Copy size={14} />
                        </button>
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Work Email</span>
                      <span className="font-medium flex items-center gap-2">
                        <Mail size={14} />
                        {selectedTicket.user.work_email}
                        <button
                          onClick={() =>
                            copyToClipboard(selectedTicket.user.work_email)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy work email"
                        >
                          <Copy size={14} />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Ticket Active Section */}
                <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Ticket Active{" "}
                    <span className="text-blue-600">#{selectedTicket.id}</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Ticket Type</p>
                      <div className="flex items-center justify-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {selectedTicket.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Priority</p>
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(
                          selectedTicket.priority,
                        )}`}
                      >
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Assign to</p>
                      <div className="flex items-center justify-center gap-2">
                        <UserCog size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {selectedTicket.assigned_staff}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="font-medium text-gray-700 mb-4">Activity</h4>
                  <div className="space-y-6">
                    {selectedTicket.activities &&
                    selectedTicket.activities.length > 0 ? (
                      selectedTicket.activities.map((activity, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="relative">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                activity.user === selectedTicket.user.name
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {activity.user.charAt(0)}
                            </div>
                            {index < selectedTicket.activities.length - 1 && (
                              <div className="absolute top-8 left-4 w-0.5 h-8 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {activity.user} {activity.action}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No activity recorded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Ticket Selected
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Select a ticket from the list to view details and manage
                  customer support requests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTicket;
