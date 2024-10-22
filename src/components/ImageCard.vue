<template>
  <div class="image-card bg-color-white">
    <h2 class="color-blue font-weight-black card-title">
      <slot name="title" />
    </h2>

    <div class="image-container">
      <slot name="images" />
    </div>

    <div v-if="$slots.actions" class="action">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-card {
  padding: 2rem;
  border-radius: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 51rem;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  transition: outline 200ms ease-in;
  padding-left: 1rem;
  padding-bottom: 2rem;
}

.action {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.card-title {
  font-size: 3rem;
}
</style>
