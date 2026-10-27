import { API_BASE } from "../api/config";
import axios from "axios";

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const saveResult = (data: any) =>
  API.post("/results", data);

export const getResults = (studentId: string) =>
  API.get(`/results/student/${studentId}`);

export const getAdaptiveSummary = (studentId: string, mode: 'game' | 'module' = 'module') =>
  API.get(`/results/adaptive/${studentId}`, { params: { mode } });

export const getMLPrediction = (studentId: string) => API.get(`/results/ml/${studentId}`);

export const getAnalytics = () => API.get("/results/analytics");
export const getAllResults = () => API.get("/results/all");
export const getReport = (params:any) => API.get("/results/report", {params});
export const getCollectionSummary = () => API.get("/results/collection-summary");
export const getCollectionExport = () => API.get("/results/collection-export", { responseType: "blob" });

export default API;