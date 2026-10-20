<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const login = ref('')
const password = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  try {
    await auth.login(login.value, password.value)
    const next = (route.query.next as string) || '/queue'
    await router.replace(next)
  } catch {
    // error уже в auth.error
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="login" @submit.prevent="submit">
    <h1>Модерация · Вход</h1>
    <input v-model="login" placeholder="Логин" autocomplete="username" required />
    <input v-model="password" type="password" placeholder="Пароль" autocomplete="current-password" required />
    <p v-if="auth.error" class="err">{{ auth.error }}</p>
    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Входим…' : 'Войти' }}
    </button>
  </form>
</template>