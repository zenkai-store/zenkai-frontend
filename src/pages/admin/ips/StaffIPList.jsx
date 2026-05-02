import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../api/api";

const StaffIPs = () => {
  const [loading, setLoading] = useState(true);
  const [staffIPs, setStaffIPs] = useState([]);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedIP, setSelectedIP] = useState(null);
  const [removing, setRemoving] = useState(false);

  const token = localStorage.getItem("mm_admin_token");

  // ====================== FETCH STAFF IPS ======================
  const fetchStaffIPs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${BASE_URL}/api/admin/ips/staff-access`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaffIPs(res.data.access || []);
    } catch (err) {
      console.error("Error fetching staff IP access →", err);
      setError("Failed to load staff IP access list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffIPs();
  }, []);

  // ======================== REMOVE ACCESS ========================
  const handleRemoveAccess = async () => {
    if (!selectedIP) return;

    try {
      setRemoving(true);

      await axios.delete(
        `${BASE_URL}/api/admin/ips/staff-access/${selectedIP.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowModal(false);
      setSelectedIP(null);

      fetchStaffIPs();
    } catch (err) {
      console.error("Remove Access error →", err);
      alert("Failed to remove access. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="p-6 relative">
      {/* ==================== PAGE HEADER ==================== */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Staff IP Access List
      </h1>

      <p className="text-gray-600 text-sm leading-relaxed max-w mb-6">
        Below is the list of staff IP addresses that currently have access to
        the Modern Mahal system. Staff members with approved IP access will be
        able to operate the system with <strong>restricted permissions</strong>.
        You can remove access anytime if suspicious or unusual activity is
        detected.
      </p>

      {/* ==================== ERROR MESSAGE ==================== */}
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      {/* ==================== LOADING ==================== */}
      {loading && (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading staff IP access...
        </div>
      )}

      {/* ==================== NO DATA ==================== */}
      {!loading && staffIPs.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          No Staff IP Access records found.
        </div>
      )}

      {/* ==================== TABLE ==================== */}
      {!loading && staffIPs.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Access Level</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4">Approved At</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {staffIPs.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{entry.staff_id}</td>

                  <td className="py-3 px-4 font-medium">{entry.ip_address}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold 
                      ${
                        entry.access_level === "FULL"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {entry.access_level}
                    </span>
                  </td>

                  <td className="py-3 px-4">{entry.approved_by || "—"}</td>

                  <td className="py-3 px-4">
                    {new Date(entry.approved_at).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedIP(entry);
                        setShowModal(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg"
                    >
                      Remove Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== CONFIRM MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white w-[380px] rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Confirm Removal
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to remove IP access for:
              <span className="font-semibold text-gray-800">
                {selectedIP?.ip_address}
              </span>
              ?
              <br />
              The staff member will lose access to the system immediately.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleRemoveAccess}
                disabled={removing}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffIPs;
