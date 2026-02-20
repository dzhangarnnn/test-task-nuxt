// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  extends: [
    '../modules'
  ],
  ssr: true,
  imports: {
    dirs: ['composables']
  },
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || 'test-key',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
      useEmulator: process.env.USE_EMULATOR || 'true'
    }
  },
  css: [
    '~/assets/css/main.css'
  ],
})
