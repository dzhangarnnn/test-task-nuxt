<template>
  <div class="relations-page">
    <h1>Связи продуктов</h1>
    <p class="subtitle">Привяжите продукты к категориям и тегам</p>

    <div class="relations-container" v-if="products.length">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span class="price">{{ formatPrice(product.price) }}</span>
        </div>

        <div class="relation-section">
          <label>Категория:</label>
          <select 
            :value="getProductCategory(product.id!)"
            @change="updateCategory(product.id!, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Не выбрана —</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="relation-section">
          <label>Теги:</label>
          <div class="tags-selector">
            <label 
              v-for="tag in tags" 
              :key="tag.id" 
              class="tag-checkbox"
              :style="{ '--tag-color': tag.color }"
            >
              <input 
                type="checkbox" 
                :checked="isTagSelected(product.id!, tag.id!)"
                @change="toggleTag(product.id!, tag.id!)"
              />
              <span class="tag-label">{{ tag.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>Сначала добавьте продукты</p>
      <NuxtLink to="/products" class="btn btn-primary">Перейти к продуктам</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, Tag } from '~/types'

const { subscribeList, setData, getData } = useDatabase()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const relations = ref<Record<string, { categoryId: string | null, tagIds: string[] }>>({})

onMounted(() => {
  subscribeList<Product>('products', (data) => { products.value = data })
  subscribeList<Category>('categories', (data) => { categories.value = data })
  subscribeList<Tag>('tags', (data) => { tags.value = data })
  loadRelations()
})

const loadRelations = async () => {
  const data = await getData<Record<string, { categoryId: string | null, tagIds: string[] }>>('relations')
  if (data) relations.value = data
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(price)
}

const getProductCategory = (productId: string): string => {
  return relations.value[productId]?.categoryId || ''
}

const isTagSelected = (productId: string, tagId: string): boolean => {
  return relations.value[productId]?.tagIds?.includes(tagId) || false
}

const updateCategory = async (productId: string, categoryId: string) => {
  const current = relations.value[productId] || { categoryId: null, tagIds: [] }
  const updated = { ...current, categoryId: categoryId || null }
  relations.value[productId] = updated
  await setData(`relations/${productId}`, updated)
  await updateReverseIndex()
}

const toggleTag = async (productId: string, tagId: string) => {
  const current = relations.value[productId] || { categoryId: null, tagIds: [] }
  let tagIds = [...(current.tagIds || [])]
  
  if (tagIds.includes(tagId)) {
    tagIds = tagIds.filter(id => id !== tagId)
  } else {
    tagIds.push(tagId)
  }
  
  const updated = { ...current, tagIds }
  relations.value[productId] = updated
  await setData(`relations/${productId}`, updated)
  await updateReverseIndex()
}

// Обновление reverse index (в продакшене это делает Cloud Function)
const updateReverseIndex = async () => {
  const categoryProducts: Record<string, string[]> = {}
  const tagProducts: Record<string, string[]> = {}
  
  for (const [productId, rel] of Object.entries(relations.value)) {
    if (rel.categoryId) {
      if (!categoryProducts[rel.categoryId]) categoryProducts[rel.categoryId] = []
      categoryProducts[rel.categoryId].push(productId)
    }
    for (const tagId of rel.tagIds || []) {
      if (!tagProducts[tagId]) tagProducts[tagId] = []
      tagProducts[tagId].push(productId)
    }
  }
  
  await setData('indexes/categoryProducts', categoryProducts)
  await setData('indexes/tagProducts', tagProducts)
}
</script>

<style scoped>
.relations-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
.product-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
.relation-section { margin-bottom: 1rem; }
.relation-section > label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
.relation-section select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
.tags-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: #f5f5f5; border-radius: 20px; cursor: pointer; border: 2px solid transparent; }
.tag-checkbox:has(input:checked) { background: color-mix(in srgb, var(--tag-color) 15%, white); border-color: var(--tag-color); }
.tag-checkbox input { display: none; }
</style>