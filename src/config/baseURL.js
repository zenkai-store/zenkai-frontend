const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "https://zenkai-backend.onrender.com"
    : "";

export default BASE_URL;
