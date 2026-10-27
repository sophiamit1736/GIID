import { API_BASE } from "../api/config";
import axios from "axios";

const API = axios.create({ baseURL: `${API_BASE}/facp` });
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getFACPTemplate = () => API.get("/template");
export const getFACPStudentSummary = (studentId: string) => API.get(`/summary/${studentId}`);
export const getFACPAssessments = (studentId: string) => API.get(`/student/${studentId}`);
export const saveFACPAssessment = (data: any) => API.post("/assessments", data);
export const finalizeFACPBaseline = (studentId: string) => API.post(`/baseline/${studentId}/finalize`);
export default API;
