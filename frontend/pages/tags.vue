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
const defaultColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']

const form = ref({ name: '', color: '#3498db' })

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  subscribeList<Tag>('tags', (data) => { tags.value = data })
})

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('ru-RU')

const openModal = (tag?: Tag) => {
  if (tag) {
    editingId.value = tag.id!
    form.value = { name: tag.name, color: tag.color }
  } else {
    editingId.value = null
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)]
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
    await setData(`tags/${editingId.value}`, { ...form.value, createdAt: existing?.createdAt || now })
  } else {
    await pushData('tags', { ...form.value, createdAt: now })
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
.tags-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.tag-card { background: white; border-radius: 8px; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid; }
.tag-color { width: 40px; height: 40px; border-radius: 50%; }
.tag-info { flex: 1; }
.tag-name { display: block; font-weight: 600; color: #333; }
.tag-date { font-size: 0.85rem; color: #999; }
.color-picker { display: flex; align-items: center; gap: 1rem; }
.color-picker input[type="color"] { width: 60px; height: 40px; border: none; cursor: pointer; border-radius: 6px; }
</style>