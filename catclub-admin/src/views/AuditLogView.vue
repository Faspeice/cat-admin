<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { moderationApi } from '@/api'
import type { AuditEntry, Page } from '@/api/types'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const loading = ref(true)
const entries = ref<AuditEntry[]>([])

onMounted(async () => {
  try {
    const data: Page<AuditEntry> = await moderationApi.audit({})
    entries.value = data.items
  } finally {
    loading.value = false
  }
})

function actionLabel(a: string) {
  const map: Record<string, string> = {
    'post.update': 'Редактирование поста',
    'post.remove': 'Удаление поста',
    'post.restore': 'Восстановление поста',
    'user.ban': 'Бан пользователя',
    'user.unban': 'Разбан пользователя',
  }
  return map[a] ?? a
}
</script>

<template>
  <div>
    <h1>Журнал действий</h1>

    <div v-if="loading" class="center"><Spinner /></div>
    <EmptyState v-else-if="entries.length === 0" title="Журнал пуст" hint="Действия модераторов появятся здесь" />

    <table v-else class="table">
      <thead>
      <tr>
        <th>Время</th>
        <th>Модератор</th>
        <th>Действие</th>
        <th>Цель</th>
        <th>Причина</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="e in entries" :key="e.id">
        <td>{{ new Date(e.createdAt).toLocaleString() }}</td>
        <td>{{ e.actor.nickname }}</td>
        <td>{{ actionLabel(e.action) }}</td>
        <td><code>{{ e.targetId }}</code></td>
        <td>{{ e.reason ?? '—' }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.center { text-align: center; padding: 40px; color: var(--text-muted); }
.table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.table th, .table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.table th { background: var(--surface-2); font-weight: 500; font-size: 13px; color: var(--text-muted); }
code { background: var(--surface-2); padding: 2px 6px; border-radius: 3px; font-size: 12px; }
</style>