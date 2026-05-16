<template>
  <div class="app-shell">
    <div class="bg-grid" />
    <div class="layout-body">
      <SideMenu />
      <div class="main-area">
        <TopBar />
        <main class="page-content">
          <RouterView />
        </main>
      </div>
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
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 18% 12%, rgba(0, 143, 90, 0.28), transparent 25%),
    radial-gradient(circle at 84% 8%, rgba(255, 159, 28, 0.24), transparent 22%),
    radial-gradient(circle at 82% 92%, rgba(0, 86, 55, 0.18), transparent 28%),
    linear-gradient(135deg, #132821 0%, #ecf5ec 34%, #f7f5ef 66%, #fff4df 100%);
  z-index: 0;
}

.bg-grid::after {
  position: absolute;
  inset: 18px;
  content: '';
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 32px;
  pointer-events: none;
}

.layout-body {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  min-height: 100vh;
  padding: 18px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: calc(100vh - 36px);
  overflow: hidden;
  background: rgba(255, 253, 248, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28px;
  box-shadow: var(--wms-shadow-md);
  backdrop-filter: blur(18px);
}

.page-content {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.55), rgba(247, 245, 239, 0.96)),
    var(--wms-bg);
}
</style>
