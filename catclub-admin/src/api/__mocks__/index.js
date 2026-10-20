const wait = (data, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(data), ms))

const me = { id: 'm1', nickname: 'mod_anna', role: 'admin' }

const posts = [
    {
        id: 'p1', title: 'Мой мейн-кун', body: 'Посмотрите, какой красавец!',
        category: 'породы', images: [], status: 'pending',
        author: { id: 'u1', nickname: 'catlover' },
        reportsCount: 2,
        lastReport: { reason: 'spam', createdAt: new Date().toISOString() },
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'p2', title: 'Корм для котят', body: 'Ребята, чем кормите?',
        category: 'здоровье', images: [], status: 'published',
        author: { id: 'u2', nickname: 'kitty_mom' },
        reportsCount: 0,
        createdAt: new Date(Date.now() - 86400_000).toISOString(),
        updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    },
]

const users = [
    { id: 'u1', nickname: 'catlover', email: 'c@x.com', status: 'active', postsCount: 12, reportsCount: 2, createdAt: new Date().toISOString() },
    { id: 'u2', nickname: 'kitty_mom', email: 'k@x.com', status: 'active', postsCount: 45, reportsCount: 0, createdAt: new Date().toISOString() },
    { id: 'u3', nickname: 'seller_01', email: 's@x.com', status: 'restricted', postsCount: 3, reportsCount: 8, createdAt: new Date().toISOString() },
]

const audit = []
let auditId = 1
function addAudit(entry) {
    audit.unshift({
        ...entry,
        id: String(auditId++),
        actor: { id: me.id, nickname: me.nickname },
        createdAt: new Date().toISOString(),
    })
}

export const mockAuthApi = {
    login: async () => wait({ accessToken: 'mock-access-' + Date.now(), refreshToken: 'mock-refresh', expiresIn: 3600 }),
    me: async () => wait(me),
    logout: async () => wait(undefined),
}

export const mockPostsApi = {
    list: async (params) => {
        let list = [...posts]
        if (params.status && params.status !== 'all') list = list.filter((p) => p.status === params.status)
        if (params.q) list = list.filter((p) => p.title.toLowerCase().includes(params.q.toLowerCase()))
        return wait({ items: list, total: list.length, page: params.page ?? 1, perPage: params.perPage ?? 20 })
    },
    get: async (id) => {
        const p = posts.find((x) => x.id === id)
        if (!p) throw { status: 404, message: 'Пост не найден' }
        return wait(p)
    },
    update: async (id, patch) => {
        const p = posts.find((x) => x.id === id)
        if (!p) throw { status: 404, message: 'Пост не найден' }
        Object.assign(p, patch, { updatedAt: new Date().toISOString(), editedBy: me.id })
        addAudit({ action: 'post.update', targetId: id, diff: patch })
        return wait(p)
    },
    remove: async (id, reason) => {
        const p = posts.find((x) => x.id === id)
        if (p) {
            p.status = 'removed'
            p.removedReason = reason
            addAudit({ action: 'post.remove', targetId: id, reason })
        }
        return wait(undefined)
    },
    restore: async (id) => {
        const p = posts.find((x) => x.id === id)
        if (p) {
            p.status = 'published'
            p.removedReason = null
            addAudit({ action: 'post.restore', targetId: id })
        }
        return wait(undefined)
    },
}

export const mockUsersApi = {
    list: async (params) => {
        let list = [...users]
        if (params.status && params.status !== 'all') list = list.filter((u) => u.status === params.status)
        if (params.q) list = list.filter((u) => u.nickname.toLowerCase().includes(params.q.toLowerCase()))
        return wait({ items: list, total: list.length, page: params.page ?? 1, perPage: params.perPage ?? 20 })
    },
    get: async (id) => {
        const u = users.find((x) => x.id === id)
        if (!u) throw { status: 404, message: 'Пользователь не найден' }
        return wait(u)
    },
    ban: async (payload) => {
        const u = users.find((x) => x.id === payload.userId)
        if (u) {
            u.status = 'banned'
            u.ban = {
                reason: payload.reason,
                expiresAt: payload.durationHours ? new Date(Date.now() + payload.durationHours * 3600_000).toISOString() : null,
                createdAt: new Date().toISOString(),
            }
            addAudit({ action: 'user.ban', targetId: u.id, reason: payload.reason })
        }
        return wait(undefined)
    },
    unban: async (userId) => {
        const u = users.find((x) => x.id === userId)
        if (u) {
            u.status = 'active'
            u.ban = null
            addAudit({ action: 'user.unban', targetId: u.id })
        }
        return wait(undefined)
    },
}

export const mockModerationApi = {
    audit: async (params) =>
        wait({
            items: audit,
            total: audit.length,
            page: params.page ?? 1,
            perPage: params.perPage ?? 20,
        }),
}