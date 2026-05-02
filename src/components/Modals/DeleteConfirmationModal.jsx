import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";

const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  discount,
  deleting,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Discount
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Are you sure you want to delete this discount?
                </p>
                {discount && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      <span className="font-semibold">{discount.value}</span>
                      {discount.discount_mode === "PERCENTAGE"
                        ? "%"
                        : " ₹"}{" "}
                      discount
                    </p>
                    {discount.segments?.length > 0 && (
                      <p className="mt-1">
                        Applied to:{" "}
                        {discount.segments.map((s) => s.name).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Discount
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationModal;
