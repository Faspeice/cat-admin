export type Role = 'moderator' | 'admin'

export interface AuthTokens {
    accessToken: string
    refreshToken: string
    expiresIn: number // секунды
}

export interface Me {
    id: string
    nickname: string
    role: Role
    avatarUrl?: string
}

export type PostStatus = 'pending' | 'published' | 'hidden' | 'removed'
export type UserStatus = 'active' | 'restricted' | 'banned'
export type ReportReason = 'spam' | 'offtopic' | 'cruelty' | 'ads' | 'nsfw' | 'other'

export interface PostAuthor {
    id: string
    nickname: string
    avatarUrl?: string
}

export interface Post {
    id: string
    title: string
    body: string
    category: string
    images: string[]
    status: PostStatus
    author: PostAuthor
    reportsCount: number
    lastReport?: { reason: ReportReason; comment?: string; createdAt: string }
    createdAt: string
    updatedAt: string
    editedBy?: string | null
    removedReason?: string | null
    lockedBy?: { id: string; nickname: string } | null // если несколько модераторов
}

export interface User {
    id: string
    nickname: string
    email: string
    avatarUrl?: string
    status: UserStatus
    postsCount: number
    reportsCount: number
    ban?: { reason: string; expiresAt: string | null; createdAt: string } | null
    createdAt: string
}

export interface BanPayload {
    userId: string
    reason: string
    comment?: string
    durationHours: number | null // null = навсегда
}

export interface AuditEntry {
    id: string
    actor: { id: string; nickname: string }
    action:
        | 'post.update'
        | 'post.remove'
        | 'post.restore'
        | 'user.ban'
        | 'user.unban'
    targetId: string
    reason?: string
    diff?: Record<string, { from: unknown; to: unknown }>
    createdAt: string
}

// Универсальный ответ списков
export interface Page<T> {
    items: T[]
    total: number
    page: number
    perPage: number
}

export interface ApiError {
    status: number
    code?: string
    message: string
    details?: Record<string, string[]>
}