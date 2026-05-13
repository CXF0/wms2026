<template>
  <a-config-provider :theme="theme">
    <RouterView />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const theme = computed(() => ({
  algorithm: appStore.darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#2b85de',
    colorBgLayout: '#d9eefe',
    colorBgContainer: 'rgba(241,249,255,0.9)',
    borderRadius: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}))
</script>
