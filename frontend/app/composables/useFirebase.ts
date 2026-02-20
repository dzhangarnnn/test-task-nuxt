import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database'

let app: FirebaseApp | null = null
let db: Database | null = null
let emulatorConnected = false

export const useFirebase = () => {
  const config = useRuntimeConfig()

  const initFirebase = () => {
    if (import.meta.server) return { app: null, db: null }

    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        projectId: config.public.firebaseProjectId,
        databaseURL: `http://127.0.0.1:9000/?ns=${config.public.firebaseProjectId}-default-rtdb`
      }
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0] ?? null
    }

    if (!db && app) {
      db = getDatabase(app)
      
      if (config.public.useEmulator === 'true' && !emulatorConnected) {
        try {
          connectDatabaseEmulator(db, '127.0.0.1', 9000)
          emulatorConnected = true
        } catch (e) {
        	console.log(e) // Эмулятор уже подключён
        }
      }
    }

    return { app, db }
  }

  return { initFirebase, getApp: () => app, getDb: () => db }
}