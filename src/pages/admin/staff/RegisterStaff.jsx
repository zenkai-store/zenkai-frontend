import React, { useState } from "react";
import axios from "axios";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Key,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { BASE_URL } from "../../../api/api";

const RegisterStaff = () => {
  const token = localStorage.getItem("mm_admin_token");

  // FORM STATES
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // MODAL
  const [showModal, setShowModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // ============================== VALIDATION ==============================
  const validateForm = () => {
    if (!name.trim()) return "Staff name is required.";

    if (!email.trim()) return "Company email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (email !== email2) return "Emails do not match.";

    if (!phone.trim()) return "Phone number is required.";
    if (!/^\d{10}$/.test(phone)) return "Enter a valid 10-digit phone number.";

    return null;
  };

  // ============================ DOWNLOAD JSON ============================
  const downloadResponse = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const filename = `New_Staff_${
      data?.staff?.name?.replace(/\s+/g, "_") || "details"
    }.json`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================ COPY PASSWORD ============================
  const copyPassword = () => {
    if (responseData?.temp_password) {
      navigator.clipboard.writeText(responseData.temp_password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // ============================ SUBMIT REQUEST ============================
  const submitStaff = async () => {
    setError("");
    setLoading(true);

    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      const res = await axios.post(`${BASE_URL}/api/staff/create`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResponseData(res.data);
      downloadResponse(res.data);

      setShowModal(false);
      setAgree(false);

      // Clear form
      setName("");
      setEmail("");
      setEmail2("");
      setPhone("");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to create staff. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================== HANDLE SUBMIT ===========================
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowModal(true);
  };

  // =========================== RESET FORM ===========================
  const resetForm = () => {
    setName("");
    setEmail("");
    setEmail2("");
    setPhone("");
    setError("");
    setResponseData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Register New Staff
                </h1>
                <p className="text-gray-600 mt-1">
                  Add new staff members to the system
                </p>
              </div>
            </div>
          </div>
          {responseData && (
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              Status:{" "}
              <span className="font-semibold text-green-600">Registered</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Important Information
              </h3>
              <p className="text-sm text-gray-600">
                New staff members will receive system access using their company
                email. A secure temporary password will be generated
                automatically and shown upon registration. All registrations are
                recorded for security and audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS CARD */}
      {responseData && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Staff Registered Successfully!
                  </h2>
                  <p className="text-green-100 text-sm mt-1">
                    Staff details have been saved and downloaded automatically
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadResponse(responseData)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Again
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Staff Information
                    </h4>
                    <p className="font-semibold text-gray-900">
                      {responseData.staff.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[80px]">
                      Staff ID:
                    </span>
                    <span className="font-medium text-gray-900">
                      {responseData.staff.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[80px]">Role:</span>
                    <span className="font-medium text-gray-900">
                      {responseData.staff.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Contact Details
                    </h4>
                    <p className="font-semibold text-gray-900">
                      {responseData.staff.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {responseData.staff.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Temporary Password
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg text-gray-900">
                        {responseData.temp_password}
                      </p>
                      <button
                        onClick={copyPassword}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy password"
                      >
                        {copiedPassword ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Share this password securely with the staff member
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Registered on{" "}
                  {new Date(responseData.staff.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Register Another Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Staff Registration Form
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in all required details to register a new staff member
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* NAME FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* EMAIL FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="staff@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Re-enter email address"
                    value={email2}
                    onChange={(e) => setEmail2(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PHONE FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength="10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter a 10-digit phone number without spaces or special
                characters
              </p>
            </div>

            {/* FORM ACTIONS */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Register New Staff
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ======================= CONFIRMATION MODAL ======================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Confirm Staff Registration
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Please review details before proceeding
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Staff Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Registration Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{phone}</span>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    Important Notice
                  </p>
                  <p className="text-amber-700">
                    This action will create a new staff account with system
                    access. A temporary password will be generated and must be
                    shared securely.
                  </p>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="confirmation"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="confirmation" className="text-sm text-gray-700">
                  <span className="font-medium">I confirm:</span> All
                  information is correct and I understand that this registration
                  will be recorded for security and audit purposes.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAgree(false);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={submitStaff}
                disabled={!agree || loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStaff;
