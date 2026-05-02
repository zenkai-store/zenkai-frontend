import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../api/api";

const PendingIPs = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("mm_admin_token");

  // ================= FETCH PENDING REQUESTS =================
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/admin/ips/requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching pending requests →", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // ===================== APPROVE REQUEST =====================
  const handleApprove = async (id) => {
    try {
      setActionLoading(id + "-approve");

      await axios.post(
        `${BASE_URL}/api/admin/ips/requests/${id}/approve`,
        {
          access_level: "RESTRICTED",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh list after approval
      fetchPendingRequests();
    } catch (err) {
      console.error("Approve error →", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ===================== REJECT REQUEST =====================
  const handleReject = async (id) => {
    try {
      setActionLoading(id + "-reject");

      await axios.post(
        `${BASE_URL}/api/admin/ips/requests/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh list after rejection
      fetchPendingRequests();
    } catch (err) {
      console.error("Reject error →", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER TEXT */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Pending Staff IP Requests
      </h1>

      <p className="text-gray-600 text-sm leading-relaxed max-w mb-6">
        These are the IP requests submitted by the staff. Once you approve a
        request, the staff member will be able to access the Modern Mahal system
        with <strong>restricted access</strong>. If you reject the request, they
        will not be able to access the system. Review carefully before choosing
        an action.
      </p>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading pending requests...
        </div>
      )}

      {/* NO REQUESTS MESSAGE */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          There are no pending IP requests from Staff currently.
        </div>
      )}

      {/* TABLE */}
      {!loading && requests.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Reviewed By</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{req.staff_name}</td>

                  <td className="py-3 px-4">{req.staff_email}</td>

                  <td className="py-3 px-4">{req.ip_address}</td>

                  <td className="py-3 px-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                      {req.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {new Date(req.created_at).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    {req.reviewed_by ? req.reviewed_by : "—"}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="py-3 px-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id + "-approve"}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg disabled:opacity-50"
                    >
                      {actionLoading === req.id + "-approve"
                        ? "Approving..."
                        : "Approve"}
                    </button>

                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id + "-reject"}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg disabled:opacity-50"
                    >
                      {actionLoading === req.id + "-reject"
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingIPs;
