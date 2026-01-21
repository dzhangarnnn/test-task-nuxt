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
      <div class="page-wrapper">
        <slot />
      </div>
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
  width: 260px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #eee;
  padding: 1.5rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 0.5rem 0 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.logo h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 500;
}

.nav-icon {
  font-size: 1.15rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-wrapper {
  padding: 2rem 3rem;
  max-width: 1400px;
}

@media (max-width: 1200px) {
  .page-wrapper {
    padding: 1.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding: 1rem;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .page-wrapper {
    padding: 1.5rem;
  }
  
  .nav-menu {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>