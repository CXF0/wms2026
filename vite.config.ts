import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      AutoImport({ imports: ['vue', 'vue-router', 'pinia'], dts: 'src/types/auto-imports.d.ts', eslintrc: { enabled: true } }),
      Components({ resolvers: [AntDesignVueResolver({ importStyle: false })], dts: 'src/types/components.d.ts', dirs: ['src/components'] }),
    ],
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: {
      host: '0.0.0.0', port: 3000, open: true,
      proxy: {
        '/api': {
          target: 'https://api.xunmengvip.cn',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p
            .replace(/^\/api\/__admin/, '/xm-bulky-admin')
            .replace(/^\/api/, '/xm-bulky-supplier'),
        },
      },
    },
    build: {
      target: 'es2015', sourcemap: mode !== 'production',
      rollupOptions: { output: { manualChunks: { 'vue-core': ['vue', 'vue-router', 'pinia'], antd: ['ant-design-vue', '@ant-design/icons-vue'] } } },
    },
  }
})
