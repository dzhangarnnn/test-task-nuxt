<template>
  <div class="crud-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Теги</h1>
        <p class="page-subtitle">Цветовые метки для продуктов</p>
      </div>
      <button @click="openModal()" class="btn btn-primary">
        <span>+</span> Добавить
      </button>
    </div>

    <div class="tags-grid" v-if="tags.length">
      <div v-for="tag in tags" :key="tag.id" class="tag-card">
        <div class="tag-color" :style="{ background: tag.color }"></div>
        <div class="tag-info">
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-date">Создан {{ formatDate(tag.createdAt) }}</span>
        </div>
        <div class="tag-actions">
          <button @click="openModal(tag)" class="btn-icon" title="Редактировать">✏️</button>
          <button @click="deleteItem(tag.id!)" class="btn-icon btn-icon-danger" title="Удалить">🗑️</button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">🏷️</div>
      <p class="empty-title">Теги не найдены</p>
      <p class="empty-hint">Создайте первый тег для маркировки продуктов</p>
    </div>

    <!-- Модальное окно -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Редактировать' : 'Добавить' }} тег</h2>
            <button @click="closeModal" class="modal-close">×</button>
          </div>
          <form @submit.prevent="saveItem" class="modal-body">
            <div class="form-group">
              <label>Название</label>
              <input v-model="form.name" type="text" placeholder="Введите название" required />
            </div>
            <div class="form-group">
              <label>Цвет</label>
              <div class="color-picker">
                <input v-model="form.color" type="color" class="color-input" />
                <div class="color-presets">
                  <button 
                    v-for="color in presetColors" 
                    :key="color"
                    type="button"
                    class="color-btn"
                    :class="{ active: form.color === color }"
                    :style="{ background: color }"
                    @click="form.color = color"
                  ></button>
                </div>
                <span class="color-hex">{{ form.color }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Предпросмотр</label>
              <div class="preview-box">
                <span class="preview-tag" :style="{ background: form.color }">
                  {{ form.name || 'Название тега' }}
                </span>
              </div>
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
import type { Tag } from '~/types'

const { subscribeList, pushData, setData, removeData } = useDatabase()

const tags = ref<Tag[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)

const presetColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#607d8b']

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
    form.value = { name: tag.name, color: tag.color }
  } else {
    editingId.value = null
    const randomColor = presetColors[Math.floor(Math.random() * presetColors.length)] ?? '#3498db'
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

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tag-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tag-color {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.tag-info {
  flex: 1;
  min-width: 0;
}

.tag-name {
  display: block;
  font-weight: 600;
  color: #1a1a2e;
  font-size: 1rem;
}

.tag-date {
  font-size: 0.8rem;
  color: #999;
}

.tag-actions {
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

.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3a3a6e;
  box-shadow: 0 0 0 3px rgba(58, 58, 110, 0.1);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-input {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
}

.color-presets {
  display: flex;
  gap: 0.4rem;
}

.color-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #1a1a2e;
}

.color-hex {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
}

.preview-box {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-tag {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
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
