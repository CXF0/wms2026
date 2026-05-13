<template>
  <div class="placeholder-page">
    <div class="placeholder-inner">
      <div class="placeholder-icon">🚧</div>
      <h2 class="placeholder-title">无权限</h2>
      <p class="placeholder-desc">您没有访问该页面的权限</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现 无权限 页面
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
  width: min(680px, 100%);
  text-align: center;
  background: linear-gradient(165deg, rgba(246, 252, 255, 0.93), rgba(233, 244, 250, 0.88));
  border-radius: 24px;
  padding: 64px 80px;
  border: 1px solid rgba(148, 187, 214, 0.35);
  box-shadow: 0 20px 36px rgba(76, 122, 153, 0.14), inset 1px 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}
.placeholder-icon { font-size: 52px; margin-bottom: 18px; }
.placeholder-title { font-size: 24px; font-weight: 700; color: #174469; margin: 0 0 10px; letter-spacing: 0.3px; }
.placeholder-desc  { font-size: 15px; color: #4d6f8a; margin: 0; }
</style>
