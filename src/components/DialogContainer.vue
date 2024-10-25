<template>
  <FContainer @close="showInfoCard = false" class="card">
    <h2 v-if="$slots.title" class="color-blue font-weight-black card-title">
      <slot name="title"></slot>
    </h2>
    <p v-if="$slots.description" class="color-black text-body font-weight-bold">
      <slot name="description"></slot>
    </p>
    <div v-if="$slots.action" class="action">
      <slot name="action"></slot>
    </div>
  </FContainer>
</template>

<script setup lang="ts">
import { FContainer } from 'fari-component-library'
</script>

<style scoped lang="scss">
.card {
  position: absolute;
  top: 25%;
  left: 20%;
  z-index: 3;
  width: 42rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;

  p {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
.action {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
}
</style>
