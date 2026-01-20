import { onValueWritten } from 'firebase-functions/v2/database'
import { initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

initializeApp()

const db = getDatabase()

interface Relation {
  categoryId: string | null
  tagIds: string[]
}

interface Product {
  name: string
  price: number
  createdAt: number
  updatedAt: number
}

export const onRelationsChange = onValueWritten(
  '/relations/{productId}',
  async (event) => {
    const productId = event.params.productId
    const before = event.data.before.val() as Relation | null
    const after = event.data.after.val() as Relation | null

    if (before?.categoryId !== after?.categoryId) {
      if (before?.categoryId) {
        await removeFromIndex('indexes/categoryProducts', before.categoryId, productId)
      }
      if (after?.categoryId) {
        await addToIndex('indexes/categoryProducts', after.categoryId, productId)
      }
    }

    const oldTags = new Set(before?.tagIds || [])
    const newTags = new Set(after?.tagIds || [])

    for (const tagId of oldTags) {
      if (!newTags.has(tagId)) {
        await removeFromIndex('indexes/tagProducts', tagId, productId)
      }
    }
    for (const tagId of newTags) {
      if (!oldTags.has(tagId)) {
        await addToIndex('indexes/tagProducts', tagId, productId)
      }
    }
  }
)

async function addToIndex(path: string, key: string, productId: string) {
  const ref = db.ref(`${path}/${key}`)
  const snapshot = await ref.get()
  const current: string[] = snapshot.val() || []
  if (!current.includes(productId)) {
    current.push(productId)
    await ref.set(current)
  }
}

async function removeFromIndex(path: string, key: string, productId: string) {
  const ref = db.ref(`${path}/${key}`)
  const snapshot = await ref.get()
  const current: string[] = snapshot.val() || []
  const updated = current.filter(id => id !== productId)
  if (updated.length === 0) {
    await ref.remove()
  } else {
    await ref.set(updated)
  }
}

export const onProductChange = onValueWritten(
  '/products/{productId}',
  async (event) => {
    const productId = event.params.productId
    const product = event.data.after.val() as Product | null

    if (!product) {
      await db.ref(`filters/byPrice/${productId}`).remove()
      return
    }

    const priceCategory = getPriceCategory(product.price)
    await db.ref(`filters/byPrice/${productId}`).set({
      name: product.name,
      price: product.price,
      priceCategory,
      updatedAt: product.updatedAt
    })
  }
)

function getPriceCategory(price: number): string {
  if (price < 1000) return 'cheap'
  if (price < 5000) return 'medium'
  if (price < 20000) return 'expensive'
  return 'premium'
}