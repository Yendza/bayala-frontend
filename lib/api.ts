// lib/api.ts
import axios from 'axios'

// Base URL configurável via variável de ambiente
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'

const api = axios.create({
  baseURL,
  withCredentials: false,
})

// Interceptor para incluir o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    console.error('Erro na requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `Erro ${error.response.status}:`,
        error.response.data
      )
    } else {
      console.error('Erro desconhecido:', error)
    }
    return Promise.reject(error)
  }
)

export default api
