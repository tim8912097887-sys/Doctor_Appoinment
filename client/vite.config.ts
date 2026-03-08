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
       '@layouts': path.resolve(__dirname,"./src/layouts"),
       '@contexts': path.resolve(__dirname,"./src/contexts"),
       '@hooks': path.resolve(__dirname,"./src/hooks"),
       '@providers': path.resolve(__dirname,"./src/providers"),
       '@validations': path.resolve(__dirname,"./src/validations"),
       '@utils': path.resolve(__dirname,"./src/utils"),
       '@apis': path.resolve(__dirname,"./src/apis"),
      //  '@utilities': path.resolve(__dirname,"./src/utilities"),
      //  '@api': path.resolve(__dirname,"./src/api"),
      //  '@stores': path.resolve(__dirname,"./src/stores"),
      //  '@mock': path.resolve(__dirname,"./src/mock")
    }
  }
})
