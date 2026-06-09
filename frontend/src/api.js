import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  login: (data) => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)

    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  register: (data) => api.post('/auth/register', data),
}

export const sessionAPI = {
  start: () => api.post('/session/start'),
  current: () => api.get('/session/current'),
  signal: (event_type) => api.post('/session/signal', {
    event_type,
    value: 1,
    metadata: {},
  }),
  events: () => api.get('/session/events'),
}

export const transactionAPI = {
  create: (data) => api.post('/transaction/', data),
  list: () => api.get('/transaction/'),
}

export const adminAPI = {
  alerts: () => api.get('/admin/alerts'),
  resolve: (id) => api.post(`/admin/alerts/${id}/resolve`),
  sessions: () => api.get('/admin/sessions'),
  unfreeze: (id) => api.post(`/admin/sessions/${id}/unfreeze`),
}

export default api