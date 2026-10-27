import { API_BASE } from "../api/config";
import axios from "axios";

const API = axios.create({ baseURL: `${API_BASE}/games` });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getGames = (studentId?: string) => API.get("/", { params: studentId ? { studentId } : {} });
export const getGame = (gameId: string) => API.get(`/${gameId}`);
export const deleteGame = (gameId: string) => API.delete(`/${gameId}`);
export default API;
