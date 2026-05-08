<template>
  <a-layout class="app-layout">
    <SideMenu />
    <a-layout>
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
.app-layout { min-height: 100vh; }
.main-content {
  padding: 0;
  min-height: calc(100vh - 56px);
  background: #f5f6fa;
  overflow: auto;
}
</style>
