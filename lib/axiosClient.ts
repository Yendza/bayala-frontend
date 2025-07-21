'use client'

import axios from 'axios'

// Cria instância de cliente Axios com baseURL
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api',
})

// Intercepta requisições para adicionar token
axiosClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Intercepta respostas para lidar com erros 401
axiosClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token')
            window.location.href = '/login'  // Redireciona para login
        }
        return Promise.reject(error)
    }
)

export default axiosClient
