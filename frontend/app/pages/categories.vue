<template>
  <div class="crud-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Категории</h1>
        <p class="page-subtitle">Организация продуктов по категориям</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <span>+</span> Добавить
      </button>
    </div>

    <div class="table-card" v-if="categories.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Создана</th>
            <th width="100">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td class="cell-name">{{ category.name }}</td>
            <td class="cell-desc">{{ category.description || '—' }}</td>
            <td class="cell-date">{{ formatDate(category.createdAt) }}</td>
            <td class="cell-actions">
              <button @click="openModal(category)" class="btn-icon" title="Редактировать">✏️</button>
              <button @click="deleteItem(category.id!)" class="btn-icon btn-icon-danger" title="Удалить">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📁</div>
      <p class="empty-title">Категории не найдены</p>
      <p class="empty-hint">Создайте первую категорию для организации продуктов</p>
    </div>

    <!-- Модальное окно -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Редактировать' : 'Добавить' }} категорию</h2>
            <button @click="closeModal" class="modal-close">×</button>
          </div>
          <form @submit.prevent="saveItem" class="modal-body">
            <div class="form-group">
              <label>Название</label>
              <input v-model="form.name" type="text" placeholder="Введите название" required />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="form.description" rows="3" placeholder="Введите описание"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">Отмена</button>
              <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types'

const { getList } = useDatabaseRest()
const { data: initialCategories } = await useAsyncData<Category[]>(
  'categories',
  () => getList<Category>('categories'),
  { default: () => [] }
)

const { subscribeList, pushData, setData, removeData } = useDatabase()

const categories = ref<Category[]>(initialCategories.value ?? [])
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
.crud-page {
  max-width: 1000px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: #3a3a6e;
  color: white;
}

.btn-primary:hover {
  background: #4a4a8e;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.cell-name {
  font-weight: 500;
  color: #1a1a2e;
}

.cell-desc {
  color: #666;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-date {
  color: #888;
  white-space: nowrap;
}

.cell-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background: #e9ecef;
}

.btn-icon-danger:hover {
  background: #fee2e2;
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
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 1.2rem;
  color: #1a1a2e;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  border-radius: 8px;
  font-size: 1.5rem;
  color: #666;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3a3a6e;
  box-shadow: 0 0 0 3px rgba(58, 58, 110, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #adb5bd;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  margin-top: 0.5rem;
}
</style>
