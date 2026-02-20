<template>
  <div class="relations-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Связи продуктов</h1>
        <p class="page-subtitle">Привяжите продукты к категориям и тегам</p>
      </div>
    </div>

    <div class="relations-grid" v-if="products.length">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span class="price">{{ formatPrice(product.price) }}</span>
        </div>

        <div class="relation-group">
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

        <div class="relation-group">
          <label>Теги:</label>
          <div class="tags-select">
            <label 
              v-for="tag in tags" 
              :key="tag.id" 
              class="tag-option"
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
      <div class="empty-icon">🔗</div>
      <p class="empty-title">Продукты не найдены</p>
      <p class="empty-hint">Сначала добавьте продукты для настройки связей</p>
      <NuxtLink to="/products" class="btn btn-primary">Перейти к продуктам</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, Tag } from '~/types'

type RelationMap = Record<string, { categoryId: string | null; tagIds: string[] }>

const { getList, getData } = useDatabaseRest()

const [
  { data: initialProducts },
  { data: initialCategories },
  { data: initialTags },
  { data: initialRelations }
] = await Promise.all([
  useAsyncData<Product[]>('rel-products', () => getList<Product>('products'), { default: () => [] }),
  useAsyncData<Category[]>('rel-categories', () => getList<Category>('categories'), { default: () => [] }),
  useAsyncData<Tag[]>('rel-tags', () => getList<Tag>('tags'), { default: () => [] }),
  useAsyncData<RelationMap | null>('rel-relations', () => getData<RelationMap>('relations'), { default: () => null }),
])

const products = ref<Product[]>(initialProducts.value ?? [])
const categories = ref<Category[]>(initialCategories.value ?? [])
const tags = ref<Tag[]>(initialTags.value ?? [])
const relations = ref<RelationMap>(initialRelations.value ?? {})

const { subscribeList, setData } = useDatabase()

onMounted(() => {
  subscribeList<Product>('products', (data) => { products.value = data })
  subscribeList<Category>('categories', (data) => { categories.value = data })
  subscribeList<Tag>('tags', (data) => { tags.value = data })
})

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

const updateReverseIndex = async () => {
  const categoryProducts: Record<string, string[]> = {}
  const tagProducts: Record<string, string[]> = {}
  
  for (const [productId, rel] of Object.entries(relations.value)) {
    if (!rel) continue
    if (rel.categoryId) {
      categoryProducts[rel.categoryId] = categoryProducts[rel.categoryId] || []
      categoryProducts[rel.categoryId]!.push(productId)
    }
    (rel.tagIds || []).forEach(tagId => {
      tagProducts[tagId] = tagProducts[tagId] || []
      tagProducts[tagId].push(productId)
    })
  }
  
  await setData('indexes/categoryProducts', categoryProducts)
  await setData('indexes/tagProducts', tagProducts)
}
</script>

<style scoped>
.relations-page {
  max-width: 1000px;
}

.page-header {
  margin-bottom: 1.5rem;
}

.relations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.product-header h3 {
  font-size: 1.1rem;
  color: #1a1a2e;
}

.price {
  color: #3a3a6e;
  font-weight: 600;
}

.relation-group {
  margin-bottom: 1rem;
}

.relation-group > label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.relation-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

.relation-group select:focus {
  outline: none;
  border-color: #3a3a6e;
}

.tags-select {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.tag-option:hover {
  background: #eee;
}

.tag-option:has(input:checked) {
  background: color-mix(in srgb, var(--tag-color) 15%, white);
  border-color: var(--tag-color);
}

.tag-option input {
  display: none;
}

.tag-label {
  font-size: 0.9rem;
  color: #333;
}

.empty-state {
  background: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-hint {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #3a3a6e;
  color: white;
}

.btn-primary:hover {
  background: #4a4a8e;
}
</style>
