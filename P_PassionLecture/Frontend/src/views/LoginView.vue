<template>
  <div class="login-container">
    <main class="login-content">
      <div class="login-card">
        <h2 class="login-title">Connexion</h2>
        <SimpleTextForm :fields="fields" @submit="handleSubmit" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleTextForm from '@/components/formulaire/LoginForm.vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type User } from '@/stores/auth.ts'

const router = useRouter()
const auth = useAuthStore()

const fields = [
  {
    name: 'username',
    label: "Nom d'utilisateur",
    type: 'text',
    placeholder: "Entrez votre nom d'utilisateur",
  },
  {
    name: 'password',
    label: 'Mot de passe',
    type: 'password',
    placeholder: 'Entrez votre mot de passe',
  },
]

const LOGIN_URL = 'http://localhost:3333/user/login'

async function handleSubmit(data: { username: string; password: string }) {
  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) throw new Error('Identifiants incorrects')
    const result = await res.json()

    localStorage.setItem('authToken', result.token.token)

    const user: User = {
      id: result.id,
      username: result.username,
    }

    localStorage.setItem('currentUser', JSON.stringify(user))

    auth.login(user)

    router.push('/')
  } catch (err: any) {
    alert(err.message)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  min-height: 75vh;
}

.login-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 15px;
}

.login-card {
  background: #fff;
  width: 100%;
  max-width: 420px;
  padding: 36px 40px;
  border-radius: 18px;
  border: 1px solid #d8e9ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeUp 0.4s ease-out;
}

.login-title {
  text-align: center;
  margin-bottom: 22px;
  color: #005a91;
  font-size: 24px;
  font-weight: 700;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
