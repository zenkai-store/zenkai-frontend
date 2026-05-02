import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  Shield,
  MoreVertical,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { BASE_URL } from "../../../api/api";

const ListStaff = () => {
  const token = localStorage.getItem("mm_admin_token");

  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [copiedId, setCopiedId] = useState(null);

  // ========================= MODAL STATES =========================
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [agreeReset, setAgreeReset] = useState(false);
  const [agreeDelete, setAgreeDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({
    verified: "all",
    sortBy: "newest",
  });

  // ========================= FETCH STAFFS =========================
  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/staff/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const staffData = res.data.staffs || [];
      setStaffs(staffData);
      setFilteredStaffs(staffData);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load staff list. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // ========================= SEARCH AND FILTER =========================
  useEffect(() => {
    let result = staffs;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (staff) =>
          staff.name.toLowerCase().includes(term) ||
          staff.email.toLowerCase().includes(term) ||
          staff.phone.toLowerCase().includes(term)
      );
    }

    // Verified filter
    if (filters.verified === "verified") {
      result = result.filter((staff) => staff.is_verified);
    } else if (filters.verified === "unverified") {
      result = result.filter((staff) => !staff.is_verified);
    }

    // Sort filter
    if (filters.sortBy === "newest") {
      result = [...result].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (filters.sortBy === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (filters.sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredStaffs(result);
  }, [searchTerm, filters, staffs]);

  // ========================= RESET PASSWORD =========================
  const handleResetPassword = async () => {
    if (!newPassword.trim()) return setActionError("New password is required.");
    if (newPassword !== confirmNewPassword)
      return setActionError("Passwords do not match.");
    if (!agreeReset)
      return setActionError("You must confirm this action before proceeding.");

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const body = {
        staff_id: selectedStaff.id,
        email: selectedStaff.email,
        new_password: newPassword.trim(),
      };

      const res = await axios.post(
        `${BASE_URL}/api/staff/reset-password`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActionSuccess("Password reset successfully!");
      setTimeout(() => {
        setShowResetModal(false);
        setNewPassword("");
        setConfirmNewPassword("");
        setAgreeReset(false);
        setActionSuccess("");
      }, 1500);
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ========================= DELETE STAFF =========================
  const handleDeleteStaff = async () => {
    if (!agreeDelete)
      return setActionError("You must confirm this action before proceeding.");

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      await axios.delete(`${BASE_URL}/api/staff/delete/${selectedStaff.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActionSuccess("Staff deleted successfully!");
      setTimeout(() => {
        setShowDeleteModal(false);
        setAgreeDelete(false);
        fetchStaffs();
        setActionSuccess("");
      }, 1500);
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Failed to delete staff. Try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ========================= COPY STAFF ID =========================
  const copyStaffId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all staff members
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
            Total:{" "}
            <span className="font-semibold text-gray-900">{staffs.length}</span>{" "}
            staff
          </div>
        </div>
      </div>

      {/* ACTION FEEDBACK */}
      <div className="mb-6 space-y-3">
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          <div className="col-span-4">STAFF MEMBER</div>
          <div className="col-span-3">CONTACT</div>
          <div className="col-span-3">CREATED</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading staff members...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500">
            <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-600 mb-2">Failed to load staff list</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchStaffs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredStaffs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500">
            <User className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-1">No staff members found</p>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No staff members have been added yet"}
            </p>
          </div>
        )}

        {/* STAFF LIST */}
        {!loading && filteredStaffs.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredStaffs.map((staff) => (
              <div
                key={staff.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Staff Info */}
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {staff.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">ID: {staff.id}</p>
                        <button
                          onClick={() => copyStaffId(staff.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors relative"
                          title="Copy Staff ID"
                        >
                          {copiedId === staff.id ? (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span className="font-medium">Copied!</span>
                            </div>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700">{staff.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(staff.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {new Date(staff.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedStaff(staff);
                        setShowResetModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStaff(staff);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS FOOTER */}
      {!loading && filteredStaffs.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredStaffs.length} of {staffs.length} staff members
        </div>
      )}

      {/* ======================= RESET PASSWORD MODAL ======================= */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <p className="text-blue-100 text-sm mt-1">
                Update login credentials for {selectedStaff.name}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Staff Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedStaff.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedStaff.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <input
                  type="checkbox"
                  id="resetConfirm"
                  checked={agreeReset}
                  onChange={(e) => setAgreeReset(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="resetConfirm" className="text-sm text-gray-700">
                  <span className="font-medium">Confirm action:</span> I
                  understand that resetting this password will immediately
                  update the staff member's login credentials.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setAgreeReset(false);
                  setShowPassword(false);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading || !agreeReset || !newPassword}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE STAFF MODAL ======================= */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Delete Staff Account
              </h2>
              <p className="text-red-100 text-sm mt-1">
                Permanent action - cannot be undone
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Warning: Irreversible Action
                  </h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete the staff account and all
                    associated data. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Staff Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedStaff.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedStaff.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Staff ID: {selectedStaff.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                <input
                  type="checkbox"
                  id="deleteConfirm"
                  checked={agreeDelete}
                  onChange={(e) => setAgreeDelete(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="deleteConfirm"
                  className="text-sm text-gray-700"
                >
                  <span className="font-medium">I understand and confirm:</span>
                  I want to permanently delete this staff account and all
                  associated data.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={actionLoading || !agreeDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStaff;
