export interface Product {
  id?: string
  name: string
  description: string
  price: number
  categoryId?: string
  tagIds?: string[]
  createdAt: number
  updatedAt: number
}

export interface Category {
  id?: string
  name: string
  description: string
  createdAt: number
}

export interface Tag {
  id?: string
  name: string
  color: string
  createdAt: number
}

export interface MenuItem {
  label: string
  to: string
  icon?: string
}