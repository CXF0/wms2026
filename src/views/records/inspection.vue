<template>
  <div class="placeholder-page">
    <div class="placeholder-inner">
      <div class="placeholder-icon">🚧</div>
      <h2 class="placeholder-title">质检记录</h2>
      <p class="placeholder-desc">质检标记/降级/缺货/退货/换货记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现 质检记录 页面
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  padding: 40px;
}
.placeholder-inner {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  padding: 60px 80px;
  border: 1.5px dashed #d0d5e0;
}
.placeholder-icon { font-size: 48px; margin-bottom: 16px; }
.placeholder-title { font-size: 20px; font-weight: 600; color: #1a1d23; margin: 0 0 8px; }
.placeholder-desc  { font-size: 14px; color: #8c92a0; margin: 0; }
</style>
