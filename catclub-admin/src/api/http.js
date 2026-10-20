import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
    withCredentials: true,
})

let accessToken = null
export function setAccessToken(token) { accessToken = token }
export function getAccessToken() { return accessToken }

let isRefreshing = false
let pendingQueue = []

function onRefreshed(token) {
    pendingQueue.forEach((cb) => cb(token))
    pendingQueue = []
}

http.interceptors.request.use((cfg) => {
    if (accessToken && !cfg.headers.Authorization) {
        cfg.headers.Authorization = `Bearer ${accessToken}`
    }
    return cfg
})

http.interceptors.response.use(
    (r) => r,
    async (error) => {
        const original = error.config
        if (!original) return Promise.reject(error)

        if (error.response?.status === 401 && !original._retry) {
            const refresh = localStorage.getItem('refresh_token')
            if (!refresh) {
                forceLogout()
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise((resolve) => {
                    pendingQueue.push((token) => {
                        original.headers.Authorization = `Bearer ${token}`
                        resolve(http(original))
                    })
                })
            }

            original._retry = true
            isRefreshing = true

            try {
                const { data } = await axios.post(
                    import.meta.env.VITE_REFRESH_URL ?? `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    { refreshToken: refresh },
                    { withCredentials: true }
                )
                setAccessToken(data.accessToken)
                original.headers.Authorization = `Bearer ${data.accessToken}`
                onRefreshed(data.accessToken)
                return http(original)
            } catch (e) {
                forceLogout()
                return Promise.reject(e)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)
    }
)

function forceLogout() {
    setAccessToken(null)
    localStorage.removeItem('refresh_token')
    const auth = useAuthStore()
    auth.reset()
    const currentPath = window.location.pathname + window.location.search
    window.location.assign(`/login?next=${encodeURIComponent(currentPath)}`)
}

// Хелперы
export async function apiGet(url, cfg) {
    const { data } = await http.get(url, cfg)
    return data
}
export async function apiPost(url, body, cfg) {
    const { data } = await http.post(url, body, cfg)
    return data
}
export async function apiPatch(url, body, cfg) {
    const { data } = await http.patch(url, body, cfg)
    return data
}
export async function apiDelete(url, cfg) {
    const { data } = await http.delete(url, cfg)
    return data
}