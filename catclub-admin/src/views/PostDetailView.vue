<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi } from '@/api'
import type { Post } from '@/api/types'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const post = ref<Post | null>(null)
const loading = ref(true)
const editing = ref(false)
const draft = ref({ title: '', body: '', category: '' })
const saving = ref(false)

onMounted(async () => {
  try {
    post.value = await postsApi.get(route.params.id as string)
    if (post.value) {
      draft.value = {
        title: post.value.title,
        body: post.value.body,
        category: post.value.category,
      }
    }
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!post.value) return
  saving.value = true
  try {
    const updated = await postsApi.update(post.value.id, draft.value)
    post.value = updated
    editing.value = false
    toast.success('Изменения сохранены')
  } catch {
    toast.danger('Не удалось сохранить')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="center"><Spinner /></div>
  <div v-else-if="!post" class="center">Пост не найден</div>
  <div v-else class="post">
    <header class="post__header">
      <button class="back" @click="router.back()">← Назад</button>
      <div class="post__title">
        <h1>{{ post.title }}</h1>
        <Badge :tone="post.status === 'published' ? 'success' : post.status === 'removed' ? 'danger' : 'warning'">
          {{ post.status }}
        </Badge>
      </div>
      <div class="post__actions">
        <Button v-if="!editing" variant="default" @click="editing = true">Редактировать</Button>
        <template v-else>
          <Button variant="ghost" @click="editing = false">Отмена</Button>
          <Button variant="primary" :disabled="saving" @click="save">Сохранить</Button>
        </template>
      </div>
    </header>

    <div class="post__meta">
      <div>Автор: <b>{{ post.author.nickname }}</b></div>
      <div>Категория: {{ post.category }}</div>
      <div>Жалоб: {{ post.reportsCount }}</div>
      <div>Создан: {{ new Date(post.createdAt).toLocaleString() }}</div>
    </div>

    <hr />

    <div v-if="!editing" class="post__body">{{ post.body }}</div>
    <div v-else class="post__edit">
      <label>Заголовок<input v-model="draft.title" /></label>
      <label>Категория<input v-model="draft.category" /></label>
      <label>Текст<textarea v-model="draft.body" rows="8"></textarea></label>
    </div>

    <div v-if="post.removedReason" class="post__reason">
      Причина удаления: <b>{{ post.removedReason }}</b>
    </div>
  </div>
</template>

<style scoped>
.center { text-align: center; padding: 40px; color: var(--text-muted); }
.post { max-width: 720px; }
.post__header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.post__title { flex: 1; display: flex; align-items: center; gap: 10px; }
.post__title h1 { margin: 0; }
.post__actions { display: flex; gap: 8px; }
.post__meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: var(--text-muted); font-size: 13px; }
.post__body { white-space: pre-wrap; line-height: 1.6; }
.post__edit { display: flex; flex-direction: column; gap: 12px; }
.post__edit label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-muted); }
.post__edit textarea { resize: vertical; }
.post__reason { margin-top: 16px; padding: 10px 14px; background: #fde8e8; border-radius: var(--radius); color: var(--danger); }
.back { background: transparent; border: none; cursor: pointer; color: var(--primary); font-size: 14px; }
</style>