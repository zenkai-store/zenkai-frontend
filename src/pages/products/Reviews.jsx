import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ArrowLeft,
  MessageSquare,
  Users,
  BarChart3,
  Calendar,
  User,
  TrendingUp,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Award,
  Shield,
  Clock,
  HelpCircle,
} from "lucide-react";

const Reviews = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState(null);
  const [error, setError] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch product details first
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(
        `https://modern-mahal-api.onrender.com/api/products/${productId}`
      );
      if (response.data?.data) {
        setProductInfo(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    }
  };

  // Fetch reviews for this product
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `https://modern-mahal-api.onrender.com/api/reviews/${productId}`
      );

      if (response.data.success) {
        setReviewsData(response.data);
      } else {
        setError("Failed to load reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Unable to fetch reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [productId]);

  // Render star rating component
  const StarRating = ({ rating, size = "sm" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size === "sm" ? 16 : size === "md" ? 20 : 24}
            className={`fill-current ${
              i <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter and sort reviews
  const getFilteredReviews = () => {
    if (!reviewsData?.reviews) return [];

    let filtered = [...reviewsData.reviews];

    // Apply rating filter
    if (ratingFilter !== "all") {
      const ratingValue = parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating === ratingValue);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.review_title?.toLowerCase().includes(query) ||
          review.review_text?.toLowerCase().includes(query) ||
          review.user_name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === "latest") {
      filtered.sort(
        (a, b) => new Date(b.review_date) - new Date(a.review_date)
      );
    } else if (sortBy === "highest") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  };

  // Calculate pagination
  const filteredReviews = getFilteredReviews();
  const reviewsPerPage = 8;
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Rating distribution bars
  const renderRatingDistribution = () => {
    if (!reviewsData?.ratings_breakdown) return null;

    const total = reviewsData.total_reviews;
    const ratings = [
      { stars: 5, count: reviewsData.ratings_breakdown.five_star || 0 },
      { stars: 4, count: reviewsData.ratings_breakdown.four_star || 0 },
      { stars: 3, count: reviewsData.ratings_breakdown.three_star || 0 },
      { stars: 2, count: reviewsData.ratings_breakdown.two_star || 0 },
      { stars: 1, count: reviewsData.ratings_breakdown.one_star || 0 },
    ];

    return (
      <div className="space-y-3">
        {ratings.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm text-gray-600">{stars}</span>
              <Star size={14} className="text-yellow-400 fill-current" />
              <span className="text-xs text-gray-500 ml-1">({count})</span>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                style={{
                  width: total > 0 ? `${(count / total) * 100}%` : "0%",
                }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Unable to Load Reviews
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Reviews Found
            </h3>
            <p className="text-gray-600 mb-6">
              This product doesn't have any reviews yet.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Products
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Reviews
              </h1>
              <div className="flex items-center gap-4 mt-2">
                {productInfo && (
                  <>
                    <span className="text-lg font-semibold text-gray-800">
                      {productInfo.product_name}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {productInfo.product_code}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Average Rating
                </h3>
                <p className="text-sm text-gray-600">
                  Based on customer reviews
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold text-gray-900">
                {reviewsData.avg_rating.toFixed(1)}
              </span>
              <div className="pb-1">
                <StarRating
                  rating={Math.round(reviewsData.avg_rating)}
                  size="md"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {reviewsData.total_reviews} total reviews
                </p>
              </div>
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Reviews
                </h3>
                <p className="text-sm text-gray-600">Customer feedback count</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold text-gray-900">
                {reviewsData.total_reviews}
              </span>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +12% this month
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Growing engagement</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Rating Distribution
                </h3>
                <p className="text-sm text-gray-600">Detailed breakdown</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="space-y-4">{renderRatingDistribution()}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">★★★★★ 5 Stars</option>
                  <option value="4">★★★★☆ 4 Stars</option>
                  <option value="3">★★★☆☆ 3 Stars</option>
                  <option value="2">★★☆☆☆ 2 Stars</option>
                  <option value="1">★☆☆☆☆ 1 Star</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="latest">Latest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {paginatedReviews.length} of {filteredReviews.length}
                </span>{" "}
                reviews
                {searchQuery && (
                  <span className="ml-2">
                    for "<span className="font-medium">{searchQuery}</span>"
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages || 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Reviews Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || ratingFilter !== "all"
                ? "No reviews match your current filters."
                : "This product doesn't have any reviews yet."}
            </p>
            {(searchQuery || ratingFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter("all");
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedReviews.map((review) => (
                <div
                  key={review.review_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* User Info */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={review.user_avatar}
                            alt={review.user_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                review.user_name
                              )}&background=6366f1&color=fff&bold=true`;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <User size={12} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(review.review_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {review.review_title}
                          </h3>
                          <div className="mb-4">
                            <StarRating rating={review.rating} size="md" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition">
                            <ThumbsUp size={14} />
                            Helpful ({review.helpful_count || 0})
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {review.review_text}
                      </p>

                      {/* Review Metadata */}
                      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Verified Purchase
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HelpCircle size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            #{review.review_id.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2.5 rounded-lg font-medium transition ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Summary Footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review Summary
              </h3>
              <p className="text-gray-600">
                Overall customer satisfaction based on{" "}
                {reviewsData.total_reviews} reviews with an average rating of{" "}
                {reviewsData.avg_rating.toFixed(1)} out of 5 stars.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {reviewsData.avg_rating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="h-12 w-px bg-blue-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {reviewsData.total_reviews}
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
