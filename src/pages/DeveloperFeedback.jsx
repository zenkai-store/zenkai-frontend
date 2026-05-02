import React, { useState } from "react";
import {
  Bug,
  Sparkles,
  Zap,
  Send,
  AlertCircle,
  Monitor,
  Smartphone,
  Apple,
} from "lucide-react";

import Logo from "../assets/MM_Logo.png";

const DeveloperFeedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    platform: "",
    severity: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const err = {};

    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Invalid email";

    if (!formData.type) err.type = "Select feedback type";
    if (!formData.platform) err.platform = "Select platform";
    if (!formData.severity) err.severity = "Select severity";
    if (!formData.message.trim()) err.message = "Message required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    setSuccess(false);
    if (!validate()) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1200)); // mock submit
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        type: "",
        platform: "",
        severity: "",
        message: "",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OPTIONS ---------------- */
  const feedbackTypes = [
    { value: "bug", label: "Bug", icon: Bug },
    { value: "feature", label: "Feature", icon: Sparkles },
    { value: "ui", label: "UI / UX", icon: Zap },
  ];

  const platforms = [
    { value: "web", label: "Web", icon: Monitor },
    { value: "android", label: "Android", icon: Smartphone },
    { value: "ios", label: "iOS", icon: Apple },
  ];

  const severityLevels = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="w-full min-h-screen bg-[#fcfcfc] font-lufga">
      {/* ---------------- NAVBAR ---------------- */}
      <header
        className="w-full px-6 md:px-20 py-3 flex items-center justify-between sticky top-0 z-50"
        style={{
          background:
            "linear-gradient(135deg, #7a001d 0%, #ff0048 60%, #ff0b53 100%)",
        }}
      >
        <img src={Logo} alt="Modern Mahal" className="w-24 md:w-28" />

        <a
          href="/"
          className="bg-white px-5 py-2 rounded-xl text-pink-600 font-semibold shadow hover:bg-pink-50 transition"
        >
          Back to Home
        </a>
      </header>

      {/* ---------------- HEADER ---------------- */}
      <section className="px-6 md:px-20 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#333]">
          Developer Feedback
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Report bugs, request features, or share testing feedback directly with
          our development team.
        </p>
      </section>

      {/* ---------------- FORM ---------------- */}
      <section className="px-6 md:px-20 pb-24">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10">
          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg font-semibold text-center">
              Feedback submitted successfully 🚀
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="font-semibold">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm flex gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Feedback Type */}
            <div>
              <label className="font-semibold mb-2 block">Feedback Type</label>
              <div className="flex gap-3">
                {feedbackTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() =>
                        handleChange({
                          target: { name: "type", value: t.value },
                        })
                      }
                      className={`flex-1 border rounded-xl py-3 flex flex-col items-center gap-1 transition ${
                        formData.type === t.value
                          ? "bg-pink-600 text-white border-pink-600"
                          : "hover:border-pink-400"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Platform */}
            <div>
              <label className="font-semibold mb-2 block">Platform</label>
              <div className="flex gap-3">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.value}
                      onClick={() =>
                        handleChange({
                          target: { name: "platform", value: p.value },
                        })
                      }
                      className={`flex-1 border rounded-xl py-3 flex flex-col items-center gap-1 transition ${
                        formData.platform === p.value
                          ? "bg-pink-600 text-white border-pink-600"
                          : "hover:border-pink-400"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.platform && (
                <p className="text-red-500 text-sm mt-1">{errors.platform}</p>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="font-semibold mb-2 block">Severity</label>
              <div className="grid grid-cols-2 gap-3">
                {severityLevels.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      handleChange({
                        target: { name: "severity", value: s },
                      })
                    }
                    className={`border rounded-xl py-2 font-semibold transition ${
                      formData.severity === s
                        ? "bg-pink-100 border-pink-500 text-pink-700"
                        : "hover:border-pink-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.severity && (
                <p className="text-red-500 text-sm mt-1">{errors.severity}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="font-semibold">Description</label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-400"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#ff0448] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#e6003f] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={18} /> Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="text-center py-10 text-sm text-gray-600">
        © {new Date().getFullYear()} Modern Mahal — Developer Feedback
      </footer>
    </div>
  );
};

export default DeveloperFeedback;
