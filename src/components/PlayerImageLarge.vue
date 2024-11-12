<template>
  <div class="image-wrapper">
    <img
      :class="{
        checked: true,
        'checked-visible': selected
      }"
      src="../assets/check.svg?url"
    />
    <div
      :class="{
        framed,
        'bg-color-primary': true,
        'overlay-selected': selected
      }"
    />
    <img :src="path" :alt="name" :class="{ portrait: true, framed }" />
    <p
      :class="{
        selected,
        label: true
      }"
    >
      {{ name }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  path: string
  framed?: boolean
  selected?: boolean
}>()
</script>

<style scoped lang="scss">
.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;

  .checked {
    position: absolute;
    right: 3%;
    top: 3%;
    opacity: 0;
    transition: opacity 200ms ease-in;
    z-index: 1;

    &-visible {
      opacity: 1;
    }
  }

  .portrait {
    object-fit: cover;
    border-radius: 1rem;
    width: 100%;
    height: 100%;
  }

  .portrait.framed {
    border: 1px solid #64d8bf;
    border-radius: 1rem;
  }

  .label {
    color: white;
    position: absolute;
    font-weight: bold;
    bottom: 0rem;
    width: 100%;
    background: #183e9180;
    text-align: center;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    transition: all 200ms ease-in;
    padding: 0.5rem 0;
  }

  .selected {
    background-color: #64d8bf;
  }
}
</style>
