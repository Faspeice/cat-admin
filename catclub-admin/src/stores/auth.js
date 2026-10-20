import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { setAccessToken } from '@/api/http'

export const useAuthStore = defineStore('auth', () => {
    const me = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!me.value)
    const role = computed(() => me.value?.role ?? null)
    const can = (need) => (role.value === 'admin' ? true : role.value === need)

    async function login(loginVal, password) {
        loading.value = true
        error.value = null
        try {
            const tokens = await authApi.login({ login: loginVal, password })
            setAccessToken(tokens.accessToken)
            localStorage.setItem('refresh_token', tokens.refreshToken)
            me.value = await authApi.me()
        } catch (e) {
            error.value = e.response?.data?.message || 'Ошибка входа'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function restore() {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) return
        try {
            me.value = await authApi.me()
        } catch {
            reset()
        }
    }

    async function logout() {
        try { await authApi.logout() } catch {}
        reset()
    }

    function reset() {
        me.value = null
        setAccessToken(null)
        localStorage.removeItem('refresh_token')
    }

    return { me, loading, error, isAuthenticated, role, can, login, restore, logout, reset }
})