import axios from 'axios'

const DEFAULT_API_URL = 'https://api-discos.onrender.com/api'
export const API_URL_STORAGE_KEY = 'colecao_discos_api_url'
export const AUTH_TOKEN_STORAGE_KEY = 'colecao_discos_token'
export const AUTH_USUARIO_STORAGE_KEY = 'colecao_discos_usuario'

export function getApiBaseUrl() {
  return localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_API_URL
}

export function setApiBaseUrl(url) {
  localStorage.setItem(API_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''))
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

let aoNaoAutorizado = null
export function definirCallbackNaoAutorizado(callback) {
  aoNaoAutorizado = callback
}

const api = axios.create()

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const tinhaToken = Boolean(error.config?.headers?.Authorization)
    const status = error.response?.status
    if (tinhaToken && (status === 401 || status === 403) && aoNaoAutorizado) {
      aoNaoAutorizado()
    }
    return Promise.reject(error)
  },
)

export default api
