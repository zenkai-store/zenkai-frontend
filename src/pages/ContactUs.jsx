import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCachedUserData, getStoredUserData, getAuthHeader } from "../utils/auth";

import Logo from "../assets/logo.png";
import ContactHero from "../assets/contactus.png"; // Replace with your actual image

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Heart,
  ShoppingBag,
  Star,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Sparkles,
  Truck,
  Headset,
  BadgeDollarSign,
  Package,
  ArrowRight,
  Smile,
} from "lucide-react";

const ContactUs = () => {
  const navigate = useNavigate();

  // ======================= STATES =======================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Notification
  const [notification, setNotification] = useState(null);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);

  // ======================= CHECK AUTH =======================
  useEffect(() => {
    const storedData = getStoredUserData();
    if (storedData) {
      setIsLoggedIn(true);
      setUserName(storedData?.name || "User");
      setFormData((prev) => ({
        ...prev,
        email: storedData?.email || "",
        name: storedData?.name || "",
      }));
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, []);

  // ======================= FORM HANDLERS =======================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Simulate API call (replace with actual API later)
    try {
      // Placeholder for actual API call
      // const response = await axios.post(`${BASEURL}/api/contact`, formData, { withCredentials: true });

      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitSuccess(true);
      showNotification("Message sent successfully!", "success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError("Failed to send message. Please try again.");
      showNotification("Failed to send message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================= NOTIFICATION =======================
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ======================= LOGOUT =======================
  const handleLogout = async () => {
    try {
      const response = await fetch(
        `/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: getAuthHeader(),
        },
      );

      if (response.ok) {
        setIsLoggedIn(false);
        setUserName("");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedIn(false);
      setUserName("");
      navigate("/");
    }
  };

  // ======================= FAQ DATA =======================
  const faqs = [
    {
      id: 1,
      question: "What is the shipping time for orders?",
      answer:
        "We typically process orders within 1-2 business days. Standard shipping takes 3-7 business days depending on your location. Express shipping options are also available at checkout.",
    },
    {
      id: 2,
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all unused products in their original packaging. Simply contact our support team to initiate a return, and we'll guide you through the process.",
    },
    {
      id: 3,
      question: "Do you offer international shipping?",
      answer:
        "Yes! We ship to most countries worldwide. International shipping rates and delivery times vary based on destination. You can see the exact shipping cost at checkout.",
    },
    {
      id: 4,
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive a confirmation email with a tracking number. You can use this number to track your package on our website or the carrier's website.",
    },
    {
      id: 5,
      question: "Are the products authentic?",
      answer:
        "Absolutely! All our products are 100% authentic and sourced directly from authorized manufacturers and distributors. We guarantee the authenticity of every item we sell.",
    },
  ];

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

  // ======================= MAIN RENDER =======================
  return (
    <div className="w-full min-h-screen bg-white font-lufga">
      <Notification />

      {/* ======================= NAVBAR ======================= */}
      <div className="bg-black">
        {/* Thin Top Header */}
        <div className="text-white text-sm py-2 px-6 flex justify-center items-center border-b border-white/10">
          <div className="flex items-center gap-2 justify-center text-center">
            <span>
              Summer Sale For All DieCast Cars And Free Delivery - OFF 30%!
            </span>
            <button
              onClick={() => navigate("/products")}
              className="underline font-semibold ml-2 hover:text-gray-300"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="w-full px-6 md:px-20 py-4 flex items-center justify-between bg-transparent text-white">
          <img
            src={Logo}
            alt="Zenkai.co"
            className="w-24 md:w-28 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => navigate("/")}
          />

          <div className="hidden md:flex items-center gap-10 font-medium">
            <button
              onClick={() => navigate("/")}
              className="hover:text-gray-300 transition"
            >
              Shop
            </button>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-gray-300 transition"
            >
              Products
            </button>
            <button
              onClick={() => navigate("/new-arrivals")}
              className="hover:text-gray-300 transition"
            >
              New Arrivals
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-white font-semibold transition border-b-2 border-red-500 pb-1"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/cart")} className="relative">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="hidden md:inline">
                    {userName || "Profile"}
                  </span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition text-sm">
                      My Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition text-sm">
                      Orders
                    </button>
                    <button
                      onClick={() => navigate("/wishlist")}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      Wishlist
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
              >
                Login
              </button>
            )}

            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden w-full bg-black/95 backdrop-blur-md text-white py-4 px-6 flex flex-col gap-4 z-30 border-t border-white/10">
            <button
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className="hover:text-gray-300 py-2 text-left"
            >
              Shop
            </button>
            <button
              onClick={() => {
                navigate("/products");
                setIsMenuOpen(false);
              }}
              className="hover:text-gray-300 py-2 text-left"
            >
              Products
            </button>
            <button
              onClick={() => {
                navigate("/new-arrivals");
                setIsMenuOpen(false);
              }}
              className="hover:text-gray-300 py-2 text-left"
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                navigate("/contact");
                setIsMenuOpen(false);
              }}
              className="text-white font-semibold py-2 text-left"
            >
              Contact
            </button>
          </div>
        )}
      </div>

      {/* ======================= HERO BANNER ======================= */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={ContactHero}
            alt="Contact Us"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-4 backdrop-blur-sm">
            <MessageSquare size={16} />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl">
            Have questions or feedback? We'd love to hear from you. Our team is
            here to help.
          </p>
        </div>
      </div>

      {/* ======================= MAIN CONTENT ======================= */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ======================= LEFT COLUMN - INFO ======================= */}
          <div className="space-y-10">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-red-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  About Zenkai.co
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Welcome to{" "}
                  <span className="font-semibold text-gray-900">Zenkai.co</span>{" "}
                  — your premier destination for premium diecast collectibles,
                  authentic katanas, anime idols, and exclusive merchandise. We
                  are passionate about bringing the finest collectibles to
                  enthusiasts and collectors worldwide.
                </p>
                <p>
                  Founded with a vision to create a trusted marketplace for
                  collectors, we carefully curate every product in our catalog
                  to ensure authenticity, quality, and value. From rare diecast
                  model cars to handcrafted katanas and limited-edition anime
                  figures, each item tells a story.
                </p>
                <p>
                  Our commitment goes beyond just selling products — we strive
                  to build a community of passionate collectors who share our
                  love for exceptional craftsmanship and attention to detail.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
                  <Truck size={24} className="text-red-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Free Shipping
                </h4>
                <p className="text-xs text-gray-500">On orders over ₹500</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
                  <Shield size={24} className="text-red-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Authenticity
                </h4>
                <p className="text-xs text-gray-500">100% genuine products</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
                  <Headset size={24} className="text-red-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  24/7 Support
                </h4>
                <p className="text-xs text-gray-500">Always here to help</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
                  <BadgeDollarSign size={24} className="text-red-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Easy Returns
                </h4>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Mail size={20} className="text-red-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Reach Out to Us
                </h2>
              </div>
              <div className="space-y-4">
                <a
                  href="mailto:zenkaisupport@gmail.com"
                  className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition">
                    <Mail size={28} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Email Support
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Send us an email anytime
                    </p>
                    <p className="text-red-500 font-medium text-sm sm:text-base truncate">
                      zenkaisupport@gmail.com
                    </p>
                  </div>
                  <ExternalLink
                    size={18}
                    className="text-gray-400 group-hover:text-red-500 transition ml-auto flex-shrink-0"
                  />
                </a>

                <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock size={28} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Response Time
                    </h4>
                    <p className="text-gray-500 text-sm">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= RIGHT COLUMN - FORM ======================= */}
          <div>
            <div className="sticky top-28">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 md:p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare size={24} />
                    <h2 className="text-2xl font-bold">Send Us a Message</h2>
                  </div>
                  <p className="text-white/80 text-sm">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8">
                  {/* Success Message */}
                  {submitSuccess && (
                    <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                      <CheckCircle
                        size={22}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          Message Sent Successfully!
                        </h4>
                        <p className="text-green-600 text-sm">
                          Thank you for reaching out. We'll get back to you
                          within 24 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitError && (
                    <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                      <AlertCircle
                        size={22}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">
                          Failed to Send
                        </h4>
                        <p className="text-red-600 text-sm">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your@email.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Category Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm cursor-pointer"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Related</option>
                        <option value="product">Product Question</option>
                        <option value="shipping">Shipping & Delivery</option>
                        <option value="returns">Returns & Refunds</option>
                        <option value="feedback">Website Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What is this about?"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition text-sm resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-base hover:from-red-600 hover:to-pink-600 transition shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center pt-2">
                      By submitting this form, you agree to our privacy policy
                      and terms of service.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= FAQ SECTION ======================= */}
        <div className="mt-20 md:mt-28">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-medium mb-4">
              <MessageSquare size={16} />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find quick answers to common questions about our products and
              services.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 transition ${
                      openFaq === faq.id
                        ? "bg-red-500 border-red-500 text-white rotate-45"
                        : "text-gray-500"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ======================= CTA SECTION ======================= */}
        <div className="mt-20 md:mt-28 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Smile size={32} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Can't find what you're looking for? Send us an email and we'll get
              back to you as soon as possible.
            </p>
            <a
              href="mailto:zenkaisupport@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-red-500 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-xl active:scale-95"
            >
              <Mail size={20} />
              zenkaisupport@gmail.com
            </a>
          </div>
        </div>
      </main>

      {/* ======================= FOOTER ======================= */}
      <footer className="bg-black text-white py-12 px-6 md:px-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={Logo} alt="Zenkai.co" className="w-28 mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Your premier destination for premium collectibles and exclusive
                merchandise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/")}
                  className="block text-gray-400 hover:text-white transition text-sm"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="block text-gray-400 hover:text-white transition text-sm"
                >
                  Products
                </button>
                <button
                  onClick={() => navigate("/new-arrivals")}
                  className="block text-gray-400 hover:text-white transition text-sm"
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="block text-gray-400 hover:text-white transition text-sm"
                >
                  Contact
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <a
                  href="mailto:zenkaisupport@gmail.com"
                  className="block text-gray-400 hover:text-white transition text-sm"
                >
                  zenkaisupport@gmail.com
                </a>
                <p className="text-gray-400 text-sm">
                  Response within 24 hours
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 transition">
                  <Instagram size={18} />
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 transition">
                  <Facebook size={18} />
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 transition">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 transition">
                  <Youtube size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © 2026 Zenkai.co. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <button className="hover:text-white transition">
                Privacy Policy
              </button>
              <button className="hover:text-white transition">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
