import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) =>
    api.post("/auth/login", new URLSearchParams(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  register: (data) =>
    api.post("/auth/register", data, {
      headers: { "Content-Type": "application/json" },
    }),
  me: () => api.get("/auth/me"),
};

export const sessionAPI = {
  start:   ()     => api.post("/session/start"),
  current: ()     => api.get("/session/current"),
  signal:  (type) => api.post("/session/signal", { event_type: type, value: 1 }),
  events:  ()     => api.get("/session/events"),
};

export const transactionAPI = {
  create:     (data) => api.post("/transaction/", data),
  list:       ()     => api.get("/transaction/"),
  fraudCheck: (data) => api.post("/transaction/fraud-check", data),
  modelInfo:  ()     => api.get("/transaction/model-info"),
};

export const adminAPI = {
  alerts:    ()   => api.get("/admin/alerts"),
  resolve:   (id) => api.post(`/admin/alerts/${id}/resolve`),
  sessions:  ()   => api.get("/admin/sessions"),
  unfreeze:  (id) => api.post(`/admin/sessions/${id}/unfreeze`),
  modelInfo: ()   => api.get("/admin/model-info"),
};

export default api;