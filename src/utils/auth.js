import BASEURL from "../config/baseURL";

const AUTH_STORAGE_KEY = "zenkai_user_data";

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
  } catch (error) {
    console.error("Error clearing stored user data:", error);
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
