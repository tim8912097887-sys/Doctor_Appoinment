import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
       '@': path.resolve(__dirname,"./src"),
       '@components': path.resolve(__dirname,"./src/components"),
       '@pages': path.resolve(__dirname,"./src/pages"),
       '@assets': path.resolve(__dirname,"./src/assets"),
       '@layouts': path.resolve(__dirname,"./src/layouts")
      //  '@utilities': path.resolve(__dirname,"./src/utilities"),
      //  '@api': path.resolve(__dirname,"./src/api"),
      //  '@schemas': path.resolve(__dirname,"./src/schemas"),
      //  '@stores': path.resolve(__dirname,"./src/stores"),
      //  '@mock': path.resolve(__dirname,"./src/mock")
    }
  }
})
