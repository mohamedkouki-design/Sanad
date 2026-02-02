// src/api/services.js
// ============================================================
// API Service Layer
// All backend calls go through these functions.
// This keeps components clean — they never call axios directly.
// ============================================================

const client = require("./client");

// ── AUTH ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => client.post("/auth/register", data),
  login:    (data) => client.post("/auth/login", data),
  refresh:  (data) => client.post("/auth/refresh", data),
  profile:  ()     => client.get("/auth/profile"),
};

// ── COURSES ──────────────────────────────────────────────────
export const courseAPI = {
  getAll:    ()     => client.get("/courses"),
  getById:   (id)   => client.get(`/courses/${id}`),
  create:    (data) => client.post("/courses", data),
  update:    (id, data) => client.put(`/courses/${id}`, data),
  delete:    (id)   => client.delete(`/courses/${id}`),
};

// ── LESSONS ──────────────────────────────────────────────────
export const lessonAPI = {
  getByCourse: (courseId)          => client.get(`/courses/${courseId}/lessons`),
  getById:     (courseId, lessonId)=> client.get(`/courses/${courseId}/lessons/${lessonId}`),
  create:      (courseId, data)    => client.post(`/courses/${courseId}/lessons`, data),
  update:      (courseId, lessonId, data) => client.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  delete:      (courseId, lessonId)=> client.delete(`/courses/${courseId}/lessons/${lessonId}`),
  summarize:   (courseId, lessonId)=> client.post(`/courses/${courseId}/lessons/${lessonId}/summarize`),
};

// ── ENROLLMENTS ──────────────────────────────────────────────
export const enrollmentAPI = {
  enroll:           (data)     => client.post("/enrollments", data),
  drop:             (courseId) => client.delete(`/enrollments/${courseId}`),
  getMy:            ()         => client.get("/enrollments/my"),
  getCourseRoster:  (courseId) => client.get(`/enrollments/course/${courseId}`),
};

// ── PROGRESS ─────────────────────────────────────────────────
export const progressAPI = {
  start:            (data)     => client.post("/progress/start", data),
  complete:         (data)     => client.post("/progress/complete", data),
  getCourseProgress:(courseId)  => client.get(`/progress/course/${courseId}`),
  getLeaderboard:   ()         => client.get("/progress/leaderboard"),
};
