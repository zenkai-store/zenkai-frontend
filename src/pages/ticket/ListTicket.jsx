import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  AlertCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
} from "lucide-react";
import { BASE_URL } from "../../api/api";
import { jwtDecode } from "jwt-decode";

const ListTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // For assigning the ticket to the staff
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState("");

  const ticketsPerPage = 50;
  const totalPages = Math.ceil(totalTickets / ticketsPerPage);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("mm_staff_token") ||
        localStorage.getItem("mm_admin_token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: ticketsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const res = await fetch(`${BASE_URL}/api/tickets/admin/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setTickets(data.tickets.tickets || []);
      setTotalTickets(data.tickets.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      setAssigningTicketId(ticketId);

      const token = localStorage.getItem("mm_staff_token");
      const decoded = jwtDecode(token);
      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/api/tickets/admin/${ticketId}/assign`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ staff_id: decoded.id }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to assign staff");
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, staff_name: "You" } : t)),
      );

      setAssignSuccessMessage(
        "Ticket has been assigned to you. Go to 'Your Tickets' page for resolving the ticket.",
      );
    } catch (err) {
      console.error("Assign ticket failed:", err);
    } finally {
      setAssigningTicketId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / 3600000);

    if (diffHours < 24) {
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

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
      case "FAILED":
        return { color: "text-red-600 bg-red-50", icon: <XCircle size={14} /> };
      default:
        return {
          color: "text-gray-600 bg-gray-50",
          icon: <ClockIcon size={14} />,
        };
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Search & Filter */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Ticket ID or Name"
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg w-80 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
            <Filter size={16} className="text-gray-400" />
            <select
              className="bg-transparent border-none text-sm"
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

        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * ticketsPerPage + 1}–
          {Math.min(currentPage * ticketsPerPage, totalTickets)} of{" "}
          {totalTickets}
        </div>
      </div>

      {assignSuccessMessage && (
        <div className="mb-4 px-5 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {assignSuccessMessage}
        </div>
      )}

      {/* Ticket List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading tickets...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2" />
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="mx-auto mb-2" />
            No tickets found
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="p-6 flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {ticket.title}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        ticket.priority,
                      )}`}
                    >
                      {ticket.priority}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        getStatusConfig(ticket.status).color
                      }`}
                    >
                      {getStatusConfig(ticket.status).icon}
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="text-gray-600 font-medium">
                      #{ticket.id}
                    </span>
                  </div>
                </div>
                {/* Date / Time */}
                <div className="w-28 text-sm text-gray-400 text-right">
                  {formatDate(ticket.created_at)}
                </div>

                {/* Assign Button */}
                <div className="w-36 flex justify-end">
                  {!ticket.staff_name ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAssignTicket(ticket.id)}
                        disabled={assigningTicketId === ticket.id}
                        className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {assigningTicketId === ticket.id
                          ? "Assigning..."
                          : "Assign"}
                      </button>
                    </div>
                  ) : (
                    <span className="px-6 py-2.5 text-sm rounded-lg bg-gray-100 text-gray-500">
                      Already Assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ListTicket;
