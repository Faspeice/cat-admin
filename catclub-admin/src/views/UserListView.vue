<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const store = useUsersStore()
const toast = useToast()

onMounted(() => store.load())
watch(() => store.filters, () => store.load(), { deep: true })

function statusTone(s: string) {
  if (s === 'active') return 'success'
  if (s === 'banned') return 'danger'
  if (s === 'restricted') return 'warning'
  return 'default'
}
</script>

<template>
  <div>
    <h1>Пользователи</h1>

    <div class="toolbar">
      <select v-model="store.filters.status">
        <option value="all">Все статусы</option>
        <option value="active">Активные</option>
        <option value="restricted">Ограниченные</option>
        <option value="banned">Забаненные</option>
      </select>
      <input v-model="store.filters.q" placeholder="Поиск по нику…" class="toolbar__search" />
      <span v-if="store.loading" class="toolbar__loading"><Spinner /></span>
    </div>

    <EmptyState v-if="!store.loading && store.items.length === 0" title="Пользователи не найдены" />

    <table v-else class="table">
      <thead>
      <tr>
        <th>Ник</th>
        <th>Email</th>
        <th>Статус</th>
        <th>Постов</th>
        <th>Жалоб</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="u in store.items" :key="u.id">
        <td><a href="#" @click.prevent="router.push(`/users/${u.id}`)">{{ u.nickname }}</a></td>
        <td>{{ u.email }}</td>
        <td><Badge :tone="statusTone(u.status)">{{ u.status }}</Badge></td>
        <td>{{ u.postsCount }}</td>
        <td>{{ u.reportsCount }}</td>
        <td class="table__actions">
          <Button
              v-if="u.status !== 'banned'"
              size="sm"
              variant="danger"
              @click="store.ban({ userId: u.id, reason: 'нарушение', durationHours: 24 }).then(() => toast.success('Забанен'))"
          >
            Бан 24ч
          </Button>
          <Button
              v-else
              size="sm"
              variant="primary"
              @click="store.unban(u.id).then(() => toast.success('Разбанен'))"
          >
            Разбанить
          </Button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
.toolbar__search { flex: 1; max-width: 320px; }
.toolbar__loading { margin-left: 8px; }
.table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.table th, .table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.table th { background: var(--surface-2); font-weight: 500; font-size: 13px; color: var(--text-muted); }
.table__actions { text-align: right; }
</style>