import { API_BASE } from "../api/config";
import axios from "axios";

const API = axios.create({
  baseURL: `${API_BASE}/students`,
});

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
export const getStudents = () => API.get("/");
