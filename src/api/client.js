import axios from 'axios'

const DEFAULT_API_URL = 'https://api-discos.onrender.com/api'
export const API_URL_STORAGE_KEY = 'colecao_discos_api_url'

export function getApiBaseUrl() {
  return localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_API_URL
}

export function setApiBaseUrl(url) {
  localStorage.setItem(API_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''))
}

const api = axios.create()

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

export default api
