<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1 class="page-title">Добро пожаловать</h1>
      <p class="page-subtitle">Приложение для управления продуктами, категориями и тегами</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.products }}</span>
          <span class="stat-label">Продуктов</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.categories }}</span>
          <span class="stat-label">Категорий</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.tags }}</span>
          <span class="stat-label">Тегов</span>
        </div>
      </div>
    </div>

    <div class="quick-actions-card">
      <h2>Быстрые действия</h2>
      <div class="actions-grid">
        <NuxtLink to="/products" class="action-card">
          <span class="action-icon">📦</span>
          <div class="action-text">
            <span class="action-title">Управление продуктами</span>
            <span class="action-desc">Создание, редактирование и удаление</span>
          </div>
        </NuxtLink>
        <NuxtLink to="/categories" class="action-card">
          <span class="action-icon">📁</span>
          <div class="action-text">
            <span class="action-title">Управление категориями</span>
            <span class="action-desc">Организация по категориям</span>
          </div>
        </NuxtLink>
        <NuxtLink to="/relations" class="action-card">
          <span class="action-icon">🔗</span>
          <div class="action-text">
            <span class="action-title">Настройка связей</span>
            <span class="action-desc">Привязка к категориям и тегам</span>
          </div>
        </NuxtLink>
        <NuxtLink to="/filters" class="action-card">
          <span class="action-icon">⚡</span>
          <div class="action-text">
            <span class="action-title">Фильтрация</span>
            <span class="action-desc">Поиск по индексам</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getList } = useDatabaseRest()

const [
  { data: initialProducts },
  { data: initialCategories },
  { data: initialTags }
] = await Promise.all([
  useAsyncData<any[]>('stats-products', () => getList('products'), { default: () => [] }),
  useAsyncData<any[]>('stats-categories', () => getList('categories'), { default: () => [] }),
  useAsyncData<any[]>('stats-tags', () => getList('tags'), { default: () => [] }),
])

const stats = ref({
  products: initialProducts.value?.length ?? 0,
  categories: initialCategories.value?.length ?? 0,
  tags: initialTags.value?.length ?? 0
})

const { subscribeList } = useDatabase()
onMounted(() => {
  subscribeList('products', (list: any[]) => { stats.value.products = list.length })
  subscribeList('categories', (list: any[]) => { stats.value.categories = list.length })
  subscribeList('tags', (list: any[]) => { stats.value.tags = list.length })
})
</script>

<style scoped>
.home-page {
  max-width: 1000px;
}

.welcome-section {
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.25rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  border-radius: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.quick-actions-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.quick-actions-card h2 {
  font-size: 1.15rem;
  color: #1a1a2e;
  margin: 0 0 1.25rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.action-card:hover {
  background: #f0f2f5;
  border-color: #3a3a6e;
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.action-title {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 0.95rem;
}

.action-desc {
  font-size: 0.8rem;
  color: #666;
}
</style>
