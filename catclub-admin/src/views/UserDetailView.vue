<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usersApi } from '@/api'
import type { User } from '@/api/types'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Modal from '@/components/ui/Modal.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const user = ref<User | null>(null)
const loading = ref(true)
const banModalOpen = ref(false)
const banForm = ref({ reason: '', durationHours: 24 as number | null })

onMounted(async () => {
  try {
    user.value = await usersApi.get(route.params.id as string)
  } finally {
    loading.value = false
  }
})

async function confirmBan() {
  if (!user.value) return
  await usersApi.ban({
    userId: user.value.id,
    reason: banForm.value.reason || 'нарушение правил',
    durationHours: banForm.value.durationHours,
  })
  user.value.status = 'banned'
  user.value.ban = {
    reason: banForm.value.reason,
    expiresAt: banForm.value.durationHours
        ? new Date(Date.now() + banForm.value.durationHours * 3600_000).toISOString()
        : null,
    createdAt: new Date().toISOString(),
  }
  banModalOpen.value = false
  toast.success('Пользователь забанен')
}

async function unban() {
  if (!user.value) return
  await usersApi.unban(user.value.id)
  user.value.status = 'active'
  user.value.ban = null
  toast.success('Пользователь разбанен')
}
</script>

<template>
  <div v-if="loading" class="center"><Spinner /></div>
  <div v-else-if="!user" class="center">Пользователь не найден</div>
  <div v-else class="user">
    <header class="user__header">
      <button class="back" @click="router.back()">← Назад</button>
      <h1>{{ user.nickname }}</h1>
      <Badge :tone="user.status === 'active' ? 'success' : user.status === 'banned' ? 'danger' : 'warning'">
        {{ user.status }}
      </Badge>
    </header>

    <div class="user__meta">
      <div>Email: <b>{{ user.email }}</b></div>
      <div>Постов: {{ user.postsCount }}</div>
      <div>Жалоб: {{ user.reportsCount }}</div>
      <div>Регистрация: {{ new Date(user.createdAt).toLocaleDateString() }}</div>
    </div>

    <div v-if="user.ban" class="user__ban">
      <div><b>Текущий бан:</b></div>
      <div>Причина: {{ user.ban.reason }}</div>
      <div>Истекает: {{ user.ban.expiresAt ? new Date(user.ban.expiresAt).toLocaleString() : 'навсегда' }}</div>
    </div>

    <hr />

    <div class="user__actions">
      <Button v-if="user.status !== 'banned'" variant="danger" @click="banModalOpen = true">
        Забанить
      </Button>
      <Button v-else variant="primary" @click="unban">Разбанить</Button>
    </div>

    <Modal v-model:open="banModalOpen" title="Забанить пользователя" @close="banModalOpen = false">
      <div class="form">
        <label>Причина<textarea v-model="banForm.reason" rows="3"></textarea></label>
        <label>Срок (часов, 0 = навсегда)<input v-model.number="banForm.durationHours" type="number" min="0" /></label>
      </div>
      <div class="modal-actions">
        <Button variant="ghost" @click="banModalOpen = false">Отмена</Button>
        <Button variant="danger" @click="confirmBan">Забанить</Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.center { text-align: center; padding: 40px; color: var(--text-muted); }
.user { max-width: 720px; }
.user__header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.user__header h1 { margin: 0; flex: 1; }
.user__meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: var(--text-muted); font-size: 13px; }
.user__ban { margin-top: 16px; padding: 12px 14px; background: #fde8e8; border-radius: var(--radius); color: var(--danger); }
.user__actions { margin-top: 16px; display: flex; gap: 8px; }
.form { display: flex; flex-direction: column; gap: 12px; }
.form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-muted); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.back { background: transparent; border: none; cursor: pointer; color: var(--primary); font-size: 14px; }
</style>