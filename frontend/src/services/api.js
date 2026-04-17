// frontend/src/services/api.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8000',
});

// Request interceptor — attach Bearer token from localStorage
instance.interceptors.request.use((config) => {
  const stored = localStorage.getItem('complaintiq_auth');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }
  return config;
});

// Response interceptor — normalize error messages
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    err.message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message;
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Login a user.
 * @param {string} email
 * @param {string} password
 * @returns {{ user_id, name, role, token }}
 */
const login = async (email, password, role) => {
  const payload = { email, password };
  if (role) {
    payload.role = role;
  }
  const res = await instance.post('/auth/login', payload);
  return res.data;
};

/**
 * Get the currently authenticated user.
 * @returns {{ user_id, name, role, email }}
 */
const me = async () => {
  const res = await instance.get('/auth/me');
  return res.data;
};

// ── Complaints ────────────────────────────────────────────────────────────────

/**
 * Create a new complaint.
 * @param {object} payload - complaint data
 * @returns {{ reference_number, sla_tier, estimated_resolution, ... }}
 */
const createComplaint = async (payload) => {
  const res = await instance.post('/complaints', payload);
  return res.data;
};

/**
 * List complaints. Backend filters by logged-in user role automatically.
 * @param {object} [params] - optional query params (e.g. { agent_id: 'me' })
 * @returns {Array} complaints array
 */
const listComplaints = async (params = {}) => {
  const res = await instance.get('/complaints', { params });
  return res.data.items || res.data;
};

/**
 * Get a single complaint by ID or reference number.
 * @param {string|number} id
 * @returns {object} complaint detail
 */
const getComplaint = async (id) => {
  const res = await instance.get(`/complaints/${id}`);
  return res.data;
};

/**
 * Update complaint status.
 * @param {string|number} id
 * @param {string} status
 * @returns {object} updated complaint
 */
const updateStatus = async (id, status) => {
  const res = await instance.patch(`/complaints/${id}/status`, { status });
  return res.data;
};

/**
 * Send an agent response to a complaint.
 * @param {string|number} id
 * @param {{ final_response_text: string, agent_id: string }} payload
 * @returns {object}
 */
const sendResponse = async (id, payload) => {
  const res = await instance.post(`/complaints/${id}/response`, payload);
  return res.data;
};

/**
 * Submit customer CSAT feedback.
 * @param {string|number} id
 * @param {{ csat_rating: number, csat_comment?: string }} payload
 * @returns {object}
 */
const submitFeedback = async (id, payload) => {
  const res = await instance.post(`/complaints/${id}/feedback`, payload);
  return res.data;
};

/**
 * Get AI-generated draft response for a complaint.
 * @param {string|number} id
 * @returns {{ draft_text: string, policy_sources: Array }}
 */
const getAIDraft = async (id) => {
  const res = await instance.get(`/complaints/${id}/ai-draft`);
  return res.data;
};

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Get summary analytics stats.
 * @returns {{ open, breach_rate, avg_resolution, ai_automation, csat }}
 */
const summary = async () => {
  const res = await instance.get('/analytics/summary');
  return res.data;
};

/**
 * Get daily complaint volume data.
 * @returns {Array<{ date, total, resolved }>}
 */
const volume = async () => {
  const res = await instance.get('/analytics/volume');
  return res.data;
};

/**
 * Get complaints grouped by product category.
 * @returns {Array<{ product, count }>}
 */
const byProduct = async () => {
  const res = await instance.get('/analytics/by-product');
  return res.data;
};

/**
 * Get SLA performance data by tier.
 * @returns {Array}
 */
const slaPerformance = async () => {
  const res = await instance.get('/analytics/sla-performance');
  return res.data;
};

/**
 * Get sentiment breakdown by product.
 * @returns {Array<{ product, frustrated, neutral, satisfied }>}
 */
const sentiment = async () => {
  const res = await instance.get('/analytics/sentiment');
  return res.data;
};

/**
 * Get monthly report data for RBI submission.
 * @returns {{ by_category: Array, by_channel: Array }}
 */
const monthlyReport = async () => {
  const res = await instance.get('/reports/monthly');
  return res.data;
};

// ── Export named groups ───────────────────────────────────────────────────────

const api = {
  auth: { login, me },
  complaints: {
    create: createComplaint,
    list: listComplaints,
    get: getComplaint,
    updateStatus,
    sendResponse,
    submitFeedback,
    getAIDraft,
  },
  analytics: {
    summary,
    volume,
    byProduct,
    slaPerformance,
    sentiment,
    monthlyReport,
  },
};

export default api;
