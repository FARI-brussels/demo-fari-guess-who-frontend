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
        <TextInput
          v-if="gameStarted"
          v-model="prompt"
          @submit="submit"
          :loading="ai?.loading"
          :icon="icon"
        />
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

    <Transition>
      <DialogContainer v-if="showWinner">
        <template #title> Winner is </template>
        <template #description>
          <div class="winner-container">
            {{
              ai.winner === 'human'
                ? 'You! Play again if you like'
                : 'Unfortunately, the algorithm won, you can always try to play again'
            }}
            <img v-if="ai.winner === 'human'" src="@/assets/human_avatar.svg" />
            <img v-else src="@/assets/robot_avatar.svg" />
          </div>
        </template>
        <template #action>
          <FButton label="close" @click="showWinner = false" />
        </template>
      </DialogContainer>
    </Transition>

    <div
      class="backdrop"
      :class="{ 'backdrop-active': turn === 'ai' || showInfoCard || showWinner }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FButtonIcon, FButton, FIcon } from 'fari-component-library'
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

const showWinner = ref(false)

const icon = ref<'check' | 'send'>('send')

function startGame() {
  showInfoCard.value = true
  gameStarted.value = true
}

async function submit() {
  if (turn.value === 'human') {
    if (icon.value === 'send') {
      await submitPrompt()
    } else {
      turn.value = 'ai'
      prompt.value = ''
      icon.value = 'send'
    }
  }
}

async function submitPrompt() {
  if (prompt.value.trim() === '') return

  const response = await askQuestion(prompt.value)

  if (response.decision_tree) treeData.value = response.decision_tree
  if (ai.winner) showWinner.value = true

  icon.value = 'check'
  turn.value = 'human'
}

async function submitAnswer(answer) {
  await answerQuestion(answer)
  turn.value = 'human'
  prompt.value = ''
  icon.value = 'send'
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

watch(
  () => ai.winner,
  (winner) => {
    if (winner) {
      showWinner.value = true
    }
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
  z-index: 2;
  transition: all 100ms;

  &-active {
    visibility: visible;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    transition: all 200ms;
  }
}

.winner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
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
