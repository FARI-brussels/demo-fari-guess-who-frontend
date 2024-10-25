<template>
  <div class="text-input-container">
    <input
      v-model="model"
      type="text"
      placeholder="Enter your text here..."
      class="font-weight-semibold"
    />
    <img src="@/assets/loading.svg" v-if="loading" class="spinner" />

    <FButtonIcon
      v-else-if="icon === 'check'"
      name="check"
      color="green"
      small
      role="submit"
      @click="emit('submit')"
      @keyup.enter="emit('submit')"
    />
    <img
      v-else
      src="@/assets/send.svg"
      class="send"
      @click="emit('submit')"
      @keyup.enter="emit('submit')"
    />
  </div>
</template>

<script setup lang="ts">
import { FButtonIcon } from 'fari-component-library'
const emit = defineEmits('submit')
const model = defineModel()

defineProps<{ loading: boolean; icon: string }>()
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

.spinner {
  width: 56px;
  height: 56px;
}

.send {
  width: 56px;
  height: 56px;
  z-index: 2;
  background-color: #00a607;
  border-radius: 50%;
  padding: 1rem;
  // background: url('@/assets/send.svg');
}
</style>
