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
    colorPrimary: '#008f5a',
    colorLink: '#008f5a',
    borderRadius: 12,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    colorBgContainer: '#fffdf8',
    colorBorder: '#e8e0d4',
    colorText: '#12241c',
    colorTextSecondary: '#6c7a70',
    boxShadow: '0 16px 34px rgba(21, 52, 39, 0.08)',
  },
}))
</script>
