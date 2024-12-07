import axios from "axios";

const createAxiosInstance = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    rejectUnauthorized: false,
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response.status === 401 &&
        localStorage.getItem("refreshToken") &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        console.log("Refreshing token");
        //If refresh token is expired, redirect to login
        //The response will be 400 if it is expired
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
            {
              refreshToken: localStorage.getItem("refreshToken"),
            }
          );
          localStorage.setItem("token", response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return axiosInstance(originalRequest);
        } catch (error) {
          if (error.response.status === 400) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return axiosInstance;
};

export const axiosInstance = createAxiosInstance();
