<template>
  <div ref="tooltip" class="tooltip bg-color-blue color-white p-md rounded">
    <img :src="imgSrc" :class="{ portrait: !thumbnail }" />
    <hr class="border-color-primary mb-md" />

    <div>
      <strong class="font-weight-black font-size-body">{{ title }} </strong>
      <p>{{ content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imgSrc: string
  thumbnail: boolean
  title: string
  content: string
}>()
</script>

<style scoped lang="scss">
.tooltip {
  position: fixed;
  top: 40rem;
  display: flex;
  flex-direction: column;
  z-index: 4;
  left: 14rem;
  width: 40rem;
  img {
    width: 3rem;
    margin-bottom: 1rem;
    margin-left: auto;
    margin-right: auto;
  }
  .portrait {
    width: 180px;
    border-radius: 1rem;
  }
}
</style>
