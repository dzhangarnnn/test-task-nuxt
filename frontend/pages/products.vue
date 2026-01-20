<template>
  <div class="crud-page">
    <div class="page-header">
      <h1>Продукты</h1>
      <button @click="openModal()" class="btn btn-primary">+ Добавить</button>
    </div>

    <div class="table-container" v-if="products.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td class="actions">
              <button @click="openModal(product)" class="btn btn-sm">✏️</button>
              <button @click="deleteItem(product.id!)" class="btn btn-sm btn-danger">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else>
      <p>Продукты не найдены. Добавьте первый продукт!</p>
    </div>

    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Редактировать' : 'Добавить' }} продукт</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Цена</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const { subscribeList, pushData, setData, removeData } = useDatabase()

const products = ref<Product[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  price: 0
})

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  subscribeList<Product>('products', (data) => {
    products.value = data
  })
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

const openModal = (product?: Product) => {
  if (product) {
    editingId.value = product.id!
    form.value = {
      name: product.name,
      description: product.description,
      price: product.price
    }
  } else {
    editingId.value = null
    form.value = { name: '', description: '', price: 0 }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  form.value = { name: '', description: '', price: 0 }
}

const saveItem = async () => {
  const now = Date.now()
  
  if (isEditing.value) {
    const existing = products.value.find(p => p.id === editingId.value)
    await setData(`products/${editingId.value}`, {
      ...form.value,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    })
  } else {
    await pushData('products', {
      ...form.value,
      createdAt: now,
      updatedAt: now
    })
  }
  
  closeModal()
}

const deleteItem = async (id: string) => {
  if (confirm('Удалить этот продукт?')) {
    await removeData(`products/${id}`)
  }
}
</script>

<style scoped>
.crud-page { max-width: 1000px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; background: #ddd; }
.btn-primary { background: #3a3a6e; color: white; }
.btn-danger { background: #dc3545; color: white; }
.btn-sm { padding: 0.25rem 0.5rem; }
.table-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background: #f8f8f8; font-weight: 600; }
.data-table td.actions { display: flex; gap: 0.5rem; }
.empty-state { background: white; padding: 3rem; text-align: center; border-radius: 8px; color: #666; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
.form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
</style>