// src/api/moderation.ts
import { apiGet } from './http'
import type { Page, AuditEntry } from './types'

export interface AuditParams {
    actorId?: string
    action?: AuditEntry['action']
    from?: string
    to?: string
    page?: number
    perPage?: number
}

export const moderationApi = {
    audit(params: AuditParams = {}) {
        return apiGet<Page<AuditEntry>>('/moderation/audit', { params })
    },
}