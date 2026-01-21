<template>
  <div class="indexes-page">
    <h1>Reverse Index</h1>
    <p class="subtitle">Просмотр обратных индексов для быстрого поиска</p>

    <div class="indexes-grid">
      <div class="index-card">
        <h2>📁 По категориям</h2>
        <div class="index-content" v-if="Object.keys(categoryIndex).length">
          <div 
            v-for="(productIds, categoryId) in categoryIndex" 
            :key="categoryId"
            class="index-item"
          >
            <div class="index-key">
              <strong>{{ getCategoryName(categoryId) }}</strong>
              <span class="count">{{ productIds.length }} продуктов</span>
            </div>
            <div class="index-values">
              <span 
                v-for="productId in productIds" 
                :key="productId"
                class="product-chip"
              >
                {{ getProductName(productId) }}
              </span>
            </div>
          </div>
        </div>
        <p class="empty" v-else>Индекс пуст</p>
      </div>

      <div class="index-card">
        <h2>🏷️ По тегам</h2>
        <div class="index-content" v-if="Object.keys(tagIndex).length">
          <div 
            v-for="(productIds, tagId) in tagIndex" 
            :key="tagId"
            class="index-item"
          >
            <div class="index-key">
              <span 
                class="tag-badge" 
                :style="{ background: getTagColor(tagId) }"
              >
                {{ getTagName(tagId) }}
              </span>
              <span class="count">{{ productIds.length }} продуктов</span>
            </div>
            <div class="index-values">
              <span 
                v-for="productId in productIds" 
                :key="productId"
                class="product-chip"
              >
                {{ getProductName(productId) }}
              </span>
            </div>
          </div>
        </div>
        <p class="empty" v-else>Индекс пуст</p>
      </div>
    </div>

    <div class="raw-data">
      <h3>Структура данных в RTDB</h3>
      <pre>{{ JSON.stringify({ categoryProducts: categoryIndex, tagProducts: tagIndex }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, Tag } from '~/types'

const { registerMenuItems } = useLayerMenu()
onMounted(() => {
  registerMenuItems()
})

const { subscribe, subscribeList } = useDatabase()

const categoryIndex = ref<Record<string, string[]>>({})
const tagIndex = ref<Record<string, string[]>>({})
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

onMounted(() => {
  subscribe<Record<string, string[]>>('indexes/categoryProducts', (data) => {
    categoryIndex.value = data || {}
  })
  
  subscribe<Record<string, string[]>>('indexes/tagProducts', (data) => {
    tagIndex.value = data || {}
  })

  subscribeList<Product>('products', (data) => {
    products.value = data
  })
  
  subscribeList<Category>('categories', (data) => {
    categories.value = data
  })
  
  subscribeList<Tag>('tags', (data) => {
    tags.value = data
  })
})

const getCategoryName = (id: string) => {
  return categories.value.find(c => c.id === id)?.name || id
}

const getTagName = (id: string) => {
  return tags.value.find(t => t.id === id)?.name || id
}

const getTagColor = (id: string) => {
  return tags.value.find(t => t.id === id)?.color || '#999'
}

const getProductName = (id: string) => {
  return products.value.find(p => p.id === id)?.name || id
}
</script>

<style scoped>
.indexes-page {
  max-width: 1200px;
}

.indexes-page h1 {
  margin: 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin: 0.5rem 0 2rem 0;
}

.indexes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.index-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.index-card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.index-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.index-item {
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
}

.index-key {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.index-key strong {
  color: #333;
}

.count {
  font-size: 0.85rem;
  color: #999;
}

.tag-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
}

.index-values {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.product-chip {
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 0.85rem;
  color: #555;
}

.empty {
  color: #999;
  text-align: center;
  padding: 2rem;
}

.raw-data {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.raw-data h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.raw-data pre {
  background: #1a1a2e;
  color: #a5d6ff;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
}
</style>
