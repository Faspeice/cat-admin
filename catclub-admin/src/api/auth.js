import { apiPost, apiGet } from './http'
import type { AuthTokens, Me } from './types'

export const authApi = {
    login(payload: { login: string; password: string }) {
        return apiPost<AuthTokens>('/auth/login', payload)
    },
    me() {
        return apiGet<Me>('/auth/me')
    },
    logout() {
        return apiPost<void>('/auth/logout')
    },
}