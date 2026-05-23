<template>
  <a-config-provider :theme="antdTheme">
    <RouterView />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme as antTheme } from 'ant-design-vue'

const antdTheme = computed(() => ({
  algorithm: antTheme.defaultAlgorithm,
  token: {
    colorPrimary: '#10b981',
    colorLink: '#059669',
    borderRadius: 10,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    colorBgContainer: '#ffffff',
    colorBorder: '#e5e7eb',
    colorText: '#18181b',
    colorTextSecondary: '#71717a',
    boxShadow: '0 12px 24px rgba(24, 24, 27, 0.06)',
  },
}))
</script>
