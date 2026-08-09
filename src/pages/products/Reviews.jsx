import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../utils/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import {
  getCachedUserData,
  getUserData,
  getStoredUserData,
} from "../../utils/auth";

import {
  Star,
  ThumbsUp,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Image as ImageIcon,
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  Package,
  MessageSquare,
  Camera,
  Clock,
} from "lucide-react";

const Reviews = ({ productId }) => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: "",
    media: [],
  });

  // Image preview for review form
  const [imagePreviews, setImagePreviews] = useState([]);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // Notification
  const [notification, setNotification] = useState(null);

  const REVIEWS_PER_PAGE = 10;

  // ======================= CHECK USER AUTH =======================
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getStoredUserData();

      if (storedUser && storedUser.role !== "admin") {
        setIsUserLoggedIn(true);
        setUserId(storedUser._id);
        setUserName(storedUser.name || "User");
      } else {
        setIsUserLoggedIn(false);
        setUserId(null);
        setUserName("");
      }
    };

    checkAuth();
  }, []);

  // ======================= FETCH REVIEW STATS =======================
  const fetchStats = useCallback(async () => {
    if (!productId) return;

    try {
      setStatsLoading(true);
      const response = await axiosClient.get(
        `/api/reviews/product/${productId}/stats`,
        { withCredentials: false },
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [productId]);

  // ======================= FETCH REVIEWS =======================
  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(
        `/api/reviews/product/${productId}`,
        {
          params: { page: currentPage, limit: REVIEWS_PER_PAGE },
          withCredentials: false,
        },
      );

      if (response.data.success) {
        setReviews(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalReviews(response.data.pagination?.total || 0);
        setHasNextPage(response.data.pagination?.hasNextPage || false);
        setHasPrevPage(response.data.pagination?.hasPrevPage || false);
      } else {
        setError("Failed to load reviews");
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ======================= HANDLE FILE SELECT =======================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files],
    }));

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
    // Revoke object URL and remove preview
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================= SUBMIT REVIEW =======================
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!formData.reviewText.trim()) {
      setSubmitError("Please write a review before submitting.");
      return;
    }

    if (formData.reviewText.trim().length < 10) {
      setSubmitError("Review must be at least 10 characters long.");
      return;
    }

    if (formData.reviewText.trim().length > 500) {
      setSubmitError("Review must not exceed 500 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const formDataToSend = new FormData();
      formDataToSend.append("productId", productId);
      formDataToSend.append("rating", formData.rating.toString());
      formDataToSend.append("reviewText", formData.reviewText.trim());

      // Append media files
      formData.media.forEach((file) => {
        formDataToSend.append("media", file);
      });

      const response = await axiosClient.post(
        `/api/reviews`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setSubmitSuccess("Review submitted successfully!");
        showNotification("Review submitted successfully!", "success");

        // Reset form
        setFormData({
          rating: 5,
          reviewText: "",
          media: [],
        });
        // Revoke all preview URLs
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);

        // Refresh reviews and stats
        setTimeout(() => {
          setShowReviewForm(false);
          setSubmitSuccess("");
          setCurrentPage(1);
          fetchReviews();
          fetchStats();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setSubmitError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================= DELETE REVIEW =======================
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      setDeletingId(reviewId);

      const response = await axiosClient.delete(
        `/api/reviews/${reviewId}`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        showNotification("Review deleted successfully", "success");
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      showNotification(
        err.response?.data?.message || "Failed to delete review",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================= PAGINATION =======================
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .getElementById("reviews-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // ======================= NOTIFICATION =======================
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ======================= FORMAT FUNCTIONS =======================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getRatingPercentage = (rating) => {
    if (!stats || stats.totalReviews === 0) return 0;
    const ratingData = stats.ratings?.find((r) => r.rating === rating);
    return ratingData ? (ratingData.count / stats.totalReviews) * 100 : 0;
  };

  // ======================= STAR RATING COMPONENT =======================
  const StarRating = ({ rating, size = 16, interactive = false, onChange }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            }`}
          >
            <Star
              size={size}
              className={`${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  // ======================= NOTIFICATION COMPONENT =======================
  const Notification = () => {
    if (!notification) return null;

    return (
      <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
        <div
          className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-gray-900 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      </div>
    );
  };

  // ======================= PAGINATION COMPONENT =======================
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400 px-1">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition text-sm font-medium ${
              page === currentPage
                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-gray-400 px-1">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition text-sm font-medium text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </div>
    );
  };

  // ======================= MAIN RENDER =======================
  return (
    <div id="reviews-section" className="w-full font-lufga">
      <Notification />

      {/* ======================= SECTION HEADER ======================= */}
      <div className="border-t border-gray-200 pt-10 mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* ======================= LEFT - REVIEWS LIST ======================= */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <MessageSquare size={24} className="text-red-500" />
                  Customer Reviews
                </h2>
                {stats && (
                  <div className="flex items-center gap-3 mt-2">
                    <StarRating
                      rating={Math.round(stats.averageRating)}
                      size={18}
                    />
                    <span className="text-sm text-gray-500">
                      {stats.averageRating.toFixed(1)} out of 5
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {stats.totalReviews} review
                      {stats.totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (!isUserLoggedIn) {
                    navigate("/login");
                    return;
                  }
                  setShowReviewForm(!showReviewForm);
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition font-medium shadow-lg shadow-red-500/25"
              >
                <MessageSquare size={18} />
                Write a Review
              </button>
            </div>

            {/* ======================= REVIEW FORM ======================= */}
            {showReviewForm && (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera size={18} className="text-red-500" />
                  Share Your Experience
                </h3>

                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle
                      size={18}
                      className="text-red-500 flex-shrink-0"
                    />
                    <span className="text-red-600 text-sm">{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle
                      size={18}
                      className="text-green-500 flex-shrink-0"
                    />
                    <span className="text-green-600 text-sm">
                      {submitSuccess}
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <StarRating
                      rating={formData.rating}
                      size={28}
                      interactive={true}
                      onChange={(rating) =>
                        setFormData({ ...formData, rating })
                      }
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.reviewText}
                      onChange={(e) =>
                        setFormData({ ...formData, reviewText: e.target.value })
                      }
                      placeholder="Write your review here... (min 10 characters)"
                      rows={4}
                      maxLength={500}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">
                      {formData.reviewText.length}/500
                    </p>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Images{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="file"
                      id="review-media-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="review-media-upload"
                      className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50 transition group"
                    >
                      <Upload
                        size={20}
                        className="text-gray-400 group-hover:text-red-500 transition"
                      />
                      <span className="text-sm text-gray-500 group-hover:text-red-500 transition">
                        Click to upload images
                      </span>
                    </label>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-red-500/25 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setSubmitError("");
                        imagePreviews.forEach((url) =>
                          URL.revokeObjectURL(url),
                        );
                        setImagePreviews([]);
                        setFormData({ rating: 5, reviewText: "", media: [] });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ======================= LOGIN PROMPT ======================= */}
            {!isUserLoggedIn && !showReviewForm && (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6 mb-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={22} className="text-gray-500" />
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Please login as a user to write a review
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition font-medium text-sm shadow-lg shadow-red-500/25"
                >
                  Login to Review
                </Link>
              </div>
            )}

            {/* ======================= REVIEWS LIST ======================= */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">{error}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Be the first to review this product!
                </p>
                {isUserLoggedIn ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition font-medium text-sm shadow-lg shadow-red-500/25"
                  >
                    <MessageSquare size={16} />
                    Write a Review
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition font-medium text-sm shadow-lg shadow-red-500/25"
                  >
                    <User size={16} />
                    Login to Review
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {review.userId?.name || "Anonymous"}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button - Only for review owner */}
                      {isUserLoggedIn && userId === review.userId?._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingId === review._id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete review"
                        >
                          {deletingId === review._id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {review.reviewText}
                    </p>

                    {/* Review Images */}
                    {review.media && review.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.media.map((media, index) => (
                          <a
                            key={media._id || index}
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={media.url}
                              alt={`Review image ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-red-500 transition cursor-pointer hover:scale-105 duration-200"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                <Pagination />
              </div>
            )}
          </div>

          {/* ======================= RIGHT - RATING BREAKDOWN ======================= */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                Rating Breakdown
              </h3>

              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className="text-5xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <StarRating
                      rating={Math.round(stats.averageRating)}
                      size={20}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.totalReviews} review
                      {stats.totalReviews !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Rating Bars */}
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium text-gray-700">
                          {rating}
                        </span>
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${getRatingPercentage(rating)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">
                        {stats.ratings?.find((r) => r.rating === rating)
                          ?.count || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No ratings yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
