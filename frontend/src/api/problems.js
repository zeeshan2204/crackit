import api from "./client";

// Problems
export const getProblems = (params) => api.get("/problems", { params });
export const getProblemById = (id) => api.get(`/problems/${id}`);

// Submissions
export const submitSolution = (data) => api.post("/submissions", data);
export const getHistory = () => api.get("/submissions/history");
export const getStats = () => api.get("/submissions/stats");

// AI Chat
export const sendChat = (messages, context) =>
  api.post("/ai/chat", { messages, context });