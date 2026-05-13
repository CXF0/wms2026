<template>
  <a-layout class="app-layout">
    <SideMenu />
    <a-layout class="content-shell">
      <TopBar />
      <a-layout-content class="main-content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import SideMenu from './SideMenu.vue'
import TopBar from './TopBar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% -20%, rgba(90, 225, 179, 0.35), transparent 45%),
    radial-gradient(circle at 100% 120%, rgba(35, 56, 182, 0.2), transparent 48%),
    linear-gradient(160deg, #eff5f3 0%, #e8f1f7 100%);
}
.content-shell {
  backdrop-filter: blur(2px);
}
.main-content {
  margin: 14px;
  border-radius: 20px;
  min-height: calc(100vh - 84px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(244, 249, 252, 0.9));
  box-shadow: 0 14px 36px rgba(19, 59, 80, 0.08);
  overflow: auto;
}
</style>
