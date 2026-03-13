<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'

const router = useRouter()
const auth   = useAuthStore()

const searchQuery = ref('')

const LOGOUT_URL = 'http://localhost:3333/user/logout'

async function handleLogout() {
  try {
    const token = localStorage.getItem('authToken')
    await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (err) {
    console.error(err)
  } finally {
    auth.logout()
    router.push('/')
  }
}

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}
</script>

<template>
  <header class="top-bar">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">📚</div>
      <router-link :to="{ name: 'home' }" class="logo-text">ReadME</router-link>
    </div>

    <!-- Navigation principale -->
    <nav class="main-nav">
      <ul>
        <li><router-link :to="{ name: 'home' }">Accueil</router-link></li>
        <li><router-link :to="{ name: 'categories' }">Livres</router-link></li>
      </ul>
    </nav>

    <!-- Barre de recherche -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher…"
        id="header-search-input"
        @keyup.enter="handleSearch"
      />
      <button id="header-search-btn" @click="handleSearch" aria-label="Rechercher">🔍</button>
    </div>

    <!-- Boutons d'authentification -->
    <div v-if="auth.isLoggedIn" class="auth-buttons">
      <router-link :to="{ name: 'catalogue' }" class="auth-link">Mes Livres</router-link>
      <button class="auth-button logout-btn" @click="handleLogout">Se déconnecter</button>
    </div>
    <div v-else class="auth-buttons">
      <router-link :to="{ name: 'register' }" class="auth-link">S'enregistrer</router-link>
      <router-link :to="{ name: 'login' }" class="auth-button">Connexion</router-link>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: #8ad6ff;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

/* ── Logo ────────────────────────────────── */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.logo-icon {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ac0ff, #ff6fb5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.logo-text {
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
  text-decoration: none;
}

/* ── Navigation ──────────────────────────── */
.main-nav ul {
  list-style: none;
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0;
}
.main-nav a {
  text-decoration: none;
  color: #0172c5;
  font-weight: 600;
  font-size: 1rem;
  padding: 5px 12px;
  border-radius: 12px;
  transition: background .2s;
}
.main-nav a:hover,
.main-nav a.router-link-active {
  background: rgba(255, 255, 255, .7);
}

/* ── Search bar ──────────────────────────── */
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 99px;
  border: 1.5px solid #9ccfff;
  overflow: hidden;
  flex: 0 1 220px;
  transition: border-color .2s;
}
.search-bar:focus-within { border-color: #0172c5; }
.search-bar input {
  border: none;
  outline: none;
  padding: 6px 12px;
  font-size: .88rem;
  background: transparent;
  width: 100%;
  min-width: 0;
}
.search-bar button {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: .95rem;
  color: #0172c5;
  transition: color .2s;
}
.search-bar button:hover { color: #005fa3; }

/* ── Auth buttons ─────────────────────────── */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.auth-link {
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 99px;
  border: 2px solid #0172c5;
  background: #e9f4ff;
  color: #0172c5;
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  transition: background .2s;
}
.auth-link:hover { background: #d0e9ff; }

.auth-button {
  cursor: pointer;
  padding: 5px 14px;
  border-radius: 99px;
  border: 2px solid #0172c5;
  background: #fff;
  color: #0172c5;
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  transition: background .2s;
}
.auth-button:hover { background: #e9f4ff; }

.logout-btn { background: transparent; }
.logout-btn:hover { background: rgba(255, 255, 255, .5); }

/* ── Responsive ──────────────────────────── */
@media (max-width: 800px) {
  .top-bar   { flex-direction: column; align-items: flex-start; }
  .main-nav ul { flex-direction: column; gap: 6px; }
  .search-bar { flex: 1 1 100%; }
}
</style>
