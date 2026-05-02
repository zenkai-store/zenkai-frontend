import React, { useState } from "react";
import axios from "axios";

const BulkUpload = ({
  onSuccess,
  onClose,
  refreshCallback,
  endpoint = "https://modern-mahal-api.onrender.com/api/products/upload-excel",
  title = "Bulk Upload Products",
  description = "Upload Excel file with product data",
  successMessage = "Bulk upload completed successfully!",
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [fileName, setFileName] = useState("");

  // Helper function to reset upload state
  const resetUploadState = () => {
    setSelectedFile(null);
    setFileName("");
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess("");
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (Excel files)
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!validExtensions.includes(fileExtension)) {
        setUploadError("Please upload a valid Excel file (.xlsx, .xls, .csv)");
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setUploadError("");
      setUploadSuccess("");
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select an Excel file to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");
      setUploadProgress(0);

      // Get token from localStorage
      const adminToken = localStorage.getItem("mm_admin_token");
      const staffToken = localStorage.getItem("mm_staff_token");
      const token = adminToken || staffToken;

      if (!token) {
        setUploadError("Authentication required. Please login again.");
        setUploading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Make API call
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 90) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check response
      if (response.data && response.data.message) {
        const successMsg = response.data.message || successMessage;
        setUploadSuccess(successMsg);

        // Call success callback if provided
        if (onSuccess) onSuccess(response.data);

        // Close modal after success
        setTimeout(() => {
          if (onClose) onClose();
          resetUploadState();

          // Call refresh callback if provided
          if (refreshCallback) {
            setTimeout(() => {
              refreshCallback();
            }, 2000);
          }
        }, 1500);
      } else {
        throw new Error("Upload failed with no error message");
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      setUploadError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to upload file. Please check the file format and try again."
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    resetUploadState();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all">
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={uploading}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              selectedFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
            }`}
            onClick={() =>
              !uploading && document.getElementById("fileInput")?.click()
            }
          >
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {selectedFile ? (
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB • Click to change
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports .xlsx, .xls, .csv files
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-700">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{uploadSuccess}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-medium text-blue-900 text-sm mb-2">
              📋 Excel Format Requirements:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • Include columns: product_name, brand, product_code, etc.
              </li>
              <li>• Supported file types: .xlsx, .xls, .csv</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Make sure headers are in the first row</li>
            </ul>
            <button
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              onClick={() => {
                // Implement template download logic here
                alert("Template download functionality to be implemented");
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Template
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Excel File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
