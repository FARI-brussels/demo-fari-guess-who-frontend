<template>
  <div class="text-input-container" :class="{ 'text-input-container--disabled': disabled }">
    <img src="@/assets/human_input_icon.svg" class="mr-md" />
    <input
      v-model="model"
      type="text"
      placeholder="Enter your text here..."
      class="input font-weight-semibold"
      :disabled="disabled"
      @keyup.enter="!disabled && emit('submit')"
      :class="{ disabled: disabled }"
    />
    <img src="@/assets/loading.svg" v-if="loading" class="spinner" />

    <FButtonIcon
      v-else-if="!disabled"
      name="check"
      color="green"
      small
      role="submit"
      @click="emit('submit')"
      @keyup.enter="emit('submit')"
    />
  </div>
</template>

<script setup lang="ts">
import { FButtonIcon } from 'fari-component-library'
const emit = defineEmits(['submit'])
const model = defineModel()

defineProps<{ loading: boolean; icon: string; disabled: boolean }>()
</script>

<style scoped lang="scss">
.text-input-container {
  display: flex;
  align-items: center;
  width: 50rem;

  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 0.5rem 1rem;
  border: 0.125rem solid #1254e3;
  height: 76px;
  background-color: #183e91;
  &--disabled {
    background-color: #4393de50;
  }

  .input {
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

  .disabled::placeholder {
    color: #4393de50 !important;
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
}
</style>
