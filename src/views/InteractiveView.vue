<template>
  <div class="wrapper">
    <div class="interactive-container">
      <h2 class="color-white font-weight-black title">
        {{
          !gameStarted ? 'Choose your character' : turn === 'human' ? 'Your turn' : 'Opponents turn'
        }}
      </h2>
      <Suspense>
        <ImageCard class="border-color-blue">
          <template #images>
            <PlayerImage
              v-for="{ name, path, remaining } in gameStore.allCharacters"
              :key="name"
              @click="!gameStarted && select(name)"
              :remaining="remaining"
              :selected="selectedImage === name"
              :path="path"
              :name="name"
            />
          </template>

          <template v-if="!gameStarted" #actions>
            <FButtonIcon name="cross" color="red" :disabled="!selectedImage" />
            <FButtonIcon name="check" color="green" :disabled="!selectedImage" @click="startGame" />
          </template>
        </ImageCard>
      </Suspense>
      <Transition name="fade">
        <TextInput v-if="gameStarted" v-model="prompt" @submit="submitPrompt" />
      </Transition>
    </div>

    <DecisionTree class="tree" v-if="treeData" :data="treeData" />

    <Transition>
      <DialogContainer v-if="showInfoCard">
        <template #title> Your turn</template>
        <template #description>
          Ask a question in the textfield and hit <FIcon name="check" color="green"> </FIcon>
        </template>
        <template #action>
          <FButtonIcon name="check" color="green" @click="showInfoCard = false" />
        </template>
      </DialogContainer>
    </Transition>

    <Transition>
      <DialogContainer v-if="turn === 'ai'">
        <template #title> Opponents question</template>
        <template #description>{{ ai?.robotQuestion.robot_question }}</template>
        <template #action>
          <FButtonIcon name="cross" color="red" @click="submitAnswer(false)" />
          <FButtonIcon name="check" color="green" @click="submitAnswer(true)"
        /></template>
      </DialogContainer>
    </Transition>

    <div class="backdrop" :class="{ 'backdrop-active': turn === 'ai' || showInfoCard }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FButtonIcon, FIcon } from 'fari-component-library'
import { useWebSocketStore } from '../stores/ws'
import { useAIStore } from '@/stores/ai'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import PlayerImage from '@/components/PlayerImage.vue'
import ImageCard from '@/components/ImageCard.vue'
import TextInput from '@/components/TextInput.vue'
import DialogContainer from '@/components/DialogContainer.vue'
import DecisionTree from '@/components/decision-tree/DecisionTree.vue'

const router = useRouter()
const webSocketStore = useWebSocketStore()
const { askQuestion, answerQuestion } = useAIStore()
const ai = useAIStore()
const gameStore = useGameStore()

const selectedImage = ref(null)

const showInfoCard = ref(false)
const turn = ref<'ai' | 'human'>('human')
const gameStarted = ref(false)

const prompt = defineModel()

const treeData = ref(null)

function startGame() {
  showInfoCard.value = true
  gameStarted.value = true
}

async function submitPrompt() {
  const response = await askQuestion(prompt.value)
  prompt.value = ''
  turn.value = 'ai'

  if (response.decision_tree) {
    treeData.value = response.decision_tree
  }
}

async function submitAnswer(answer: boolean) {
  await answerQuestion(answer)
  turn.value = 'human'
}

const select = (image) => (selectedImage.value = image)
onMounted(async () => {
  await ai.initialize()
  await gameStore.loadImages()
})

watch(
  () => webSocketStore.fastifyStarted,
  (started) => !started && router.push('/interactive-start'),
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 2rem;
  position: relative;
  background: url('../assets/HumanPlayerBackground.png');
}

.title {
  font-size: 3rem;
}

.interactive-container {
  width: 100%;
  height: auto;
  overflow: hidden;
  position: absolute;
  top: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.tree {
  position: absolute;
  top: 55rem;
}

.backdrop {
  visibility: hidden;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(0);
  z-index: 1;
  transition: all 100ms;

  &-active {
    visibility: visible;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    transition: all 200ms;
  }
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
