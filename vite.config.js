import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pagesで「https://ユーザー名.github.io/prime-factor-card-game/」として公開する設定です。
  // リポジトリ名を変えた場合は、下の prime-factor-card-game も同じ名前に変えてください。
  base: '/prime-factor-card-game/',
  plugins: [react()],
})
