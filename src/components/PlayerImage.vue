<template>
  <div class="image-wrapper">
    <!-- <img
      :class="{
        cross: true,
        'cross-visible': !remaining
      }"
      src="../assets/cross.svg?url"
    /> -->
    <img
      :class="{
        checked: true,
        'checked-visible': selected
      }"
      src="../assets/check.svg?url"
    />
    <div
      :class="{
        overlay: true,
        'overlay-visible': !remaining && !gray,
        'overlay-visible-gray': !remaining && gray,
        'overlay-selected': selected
      }"
    />
    <img :src="path" :alt="name" class="portrait" :class="{ disabled: !remaining }" />
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
  remaining: boolean
  selected: boolean
  gray?: boolean
}>()
</script>

<style scoped lang="scss">
.image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;

  .cross {
    position: absolute;
    left: 25%;
    top: 25%;
    opacity: 0;
    transition: opacity 200ms ease-in;
    z-index: 1;

    // &-visible {
    //   opacity: 1;
    // }
  }

  .checked {
    position: absolute;
    right: -5%;
    top: -5%;
    opacity: 0;
    transition: opacity 200ms ease-in;
    z-index: 2;

    &-visible {
      opacity: 1;
    }
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: transparent;
    transition: all 200ms ease-in;
    border-radius: 1rem;
    z-index: 1;

    &-visible {
      opacity: 1;
      background-color: #183e9199;
    }
    &-visible-gray {
      opacity: 1;
      background-color: #45454599;
    }
    &-selected {
      box-shadow: inset 0px 0px 0px 4px #64d8bf;
    }
  }

  .portrait {
    object-fit: cover;
    border-radius: 1rem;
    width: 100%;
    height: 100%;
  }

  .label {
    color: white;
    position: absolute;
    font-weight: bold;
    bottom: 0rem;
    width: 100%;
    z-index: 1;
    background: #183e9180;
    text-align: center;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    transition: all 200ms ease-in;
  }

  .selected {
    background-color: #64d8bf;
  }

  .disabled {
    filter: grayscale(1);
  }
}
</style>
