<template>
  <div class="text-input-container">
    <input
      v-model="model"
      type="text"
      placeholder="Enter your text here..."
      class="font-weight-semibold"
    />
    <FButtonIcon
      class="action/button"
      name="check"
      color="green"
      small
      @click="emit('submit')"
      @keyup.enter="emit('submit')"
    />
  </div>
</template>

<script setup lang="ts">
import { FButtonIcon } from 'fari-component-library'
const emit = defineEmits('submit')
const model = defineModel()
</script>

<style scoped lang="scss">
.text-input-container {
  display: flex;
  align-items: center;
  width: 51rem;
  background-color: #183e91;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  border: 0.125rem solid #1254e3;

  input {
    flex: 1;
    background-color: transparent;
    border: none;
    outline: none;
    color: #fff; // White text
    font-size: 16px;
    padding: 0;
    &::placeholder {
      color: white;
    }
  }
}
</style>
