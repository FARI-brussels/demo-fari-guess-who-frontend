<template>
  <div class="wrapper">
    <Suspense>
      <ImageCard class="player-card">
        <template #images>
          <PlayerImage
            v-for="{ name, path, remaining } in gameStore.allCharacters"
            :key="name"
            :remaining="remaining"
            :path="path"
            :name="name"
            gray
          />
        </template>
      </ImageCard>
    </Suspense>
    <p class="hidden">{{ treeData }}</p>
    <div class="decision-tree-container">
      <DecisionTree
        class="tree"
        v-if="treeData"
        :data="treeData"
        color="gray"
        :selectedCharacter="userSelectedCharacter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWebSocketStore } from '../stores/ws'
import { watch, computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DecisionTree from '@/components/decision-tree/DecisionTree.vue'
import PlayerImage from '@/components/PlayerImage.vue'
import ImageCard from '@/components/ImageCard.vue'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const webSocketStore = useWebSocketStore()

const gameStore = useGameStore()

const userSelectedCharacter = ref<string | undefined>()

onMounted(async () => {
  await gameStore.loadImages()
})

watch(
  () => webSocketStore.fastifyStarted,
  (started) => !started && router.push('/info-start'),
  { immediate: true }
)

const treeData = computed(() => {
  if (!webSocketStore.fastifyData) return null
  if (webSocketStore?.fastifyData === 'start' || webSocketStore?.fastifyData == 'stop') return null

  const data = JSON.parse(webSocketStore?.fastifyData)

  if (data?.decision_tree && Array.isArray(data.decision_tree)) {
    const { selectedCharacter, decision_tree } = data
    gameStore.filterCharacters(data.remaining_characters)
    setSelectedCharacter(selectedCharacter)
    return decision_tree
  } else return null
})

const setSelectedCharacter = (name: string) => (userSelectedCharacter.value = name)
</script>

<style scoped lang="scss">
.hidden {
  visibility: hidden;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #e7e7e7;
}

.player-card {
  border: 1px solid #959595;
  position: absolute;
  top: 12rem;
}

.decision-tree-container {
  position: absolute;
  width: 100%;
  height: 80rem;
  top: 45rem;
  left: 2.5rem;
  overflow: scroll;
}
</style>
