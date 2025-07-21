<template>
  <div class="broken-image-placeholder">
    <span>Файл повреждён</span>
  </div>
</template>

<script setup lang="ts">
// Нет логики, только отображение
</script>

<style scoped>
.broken-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(135deg, #f3f3f3, #f3f3f3 16px, #fff 16px, #fff 32px);
  color: #b0b0b0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-radius: var(--eco-radius-lg);
  user-select: none;
}
</style> 