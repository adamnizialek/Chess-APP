import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin to inject preload hints for CSS to break the request chain
function cssPreloadPlugin(): Plugin {
  return {
    name: 'css-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html

      const cssAssets = Object.keys(ctx.bundle).filter(name => name.endsWith('.css'))
      const preloadLinks = cssAssets
        .map(css => `<link rel="preload" href="/${css}" as="style">`)
        .join('\n    ')

      return html.replace('<head>', `<head>\n    ${preloadLinks}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cssPreloadPlugin()],
  build: {
    cssCodeSplit: false, // Single CSS file for easier preloading
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
})
