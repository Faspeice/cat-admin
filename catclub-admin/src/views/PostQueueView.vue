<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const store = usePostsStore()
const toast = useToast()

onMounted(() => store.load())
watch(() => store.filters, () => store.load(), { deep: true })

async function removeWithUndo(id) {
  const post = store.items.find((p) => p.id === id)
  if (!post) return
  const reason = prompt('Причина удаления:') ?? 'нарушение правил'
  const snapshot = { ...post }
  try {
    await store.remove(post, reason)
    toast.undoable('Пост удалён', async () => {
      await store.restore(snapshot)
      toast.success('Пост восстановлен')
    })
  } catch {
    toast.danger('Не удалось удалить пост')
  }
}

function statusTone(s) {
  if (s === 'published') return 'success'
  if (s === 'removed') return 'danger'
  if (s === 'pending') return 'warning'
  return 'default'
}
</script>

<template>
  <div>
    <h1>Очередь модерации</h1>
    <div class="toolbar">
      <select v-model="store.filters.status">
        <option value="pending">Только ожидающие</option>
        <option value="all">Все</option>
        <option value="published">Опубликованные</option>
        <option value="removed">Удалённые</option>
      </select>
      <input v-model="store.filters.q" placeholder="Поиск по заголовку…" class="toolbar__search" />
      <span v-if="store.loading" class="toolbar__loading"><Spinner /></span>
    </div>

    <div v-if="!store.loading && store.items.length === 0">
      <EmptyState title="Очередь пуста" hint="Нет постов, требующих модерации" />
    </div>

    <table v-else class="table">
      <thead>
      <tr>
        <th>Заголовок</th>
        <th>Автор</th>
        <th>Категория</th>
        <th>Статус</th>
        <th>Жалобы</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="p in store.items" :key="p.id">
        <td>
          <a href="#" @click.prevent="router.push(`/posts/${p.id}`)">{{ p.title }}</a>
        </td>
        <td>{{ p.author.nickname }}</td>
        <td>{{ p.category }}</td>
        <td><Badge :tone="statusTone(p.status)">{{ p.status }}</Badge></td>
        <td>{{ p.reportsCount }}</td>
        <td class="table__actions">
          <Button
              v-if="p.status !== 'removed'"
              size="sm"
              variant="danger"
              :disabled="store.busyIds.has(p.id)"
              @click="removeWithUndo(p.id)"
          >Удалить</Button>
          <Button
              v-else
              size="sm"
              variant="primary"
              :disabled="store.busyIds.has(p.id)"
              @click="store.restore(p).then(() => toast.success('Восстановлено'))"
          >Восстановить</Button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Стили остаются без изменений, как в предыдущем ответе */
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
.toolbar__search { flex: 1; max-width: 320px; }
.toolbar__loading { margin-left: 8px; }
.table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.table th, .table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.table th { background: var(--surface-2); font-weight: 500; font-size: 13px; color: var(--text-muted); }
.table__actions { text-align: right; }
</style>