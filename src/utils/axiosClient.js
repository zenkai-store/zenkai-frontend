import axios from "axios";
import BASEURL from "../config/baseURL";
import { clearStoredUserData, clearCachedUserData } from "./auth";

const axiosClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearStoredUserData();
      clearCachedUserData();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
