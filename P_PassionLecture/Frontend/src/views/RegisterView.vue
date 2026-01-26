<template>
  <div class="register-container">
    
    <main class="register-content">
      <div class="register-card">
        <h2 class="register-title">Inscription</h2>
        <SimpleTextForm 
          :fields="fields"
          :submitLabel="'Confirmer'"
          @submit="handleSubmit"
        />
        <p class="login-link">
          Vous avez déjà un compte ? <router-link to="/login">Se Connecter</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleTextForm from '@/components/formulaire/RegisterForm.vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type User } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const REGISTER_URL = 'http://localhost:3333/user/register'

const fields = [
  {
    name: 'username',
    label: 'Nom Utilisateur',
    type: 'text',
    placeholder: '',
  },
  {
    name: 'password',
    label: 'Mot de passe',
    type: 'password',
    placeholder: '',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmer Mot de passe',
    type: 'password',
    placeholder: '',
  },
]

type RegisterFormData = {
  username: string
  password: string
  confirmPassword: string
}

async function handleSubmit(data: RegisterFormData) {
  if (data.password !== data.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }

  try {
    // on retire confirmPassword avant envoi
    const { confirmPassword, ...registerData } = data

    const res = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Erreur lors de l’inscription')
    }
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
.register-container {
  display: flex;
  flex-direction: column;
  min-height: 75vh;
}

.register-content {
  flex: 1;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 15px;
  position: relative;
}

.register-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
  max-width: 460px;
  padding: 40px 45px;
  border-radius: 12px;
  border: 2px solid #0088cc;
  box-shadow: 0 8px 24px rgba(0, 136, 204, 0.15);
  animation: fadeUp 0.4s ease-out;
  position: relative;
  z-index: 1;
}

.register-title {
  text-align: center;
  margin-bottom: 28px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #0088cc;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>