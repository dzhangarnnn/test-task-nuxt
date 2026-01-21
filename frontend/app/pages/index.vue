<template>
  <div class="home-page">
    <h1>Добро пожаловать</h1>
    <p>Приложение для управления продуктами, категориями и тегами.</p>
    
    <div class="stats">
      <div class="stat-card">
        <span class="stat-value">{{ stats.products }}</span>
        <span class="stat-label">Продуктов</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.categories }}</span>
        <span class="stat-label">Категорий</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.tags }}</span>
        <span class="stat-label">Тегов</span>
      </div>
    </div>

    <div class="quick-actions">
      <h3>Быстрые действия</h3>
      <NuxtLink to="/products" class="action-btn">Управление продуктами</NuxtLink>
      <NuxtLink to="/relations" class="action-btn">Настроить связи</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { subscribeList } = useDatabase()

const stats = ref({ products: 0, categories: 0, tags: 0 })

onMounted(() => {
  subscribeList('products', (list: any[]) => { stats.value.products = list.length })
  subscribeList('categories', (list: any[]) => { stats.value.categories = list.length })
  subscribeList('tags', (list: any[]) => { stats.value.tags = list.length })
})
</script>

<style scoped>
.home-page {
  max-width: 800px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3a3a6e;
}

.stat-label {
  color: #666;
}

.quick-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.action-btn {
  display: inline-block;
  margin-right: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3a3a6e;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}

.action-btn:hover {
  background: #4a4a8e;
}
</style>