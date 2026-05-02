import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../api/api";

const AllowedIPs = () => {
  const [loading, setLoading] = useState(true);
  const [ips, setIps] = useState([]);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  // Add Office IP Modal States
  const [newIP, setNewIP] = useState("");
  const [description, setDescription] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FETCH OFFICE IP LIST
  const fetchIPs = async () => {
    try {
      const token = localStorage.getItem("mm_admin_token");

      const response = await axios.get(`${BASE_URL}/api/admin/ips/office`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setIps(response.data.ips);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch IP addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPs();
  }, []);

  // Detect current IP
  const detectIP = async () => {
    try {
      const res = await axios.get("https://api.ipify.org?format=json");
      setNewIP(res.data.ip);
    } catch (err) {
      console.error("Failed to detect IP");
    }
  };

  // Add Office IP Handler
  const handleAddIP = async () => {
    if (!agree) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("mm_admin_token");

      const response = await axios.post(
        `${BASE_URL}/api/admin/ips/office`,
        {
          ip_address: newIP,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Reset modal fields
        setNewIP("");
        setDescription("");
        setAgree(false);

        // Close modal
        setShowModal(false);

        // Refresh list
        fetchIPs();
      }
    } catch (err) {
      console.error("Failed to add IP:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-lufga">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Allowed Office IPs
      </h1>

      <p className="text-gray-600 leading-relaxed max-w mb-6">
        These are the IP addresses registered as office networks. Staff logging
        in from these IPs will get{" "}
        <span className="font-semibold">full access</span>. Staff logging in
        from other locations must be approved by the admin and will receive
        restricted access only.
      </p>

      {/* BUTTON TO OPEN MODAL */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-5 py-3 rounded-lg bg-gradient-to-r from-[#fe7b82] to-[#ff0448] text-white font-semibold shadow-md hover:opacity-90 transition"
      >
        + Add Office IP
      </button>

      {/* IP LIST */}
      {loading ? (
        <p className="text-gray-600">Loading IP addresses...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : ips.length === 0 ? (
        <p className="text-gray-600">No IP addresses added yet.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-[#fff0f5] text-[#b10d45]">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">
                  IP Address
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Created By
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Created At
                </th>
              </tr>
            </thead>

            <tbody>
              {ips.map((ip) => (
                <tr key={ip.id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{ip.ip_address}</td>
                  <td className="py-3 px-4">{ip.description}</td>
                  <td className="py-3 px-4">{ip.created_by}</td>
                  <td className="py-3 px-4">
                    {new Date(ip.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== MODAL ===================== */}
      {showModal && (
        <>
          {/* Overlay */}
          <div
            onClick={() => !submitting && setShowModal(false)}
            className="fixed inset-0 bg-white/10 backdrop-blur-md z-40"
          ></div>

          {/* Modal Box */}
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Add Office IP
              </h2>

              {/* Small Instruction */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                You are adding an IP to the Office Network. Only staff logging
                in from this IP can access the Modern Mahal system with full
                authority.
              </p>

              {/* INPUT: IP */}
              <label className="text-sm font-medium text-gray-700">
                IP Address
              </label>
              <div className="flex gap-2 mt-1 mb-4">
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none"
                  placeholder="Enter IP manually"
                />

                <button
                  onClick={detectIP}
                  className="px-3 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Detect
                </button>
              </div>

              {/* INPUT: DESCRIPTION */}
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 outline-none mb-4"
                placeholder="Short description"
              />

              {/* AGREEMENT CHECKBOX */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  I confirm that this IP should have Office-Level access.
                </span>
              </label>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => !submitting && setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddIP}
                  disabled={!agree || submitting}
                  className={`px-5 py-2 rounded-lg text-white font-semibold shadow-md transition 
                    ${
                      !agree
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#fe7b82] to-[#ff0448] hover:opacity-90"
                    }`}
                >
                  {submitting ? "Adding..." : "Add IP"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllowedIPs;
