import { useAuth } from "../context/authContext";
import axios from "axios";
import { useEffect } from "react";

export const useAxios = () => {
  const { token, refreshToken, setToken } = useAuth();

  const axiosInstance = axios.create({
    baseURL: "http://192.168.56.1",
  });

  useEffect(() => {
    axiosInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && refreshToken) {
          const response = await axios.post("/auth/refresh", { refreshToken });
          setToken(response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }, [token, refreshToken, setToken]);

  return axiosInstance;
};

