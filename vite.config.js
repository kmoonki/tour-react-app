// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tour-react-app/', // 예: 저장소 이름이 'tour-react-app'이면 '/tour-react-app/'
})

