import axios from "axios";
import { API_BASE } from "./config";

const API = axios.create({ baseURL: API_BASE });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getModuleAssessment = (moduleId: string) => API.get(`/module-assessments/${moduleId}`);
export const submitModuleAssessment = (data: any) => API.post(`/module-assessments/submit`, data);
