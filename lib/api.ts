// lib/api.ts
import axios from 'axios'

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/' // durante desenvolvimento local
    : 'https://bayala-backend-5.onrender.com/api/' // em produção no Render

const api = axios.create({
  baseURL,
  withCredentials: false,
})

export default api
