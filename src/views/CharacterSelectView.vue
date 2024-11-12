<template>
  <div class="bg-color-blue">
    <div class="title-container">
      <h2 class="font-size-subtitle font-weight-bold">Choose your character</h2>
    </div>
    <transition>
      <div
        v-if="characterImage"
        class="selected-character-container border-color-primary rounded-s p-md"
      >
        <PlayerImageLarge :name="gameStore.selectedCharacter" :path="characterImage.path" framed />
        <div class="character-description">
          <p class="color-blue-light">{{ characterImage.description_short }}</p>
        </div>
      </div>
    </transition>
    <div class="bg-color-white p-sm rounded-s character-select">
      <Suspense>
        <div class="image-container">
          <PlayerImage
            v-for="{ name, path } in gameStore.allCharacters"
            :key="name"
            remaining
            @click="gameStore.selectCharacter(name)"
            :path="path"
            :name="name"
            :selected="false"
          />
        </div>
      </Suspense>
      <div class="action">
        <FButtonIcon
          name="check"
          color="green"
          :disabled="!gameStore.selectedCharacter"
          @click="startGame"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FButtonIcon } from 'fari-component-library'
import PlayerImage from '@/components/PlayerImage.vue'
import PlayerImageLarge from '@/components/PlayerImageLarge.vue'
import { useWebSocketStore } from '../stores/ws'
import { watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const props = defineProps<{ send: Function; started: boolean }>()
const router = useRouter()
const gameStore = useGameStore()
const webSocketStore = useWebSocketStore()

const characterImage = computed(() => {
  if (!gameStore.selectedCharacter) return null
  return gameStore.allCharacters.find(({ name }) => name === gameStore.selectedCharacter)
})

watch(
  () => webSocketStore.fastifyStarted,
  (started) => {
    if (started) {
      console.log({ router })
      router.push('/interactive')
    }
  }
)

function startGame() {
  props.send('start')
}

onMounted(async () => !gameStore.allCharacters.length && (await gameStore.loadImages()))
</script>

<style scoped lang="scss">
.title-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 10%;
  left: 30%;
}

.character-select {
  z-index: 3;
  position: absolute;
  top: 38rem;
  left: 25%;
  width: 512px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 0;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  width: 512px;
  gap: 1.3rem;
  transition: outline 200ms ease-in;
  padding-bottom: 2rem;
}

.selected-character-container {
  width: 512px;
  height: 244px;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: absolute;
  top: 20rem;
  left: 25%;
}

.character-description {
  width: 220px;
}

.action {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.card-title {
  font-size: 3rem;
  text-align: center;
}
.v-enter-active,
.v-leave-active {
  opacity: 1;
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(50%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
