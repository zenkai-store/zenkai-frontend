import axios from "axios";
import { BASE_URL } from "./api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable credentials for all requests
});

export default axiosClient;
