import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { postsApi } from '@/api'

export const usePostsStore = defineStore('posts', () => {
    const items = ref([])
    const total = ref(0)
    const loading = ref(false)
    const busyIds = ref(new Set())

    const filters = reactive({ status: 'pending', q: '', page: 1, perPage: 20 })

    const queue = computed(() => items.value.filter((p) => p.status === 'pending' || p.reportsCount > 0))

    async function load() {
        loading.value = true
        try {
            const data = await postsApi.list(filters)
            items.value = data.items
            total.value = data.total
        } finally {
            loading.value = false
        }
    }

    function setBusy(id, busy) {
        const next = new Set(busyIds.value)
        busy ? next.add(id) : next.delete(id)
        busyIds.value = next
    }

    function patch(id, part) {
        const i = items.value.findIndex((p) => p.id === id)
        if (i !== -1) items.value[i] = { ...items.value[i], ...part }
    }

    async function remove(post, reason) {
        const snapshot = { ...post }
        patch(post.id, { status: 'removed', removedReason: reason })
        setBusy(post.id, true)
        try {
            await postsApi.remove(post.id, reason)
        } catch (e) {
            patch(post.id, snapshot)
            throw e
        } finally {
            setBusy(post.id, false)
        }
    }

    async function restore(post) {
        const snapshot = { ...post }
        patch(post.id, { status: 'published', removedReason: null })
        setBusy(post.id, true)
        try {
            await postsApi.restore(post.id)
        } catch (e) {
            patch(post.id, snapshot)
            throw e
        } finally {
            setBusy(post.id, false)
        }
    }

    return { items, total, loading, busyIds, filters, queue, load, remove, restore }
})