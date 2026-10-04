const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('wellfrog_token');
}

export function setAuth(token, user) {
  localStorage.setItem('wellfrog_token', token);
  localStorage.setItem('wellfrog_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('wellfrog_token');
  localStorage.removeItem('wellfrog_user');
}

export function getCurrentUser() {
  const data = localStorage.getItem('wellfrog_user');
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    window.dispatchEvent(new Event('wellfrog_auth_expired'));
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  getAuthConfig: () => request('/auth/config'),
  loginWithGoogle: (idToken) => request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  emailAuth: (email, name, isSignUp) => request('/auth/email-auth', { method: 'POST', body: JSON.stringify({ email, name, isSignUp }) }),
  devLogin: (email, name) => request('/auth/dev-login', { method: 'POST', body: JSON.stringify({ email, name }) }),
  getMe: () => request('/auth/me'),

  // Consolidated Daily Dashboard
  getDailyDashboard: (date) => request(`/dashboard/daily${date ? `?date=${date}` : ''}`),

  // Expenses (Daily Spend: Online / Offline)
  getExpenses: (date) => request(`/expenses${date ? `?date=${date}` : ''}`),
  addExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Loans & EMIs (Paid / Failed / Pending)
  getLoans: () => request('/loans'),
  addLoan: (data) => request('/loans', { method: 'POST', body: JSON.stringify(data) }),
  updateLoan: (id, data) => request(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLoanStatus: (id, status) => request(`/loans/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteLoan: (id) => request(`/loans/${id}`, { method: 'DELETE' }),

  // Workouts
  getWorkouts: (date) => request(`/workouts${date ? `?date=${date}` : ''}`),
  logWorkout: (data) => request('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),

  // Office Work & Tasks
  getWorkSession: (date) => request(`/work${date ? `?date=${date}` : ''}`),
  logWorkSession: (data) => request('/work', { method: 'POST', body: JSON.stringify(data) }),

  // Naukri & Job Applications
  getJobs: () => request('/jobs'),
  addJob: (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // Activities & Sub-Activities
  getActivities: () => request('/activities'),
  addActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  toggleActivityActive: (id, active) => request(`/activities/${id}/toggle-active`, {
    method: 'PUT',
    body: active !== undefined ? JSON.stringify({ active }) : undefined,
  }),
  deleteActivity: (id, permanent = false) => request(`/activities/${id}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE' }),

  // Custom Activity Progress Logs
  getActivityLogs: (date) => request(`/activity-logs${date ? `?date=${date}` : ''}`),
  logActivityProgress: (data) => request('/activity-logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteActivityLog: (id) => request(`/activity-logs/${id}`, { method: 'DELETE' }),
};
