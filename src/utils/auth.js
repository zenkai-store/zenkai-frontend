import BASEURL from "../config/baseURL";

const AUTH_STORAGE_KEY = "zenkai_user_data";
const AUTH_TIMESTAMP_KEY = "zenkai_user_data_ts";

// Check if user is authenticated by verifying with backend
export const isAuthenticated = async () => {
  try {
    const response = await fetch(`${BASEURL}/api/auth/me`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setStoredUserData(data.user);
      return { authenticated: true, user: data.user };
    }

    // Token expired/invalid → clear cache
    clearCachedUserData();
    return { authenticated: false, user: null };
  } catch (error) {
    console.error("Auth check error:", error);
    clearCachedUserData();
    return { authenticated: false, user: null };
  }
};

// Get user data from backend, with localStorage fallback
export const getUserData = async () => {
  try {
    const response = await fetch(`${BASEURL}/api/auth/me`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setStoredUserData(data.user);
      return data.user;
    }

    clearCachedUserData();
    return null;
  } catch (error) {
    console.error("Get user data error:", error);
    clearCachedUserData();
    return null;
  }
};

// Store user data in localStorage for persistence
export const setStoredUserData = (userData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

export const getStoredUserData = () => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving stored user data:", error);
    return null;
  }
};

export const clearStoredUserData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Error clearing stored user data:", error);
  }
};

// Returns true if user data was stored within the last `ms` milliseconds.
// Used to avoid wiping a freshly-set session before the browser has had a
// chance to send the auth cookie on the first cross-origin request.
export const isStoredDataFresh = (ms = 10000) => {
  try {
    const ts = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    return ts ? Date.now() - parseInt(ts, 10) < ms : false;
  } catch {
    return false;
  }
};

// Store user data in memory (for session only)
let cachedUserData = null;

export const setCachedUserData = (userData) => {
  cachedUserData = userData;
  setStoredUserData(userData); // Also persist to localStorage
};

export const getCachedUserData = () => {
  if (cachedUserData) return cachedUserData;
  // Fallback to localStorage
  return getStoredUserData();
};

export const clearCachedUserData = () => {
  cachedUserData = null;
  clearStoredUserData();
};

// Logout function
export const logout = async () => {
  try {
    await fetch(`${BASEURL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearCachedUserData();
  }
};
