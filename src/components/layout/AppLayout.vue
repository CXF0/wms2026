<template>
  <div class="app-shell">
    <div class="bg-gradient" />
    <div class="layout-body">
      <!-- 侧边栏：独立悬浮卡片 -->
      <SideMenu />
      <!-- 右侧：顶栏 + 内容 -->
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', Roboto, sans-serif;
}

/* 全局蓝色渐变背景 */
.bg-gradient {
  position: fixed;
  inset: 0;
  background: linear-gradient(145deg, #d6ecfa 0%, #bfe0f5 35%, #c8e8fd 65%, #dff2ff 100%);
  z-index: 0;
}

/* 整体布局：给四周留白，侧边栏和内容区悬浮其上 */
.layout-body {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 右侧主区域 */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  /* 顶栏 + 内容共同组成一个圆角卡片容器 */
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(30, 100, 200, 0.08);
  overflow: hidden;
}

/* 页面内容区 */
.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: transparent;
}
</style>