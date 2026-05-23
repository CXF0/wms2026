<template>
  <div class="placeholder-page-shell">
    <section class="placeholder-card">
      <div class="brand-mark" aria-hidden="true" />
      <span class="eyebrow">Coming Soon</span>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>

      <div class="resource-grid">
        <span>
          <strong>Guide</strong>
          业务规则
        </span>
        <span>
          <strong>API</strong>
          数据联调
        </span>
        <span>
          <strong>Release</strong>
          上线准备
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.placeholder-page-shell {
  min-height: calc(100vh - 190px);
  display: grid;
  place-items: center;
  padding: 44px;
}

.placeholder-card {
  width: min(680px, 100%);
  padding: 40px;
  border: 1px solid var(--wms-line);
  border-radius: 24px;
  background:
    linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    #fff;
  background-size: 56px 56px;
  box-shadow: var(--wms-shadow-sm);
}

.brand-mark {
  width: 28px;
  height: 28px;
  margin-bottom: 22px;
  border-radius: 9px 9px 9px 3px;
  background: var(--wms-primary);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--wms-primary-soft);
  color: var(--wms-primary-strong);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 16px 0 0;
  color: var(--wms-text);
  font-size: 32px;
  font-weight: 850;
  letter-spacing: 0;
}

p {
  max-width: 520px;
  margin: 12px 0 0;
  color: var(--wms-text-muted);
  font-size: 15px;
  line-height: 1.8;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin-top: 42px;
  padding-top: 26px;
  border-top: 1px solid var(--wms-line);
}

.resource-grid span {
  color: var(--wms-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.resource-grid strong {
  display: block;
  color: var(--wms-text);
  font-size: 15px;
}
</style>
