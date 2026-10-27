import axios from "axios";

const API = "http://localhost:5000/api/students";

export const getStudents = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getStudent = async (id: string) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const createStudent = async (student: any) => {
  const res = await axios.post(API, student);
  return res.data;
};

export const updateStudent = async (id: string, student: any) => {
  const res = await axios.put(`${API}/${id}`, student);
  return res.data;
};

export const deleteStudent = async (id: string) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};