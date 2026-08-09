import BASEURL from "../config/baseURL";

const AUTH_STORAGE_KEY = "zenkai_user_data";
const AUTH_TIMESTAMP_KEY = "zenkai_user_data_ts";
const AUTH_TOKEN_KEY = "zenkai_token";

export const setAuthToken = (token) => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {}
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const setStoredUserData = (userData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch {}
};

export const getStoredUserData = () => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearStoredUserData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
};

export const isStoredDataFresh = (ms = 10000) => {
  try {
    const ts = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    return ts ? Date.now() - parseInt(ts, 10) < ms : false;
  } catch {
    return false;
  }
};

let cachedUserData = null;

export const setCachedUserData = (userData) => {
  cachedUserData = userData;
  setStoredUserData(userData);
};

export const getCachedUserData = () => {
  if (cachedUserData) return cachedUserData;
  return getStoredUserData();
};

export const clearCachedUserData = () => {
  cachedUserData = null;
  clearStoredUserData();
};

export const isAuthenticated = async () => {
  try {
    const response = await fetch(`${BASEURL}/api/auth/me`, {
      credentials: "include",
      headers: getAuthHeader(),
    });
    if (response.ok) {
      const data = await response.json();
      setStoredUserData(data.user);
      return { authenticated: true, user: data.user };
    }
    return { authenticated: false, user: null };
  } catch {
    return { authenticated: false, user: null };
  }
};

export const getUserData = async () => {
  try {
    const response = await fetch(`${BASEURL}/api/auth/me`, {
      credentials: "include",
      headers: getAuthHeader(),
    });
    if (response.ok) {
      const data = await response.json();
      setStoredUserData(data.user);
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};

export const logout = async () => {
  try {
    await fetch(`${BASEURL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeader(),
    });
  } catch {}
  finally {
    clearCachedUserData();
  }
};
