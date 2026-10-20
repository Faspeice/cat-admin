// src/api/users.ts
import { apiGet, apiPost, apiDelete } from './http'
import type { Page, User, BanPayload } from './types'

export interface UserListParams {
    q?: string
    status?: User['status'] | 'all'
    page?: number
    perPage?: number
}

export const usersApi = {
    list(params: UserListParams = {}) {
        return apiGet<Page<User>>('/users', { params })
    },
    get(id: string) {
        return apiGet<User>(`/users/${id}`)
    },
    ban(payload: BanPayload) {
        return apiPost<void>(`/users/${payload.userId}/ban`, payload)
    },
    unban(userId: string) {
        return apiDelete<void>(`/users/${userId}/ban`)
    },
}