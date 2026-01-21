<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>📊 CRUD App</h2>
      </div>
      <nav class="nav-menu">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { menuItems } = useMenu()
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #eee;
  padding: 1rem;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 1rem 0;
  border-bottom: 1px solid #333;
  margin-bottom: 1rem;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ccc;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #2a2a4e;
  color: #fff;
}

.nav-item.router-link-active {
  background: #3a3a6e;
  color: #fff;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}
</style>