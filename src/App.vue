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
    colorPrimary:   '#1a6dd8',
    colorLink:      '#1a6dd8',
    borderRadius:   8,
    fontFamily:     '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, sans-serif',
    colorBgContainer: 'rgba(255,255,255,0.82)',
    boxShadow:      '0 2px 8px rgba(30,100,200,0.08)',
  },
}))
</script>