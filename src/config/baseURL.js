// Baseurl.js

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://zenkai-backend.onrender.com/";

export default BASE_URL;
