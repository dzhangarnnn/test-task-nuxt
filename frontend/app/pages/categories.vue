<template>
  <div class="crud-page">
    <div class="page-header">
      <h1>Категории</h1>
      <button @click="openModal()" class="btn btn-primary">+ Добавить</button>
    </div>

    <div class="table-container" v-if="categories.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Создана</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ category.description || '—' }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td class="actions">
              <button @click="openModal(category)" class="btn btn-sm">✏️</button>
              <button @click="deleteItem(category.id!)" class="btn btn-sm btn-danger">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else>
      <p>Категории не найдены. Создайте первую категорию!</p>
    </div>

    <!-- Модальное окно -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Редактировать' : 'Добавить' }} категорию</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" rows="3"></textarea>
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
import type { Category } from '~/types'

const { subscribeList, pushData, setData, removeData } = useDatabase()

const categories = ref<Category[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  description: ''
})

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  subscribeList<Category>('categories', (data) => {
    categories.value = data
  })
})

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('ru-RU')
}

const openModal = (category?: Category) => {
  if (category) {
    editingId.value = category.id!
    form.value = {
      name: category.name,
      description: category.description
    }
  } else {
    editingId.value = null
    form.value = { name: '', description: '' }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveItem = async () => {
  const now = Date.now()
  
  if (isEditing.value) {
    const existing = categories.value.find(c => c.id === editingId.value)
    await setData(`categories/${editingId.value}`, {
      ...form.value,
      createdAt: existing?.createdAt || now
    })
  } else {
    await pushData('categories', {
      ...form.value,
      createdAt: now
    })
  }
  
  closeModal()
}

const deleteItem = async (id: string) => {
  if (confirm('Удалить эту категорию?')) {
    await removeData(`categories/${id}`)
  }
}
</script>

<style scoped>
.crud-page { max-width: 1000px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { margin: 0; color: #333; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; background: #ddd; }
.btn:hover { background: #ccc; }
.btn-primary { background: #3a3a6e; color: white; }
.btn-primary:hover { background: #4a4a8e; }
.btn-danger { background: #dc3545; color: white; }
.btn-danger:hover { background: #c82333; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
.table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background: #f8f8f8; font-weight: 600; color: #333; }
.data-table td.actions { display: flex; gap: 0.5rem; }
.empty-state { background: white; padding: 3rem; text-align: center; border-radius: 8px; color: #666; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal h2 { margin: 0 0 1.5rem 0; color: #333; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
.form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3a3a6e; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
</style>
