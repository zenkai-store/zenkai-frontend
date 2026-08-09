import axios from "axios";
import BASEURL from "../config/baseURL";
import { getAuthToken } from "./auth";

const axiosClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
