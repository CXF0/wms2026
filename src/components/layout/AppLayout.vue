<template>
  <div class="app-shell">
    <SideMenu />
    <div class="main-area">
      <TopBar />
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideMenu from './SideMenu.vue'
import TopBar from './TopBar.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background:
    linear-gradient(rgba(16, 185, 129, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.07) 1px, transparent 1px),
    linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(255, 255, 255, 0) 34%),
    #fff;
  background-size: 96px 96px, 96px 96px, auto, auto;
}

.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgba(255, 255, 255, 0.86);
  border-left: 1px solid var(--wms-line);
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(250, 250, 250, 0.96)),
    transparent;
}
</style>
