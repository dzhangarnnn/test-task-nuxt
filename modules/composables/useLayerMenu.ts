const layerMenuItems = [
  { label: 'Индексы', to: '/indexes', icon: '🔍' },
  { label: 'Фильтры', to: '/filters', icon: '⚡' }
]

export const useLayerMenu = () => {
  const { addMenuItems, removeMenuItems } = useMenu()

  const registerMenuItems = () => {
    addMenuItems(layerMenuItems)
  }

  const unregisterMenuItems = () => {
    removeMenuItems(layerMenuItems.map(i => i.to))
  }

  return { layerMenuItems, registerMenuItems, unregisterMenuItems }
}