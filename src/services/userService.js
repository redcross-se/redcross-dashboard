import { axiosInstance } from "../configs/axios.instance";

export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/volunteer/user/${userId}`);
    console.log("User:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const getMe = async (invalidate = false) => {
  if (localStorage.getItem("user") && !invalidate) {
    return JSON.parse(localStorage.getItem("user"));
  }
  const response = await axiosInstance.get("/auth/me");
  //save the user to local storage, so we don't have to fetch it again
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};
