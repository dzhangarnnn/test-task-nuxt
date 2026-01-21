import {
  ref as dbRef, get, set, push, update, remove, onValue,
  query, orderByChild, equalTo,
  type DatabaseReference, type Unsubscribe
} from 'firebase/database'

export const useDatabase = () => {
  const { initFirebase, getDb } = useFirebase()
  initFirebase()

  const getRef = (path: string): DatabaseReference => {
    const db = getDb()
    if (!db) throw new Error('Database not initialized')
    return dbRef(db, path)
  }

  const getData = async <T>(path: string): Promise<T | null> => {
    const snapshot = await get(getRef(path))
    return snapshot.exists() ? snapshot.val() : null
  }

  const getList = async <T extends { id?: string }>(path: string): Promise<T[]> => {
    const data = await getData<Record<string, T>>(path)
    if (!data) return []
    return Object.entries(data).map(([id, item]) => ({ ...item, id }))
  }

  const setData = async <T>(path: string, data: T): Promise<void> => {
    await set(getRef(path), data)
  }

  const pushData = async <T>(path: string, data: T): Promise<string> => {
    const newRef = push(getRef(path))
    await set(newRef, data)
    return newRef.key!
  }

  const updateData = async (path: string, data: Record<string, any>): Promise<void> => {
    await update(getRef(path), data)
  }

  const removeData = async (path: string): Promise<void> => {
    await remove(getRef(path))
  }

  const subscribe = <T>(path: string, callback: (data: T | null) => void): Unsubscribe => {
    return onValue(getRef(path), (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null)
    })
  }

  const subscribeList = <T extends { id?: string }>(
    path: string,
    callback: (data: T[]) => void
  ): Unsubscribe => {
    return onValue(getRef(path), (snapshot) => {
      if (!snapshot.exists()) {
        callback([])
        return
      }
      const data = snapshot.val()
      const list = Object.entries(data).map(([id, item]) => ({ ...(item as T), id }))
      callback(list)
    })
  }

  const queryByField = async <T extends { id?: string }>(
    path: string, field: string, value: string | number | boolean
  ): Promise<T[]> => {
    const db = getDb()
    if (!db) throw new Error('Database not initialized')
    const q = query(dbRef(db, path), orderByChild(field), equalTo(value))
    const snapshot = await get(q)
    if (!snapshot.exists()) return []
    const data = snapshot.val()
    return Object.entries(data).map(([id, item]) => ({ ...(item as T), id }))
  }

  return {
    getData, getList, setData, pushData, updateData, removeData,
    subscribe, subscribeList, queryByField
  }
}