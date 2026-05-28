import axios from 'axios';
import api from './client';

export const startExam = () =>
  api.post('/exam/start').then(r => r.data);

export const getQuestions = (section) =>
  api.get(`/exam/questions/${section}`).then(r => r.data);

export const submitSection = (payload) =>
  api.post('/exam/submit-section', payload).then(r => r.data);

export const completeExam = (sessionId) =>
  api.post(`/exam/complete/${sessionId}`).then(r => r.data);

export const getResult = (sessionId) =>
  api.get(`/exam/result/${sessionId}`).then(r => r.data);

export const getLeaderboard = () =>
  api.get('/exam/leaderboard').then(r => r.data);

export const getHistory = () =>
  api.get('/exam/history').then(r => r.data);

export const getAiFeedback = (payload) =>
  axios.post('http://localhost:8000/api/ai/exam-feedback', payload).then(r => r.data);

export const executeCode = (payload) =>
  axios.post('http://localhost:8000/api/code/run', payload).then(r => r.data);
