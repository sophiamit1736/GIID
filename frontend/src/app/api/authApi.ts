import { API_BASE } from "../api/config";
import axios from "axios";

const authAPI = axios.create({
  baseURL: `${API_BASE}/auth`,
});

export default authAPI;