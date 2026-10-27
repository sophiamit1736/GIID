import { API_BASE } from "../api/config";
import axios from "axios";

const API = axios.create({
  baseURL: `${API_BASE}/learning-modules`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getLearningModules = (params?: {
  category?: string;
  level?: string;
}) => {
  return API.get("/", {
    params,
  });
};

export const getLearningModule = (moduleId: string) => {
  return API.get(`/${moduleId}`);
};

export default API;
export const deleteLearningModule = (moduleId: string) => API.delete(`/${moduleId}`);
