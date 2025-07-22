import axios from 'axios';  // Importa axios
import axiosClient from '../lib/axiosClient' // ajusta o caminho se necessário

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // ou 127.0.0.1 se preferires
  withCredentials: false,
})

export default api
