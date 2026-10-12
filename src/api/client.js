import axios from 'axios';

export const STORAGE_KEY = 'jobconnect.auth';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored?.token) config.headers.Authorization = `Bearer ${stored.token}`;
  } catch {
    /* ignore corrupted storage */
  }
  return config;
});

// An expired / revoked token should send the user back to the login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login?expired=1');
    }
    return Promise.reject(err);
  }
);

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.values(data.fieldErrors).join('. ');
  }
  if (data?.message) return data.message;
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. Please check that the backend is running.';
  return fallback;
}

export function fieldErrors(err) {
  return err?.response?.data?.fieldErrors || {};
}

const get = (url, params) => api.get(url, { params }).then((r) => r.data);
const post = (url, body) => api.post(url, body).then((r) => r.data);
const put = (url, body) => api.put(url, body).then((r) => r.data);
const patch = (url, body) => api.patch(url, body).then((r) => r.data);
const del = (url) => api.delete(url).then((r) => r.data);

export const authApi = {
  login: (body) => post('/auth/login', body),
  register: (body) => post('/auth/register', body),
  me: () => get('/auth/me'),
};

export const jobsApi = {
  search: (params) => get('/jobs', params),
  get: (id) => get(`/jobs/${id}`),
};

export const seekerApi = {
  stats: () => get('/seeker/stats'),
  profile: () => get('/seeker/profile'),
  updateProfile: (body) => put('/seeker/profile', body),
  apply: (jobId, body) => post(`/seeker/jobs/${jobId}/apply`, body),
  applications: () => get('/seeker/applications'),
  withdraw: (id) => patch(`/seeker/applications/${id}/withdraw`),
  saved: () => get('/seeker/saved'),
  save: (jobId) => post(`/seeker/saved/${jobId}`),
  unsave: (jobId) => del(`/seeker/saved/${jobId}`),
};

export const employerApi = {
  stats: () => get('/employer/stats'),
  profile: () => get('/employer/profile'),
  updateProfile: (body) => put('/employer/profile', body),
  jobs: () => get('/employer/jobs'),
  job: (id) => get(`/employer/jobs/${id}`),
  createJob: (body) => post('/employer/jobs', body),
  updateJob: (id, body) => put(`/employer/jobs/${id}`, body),
  setJobStatus: (id, status) => patch(`/employer/jobs/${id}/status`, { status }),
  applicants: (jobId) => get(`/employer/jobs/${jobId}/applications`),
  setApplicationStatus: (id, status, note) => patch(`/employer/applications/${id}/status`, { status, note }),
};

export const adminApi = {
  stats: () => get('/admin/stats'),
  users: (params) => get('/admin/users', params),
  setUserActive: (id, active) => patch(`/admin/users/${id}/active`, { active }),
  jobs: (params) => get('/admin/jobs', params),
  setJobStatus: (id, status) => patch(`/admin/jobs/${id}/status`, { status }),
};

export default api;
