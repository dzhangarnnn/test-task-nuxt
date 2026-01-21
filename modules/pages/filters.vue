<template>
  <div class="filters-page">
    <h1>Фильтрация по индексам</h1>
    <p class="subtitle">Используйте индексы для быстрой фильтрации продуктов</p>

    <div class="filters-panel">
      <div class="filter-group">
        <label>Категория:</label>
        <select v-model="selectedCategory">
          <option value="">Все категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Тег:</label>
        <select v-model="selectedTag">
          <option value="">Все теги</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Ценовая категория:</label>
        <select v-model="selectedPriceCategory">
          <option value="">Все цены</option>
          <option value="cheap">Дешёвые (&lt; 1000₽)</option>
          <option value="medium">Средние (1000-5000₽)</option>
          <option value="expensive">Дорогие (5000-20000₽)</option>
          <option value="premium">Премиум (&gt; 20000₽)</option>
        </select>
      </div>

      <button @click="resetFilters" class="btn">Сбросить</button>
    </div>

    <div class="results-info">
      <span>Найдено: <strong>{{ filteredProducts.length }}</strong> продуктов</span>
      <span class="query-time" v-if="queryTime">Время запроса: {{ queryTime }}мс</span>
    </div>

    <div class="products-grid" v-if="filteredProducts.length">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <div class="product-meta">
          <span class="price">{{ formatPrice(product.price) }}</span>
          <span class="category" v-if="product.categoryId">
            {{ getCategoryName(product.categoryId) }}
          </span>
        </div>
        <div class="product-tags" v-if="getProductTags(product.id!).length">
          <span 
            v-for="tag in getProductTags(product.id!)" 
            :key="tag.id"
            class="tag"
            :style="{ background: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>Продукты не найдены по заданным фильтрам</p>
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

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const relations = ref<Record<string, { categoryId: string | null, tagIds: string[] }>>({})

const categoryIndex = ref<Record<string, string[]>>({})
const tagIndex = ref<Record<string, string[]>>({})
const priceIndex = ref<Record<string, { priceCategory: string }>>({})

const selectedCategory = ref('')
const selectedTag = ref('')
const selectedPriceCategory = ref('')
const queryTime = ref(0)

onMounted(() => {
  subscribeList<Product>('products', (data) => {
    products.value = data
  })
  
  subscribeList<Category>('categories', (data) => {
    categories.value = data
  })
  
  subscribeList<Tag>('tags', (data) => {
    tags.value = data
  })

  subscribe<Record<string, { categoryId: string | null, tagIds: string[] }>>('relations', (data) => {
    relations.value = data || {}
  })

  subscribe<Record<string, string[]>>('indexes/categoryProducts', (data) => {
    categoryIndex.value = data || {}
  })
  
  subscribe<Record<string, string[]>>('indexes/tagProducts', (data) => {
    tagIndex.value = data || {}
  })

  subscribe<Record<string, { priceCategory: string }>>('filters/byPrice', (data) => {
    priceIndex.value = data || {}
  })
})

const filteredProducts = computed(() => {
  const start = performance.now()
  
  let productIds: Set<string> | null = null

  if (selectedCategory.value) {
    const ids = categoryIndex.value[selectedCategory.value] || []
    productIds = new Set(ids)
  }

  if (selectedTag.value) {
    const ids = tagIndex.value[selectedTag.value] || []
    if (productIds) {
      productIds = new Set([...productIds].filter(id => ids.includes(id)))
    } else {
      productIds = new Set(ids)
    }
  }

  if (selectedPriceCategory.value) {
    const ids = Object.entries(priceIndex.value)
      .filter(([_, data]) => data.priceCategory === selectedPriceCategory.value)
      .map(([id]) => id)
    
    if (productIds) {
      productIds = new Set([...productIds].filter(id => ids.includes(id)))
    } else {
      productIds = new Set(ids)
    }
  }

  let result: Product[]
  if (productIds === null) {
    result = products.value
  } else {
    result = products.value.filter(p => productIds!.has(p.id!))
  }

  queryTime.value = Math.round(performance.now() - start)
  return result
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

const getCategoryName = (id: string) => {
  return categories.value.find(c => c.id === id)?.name || ''
}

const getProductTags = (productId: string): Tag[] => {
  const rel = relations.value[productId]
  if (!rel?.tagIds) return []
  return tags.value.filter(t => rel.tagIds.includes(t.id!))
}

const resetFilters = () => {
  selectedCategory.value = ''
  selectedTag.value = ''
  selectedPriceCategory.value = ''
}
</script>

<style scoped>
.filters-page {
  max-width: 1200px;
}

.filters-page h1 {
  margin: 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin: 0.5rem 0 2rem 0;
}

.filters-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 180px;
  font-size: 0.95rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #ddd;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background: #ccc;
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #666;
}

.query-time {
  font-size: 0.85rem;
  color: #999;
  background: #e8f5e9;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.price {
  font-weight: 600;
  color: #3a3a6e;
}

.category {
  font-size: 0.85rem;
  color: #999;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.8rem;
}

.empty-state {
  background: white;
  padding: 3rem;
  text-align: center;
  border-radius: 12px;
  color: #666;
}
</style>
