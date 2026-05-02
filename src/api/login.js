import axiosClient from "./axiosClient";

// Admin Login API
export const adminLogin = async (email, password) => {
  try {
    const response = await axiosClient.post(
      "/api/admin/login",
      {
        email,
        password,
      },
      {
        withCredentials: true, // Explicitly enable for this request
      },
    );
    console.log("Admin login response:", response.data);
    console.log("Response headers:", response.headers);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const deleteTokenIfExpired = () => {
  const expireAt =
    localStorage.getItem("mm_admin_token_expireAt") ||
    localStorage.getItem("mm_staff_token_expireAt");

  if (!expireAt) return;

  if (Date.now() > Number(expireAt)) {
    localStorage.removeItem("mm_admin_token");
    localStorage.removeItem("mm_admin_token_expireAt");
    localStorage.removeItem("mm_staff_token_expireAt");
  }
};
