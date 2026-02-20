# Nuxt Test Task

## Требования
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`

## Запуск
```bash
cd frontend
npm install
```

Запустить в двух отдельных терминалах:

**Терминал 1 — Firebase Emulator** (запускать первым):
```bash
npm run firebase:emulators
```

**Терминал 2 — Dev-сервер:**
```bash
npm run dev
```

Приложение: `http://localhost:3000`
Firebase UI: `http://localhost:4000`

## Production
```bash
npm run build
npm run preview
```
