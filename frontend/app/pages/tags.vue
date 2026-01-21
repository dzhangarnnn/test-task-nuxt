<template>
  <div class="crud-page">
    <div class="page-header">
      <h1>Теги</h1>
      <button @click="openModal()" class="btn btn-primary">+ Добавить</button>
    </div>

    <div class="tags-grid" v-if="tags.length">
      <div 
        v-for="tag in tags" 
        :key="tag.id" 
        class="tag-card"
        :style="{ borderColor: tag.color }"
      >
        <div class="tag-color" :style="{ background: tag.color }"></div>
        <div class="tag-info">
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-date">{{ formatDate(tag.createdAt) }}</span>
        </div>
        <div class="tag-actions">
          <button @click="openModal(tag)" class="btn btn-sm">✏️</button>
          <button @click="deleteItem(tag.id!)" class="btn btn-sm btn-danger">🗑️</button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>Теги не найдены. Создайте первый тег!</p>
    </div>

    <!-- Модальное окно -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Редактировать' : 'Добавить' }} тег</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Цвет</label>
            <div class="color-picker">
              <input v-model="form.color" type="color" />
              <span class="color-value">{{ form.color }}</span>
            </div>
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
import type { Tag } from '~/types'

const { subscribeList, pushData, setData, removeData } = useDatabase()

const tags = ref<Tag[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)

const defaultColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

const form = ref({
  name: '',
  color: '#3498db'
})

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  subscribeList<Tag>('tags', (data) => {
    tags.value = data
  })
})

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('ru-RU')
}

const openModal = (tag?: Tag) => {
  if (tag) {
    editingId.value = tag.id!
    form.value = {
      name: tag.name,
      color: tag.color
    }
  } else {
    editingId.value = null
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)]!
    form.value = { name: '', color: randomColor }
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
    const existing = tags.value.find(t => t.id === editingId.value)
    await setData(`tags/${editingId.value}`, {
      ...form.value,
      createdAt: existing?.createdAt || now
    })
  } else {
    await pushData('tags', {
      ...form.value,
      createdAt: now
    })
  }
  
  closeModal()
}

const deleteItem = async (id: string) => {
  if (confirm('Удалить этот тег?')) {
    await removeData(`tags/${id}`)
  }
}
</script>

<style scoped>
.crud-page { max-width: 1000px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { margin: 0; color: #333; }

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.tag-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid;
}

.tag-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-info {
  flex: 1;
}

.tag-name {
  display: block;
  font-weight: 600;
  color: #333;
}

.tag-date {
  font-size: 0.85rem;
  color: #999;
}

.tag-actions {
  display: flex;
  gap: 0.5rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-picker input[type="color"] {
  width: 60px;
  height: 40px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}

.color-value {
  font-family: monospace;
  color: #666;
}

.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; background: #ddd; }
.btn:hover { background: #ccc; }
.btn-primary { background: #3a3a6e; color: white; }
.btn-primary:hover { background: #4a4a8e; }
.btn-danger { background: #dc3545; color: white; }
.btn-danger:hover { background: #c82333; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
.empty-state { background: white; padding: 3rem; text-align: center; border-radius: 8px; color: #666; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 400px; }
.modal h2 { margin: 0 0 1.5rem 0; color: #333; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.form-group input:focus { outline: none; border-color: #3a3a6e; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
</style>
