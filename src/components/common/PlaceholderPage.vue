<template>
  <div class="placeholder-page-shell">
    <section class="placeholder-card">
      <div class="status-mark" aria-hidden="true">
        <span class="mark-core">*</span>
        <span class="mark-orbit orbit-a" />
        <span class="mark-orbit orbit-b" />
      </div>

      <div class="copy">
        <span class="eyebrow">Coming Soon</span>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>

      <div class="status-strip">
        <span>
          <strong>01</strong>
          业务模型
        </span>
        <span>
          <strong>02</strong>
          数据联调
        </span>
        <span>
          <strong>03</strong>
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
  position: relative;
  width: min(620px, 100%);
  overflow: hidden;
  padding: 38px;
  border: 1px solid rgba(232, 224, 212, 0.8);
  border-radius: 30px;
  background:
    radial-gradient(circle at 84% 16%, rgba(255, 159, 28, 0.24), transparent 28%),
    radial-gradient(circle at 16% 12%, rgba(0, 143, 90, 0.15), transparent 30%),
    rgba(255, 253, 248, 0.92);
  box-shadow: var(--wms-shadow-md);
  text-align: center;
}

.placeholder-card::before {
  position: absolute;
  inset: 14px;
  content: '';
  border: 1px dashed rgba(0, 143, 90, 0.18);
  border-radius: 24px;
  pointer-events: none;
}

.status-mark {
  position: relative;
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  margin: 4px auto 24px;
}

.mark-core {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  position: relative;
  z-index: 2;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--wms-primary), var(--wms-primary-strong));
  color: #fff;
  font-size: 42px;
  font-weight: 850;
  line-height: 1;
  box-shadow: var(--wms-shadow-glow);
}

.mark-orbit {
  position: absolute;
  border-radius: 999px;
}

.orbit-a {
  inset: 8px;
  border: 1px solid rgba(0, 143, 90, 0.18);
}

.orbit-b {
  width: 30px;
  height: 30px;
  right: 8px;
  bottom: 16px;
  background: var(--wms-accent);
  box-shadow: 0 12px 24px rgba(255, 159, 28, 0.28);
}

.copy {
  position: relative;
  z-index: 1;
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
  margin: 14px 0 0;
  color: var(--wms-text);
  font-size: 30px;
  font-weight: 850;
  letter-spacing: 0;
}

p {
  max-width: 430px;
  margin: 10px auto 0;
  color: var(--wms-text-muted);
  font-size: 14px;
  line-height: 1.8;
}

.status-strip {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 28px;
}

.status-strip span {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px 10px;
  border: 1px solid rgba(232, 224, 212, 0.72);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  color: var(--wms-text-muted);
  font-size: 12px;
}

.status-strip strong {
  color: var(--wms-accent-strong);
  font-size: 13px;
}
</style>
