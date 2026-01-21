import type { MenuItem } from '~/types'

const baseMenuItems: MenuItem[] = [
  { label: 'Главная', to: '/', icon: '🏠' },
  { label: 'Продукты', to: '/products', icon: '📦' },
  { label: 'Категории', to: '/categories', icon: '📁' },
  { label: 'Теги', to: '/tags', icon: '🏷️' },
  { label: 'Связи', to: '/relations', icon: '🔗' }
]

const menuItems = ref<MenuItem[]>([...baseMenuItems])

export const useMenu = () => {
  const addMenuItems = (items: MenuItem[]) => {
    const existingPaths = new Set(menuItems.value.map(i => i.to))
    const newItems = items.filter(i => !existingPaths.has(i.to))
    menuItems.value = [...menuItems.value, ...newItems]
  }

  const removeMenuItems = (paths: string[]) => {
    menuItems.value = menuItems.value.filter(i => !paths.includes(i.to))
  }

  const resetMenu = () => {
    menuItems.value = [...baseMenuItems]
  }

  return {
    menuItems: readonly(menuItems),
    addMenuItems,
    removeMenuItems,
    resetMenu
  }
}