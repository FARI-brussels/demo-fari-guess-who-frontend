<template>
  <div class="wrapper bg-color-blue">
    <div class="character-panel">
      <Suspense>
        <div class="bg-color-white p-sm rounded-s character-select">
          <div class="image-container">
            <PlayerImage
              v-for="{ name, path, remaining } in gameStore.allCharacters"
              :key="name"
              :remaining="remaining"
              :selected="false"
              :path="path"
              :name="name"
            />
          </div>
        </div>
      </Suspense>
      <div class="selected-character-container rounded-s bg-color-blue color-blue-light p-sm">
        <PlayerImageLarge
          :name="gameStore.selectedCharacter"
          :path="characterImage.path"
          framed
          selected
        />
        {{ characterImage.description_short }}
      </div>
    </div>
    <div class="questions-container">
      <div class="ai-question">
        <img src="@/assets/ai_input_icon.svg" class="mr-md" />
        {{ displayedQuestion }}
        <div class="actions">
          <FButtonIcon
            v-if="turn === 'ai'"
            name="cross"
            color="red"
            small
            @click="submitAnswer(false)"
          />
          <FButtonIcon
            v-if="turn === 'ai'"
            name="check"
            color="green"
            small
            @click="submitAnswer(true)"
          />
        </div>
      </div>
      <TextInput
        ref="textInput"
        v-model="prompt"
        @submit="submit"
        :loading="ai?.loading"
        :disabled="turn === 'ai' || ai.winner !== null"
        icon="check"
      />
    </div>
    <div class="interactive-container"></div>
    <div class="decision-tree-container">
      <DecisionTree
        class="tree"
        v-if="treeData"
        :data="treeData"
        :selected-character="gameStore.selectedCharacter || undefined"
      />
    </div>

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
          <FButton type="secondary" label="close" @click="showWinner = false" />
          <FButton label="go back" @click="webSocketStore.sendFastify('stop')" />
        </template>
      </DialogContainer>
    </Transition>

    <div class="backdrop" :class="{ 'backdrop-active': showWinner }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FButtonIcon, FButton } from 'fari-component-library'
import { useWebSocketStore } from '../stores/ws'
import { useAIStore } from '@/stores/ai'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import PlayerImage from '@/components/PlayerImage.vue'
import TextInput from '@/components/TextInput.vue'
import PlayerImageLarge from '@/components/PlayerImageLarge.vue'
import DialogContainer from '@/components/DialogContainer.vue'
import DecisionTree from '@/components/decision-tree/DecisionTree2.vue'

const router = useRouter()
const webSocketStore = useWebSocketStore()
const { askQuestion, answerQuestion } = useAIStore()
const ai = useAIStore()
const gameStore = useGameStore()

const turn = ref<'ai' | 'human'>('human')

const prompt = defineModel()

const treeData = ref(null)

const showWinner = ref(false)

const aiLoading = ref(false)
const displayedQuestion = ref('')

function typeText(text) {
  displayedQuestion.value = ''
  let index = 0
  const typingSpeed = 50

  const interval = setInterval(() => {
    if (index < text.length) {
      displayedQuestion.value += text[index]
      index++
    } else {
      clearInterval(interval)
    }
  }, typingSpeed)
}

watch(
  () => ai.robotQuestion.robot_question,
  (newQuestion) => {
    if (newQuestion) typeText(newQuestion)
  }
)

const textInput = ref(null)

watch(
  () => [turn.value, textInput.value],
  ([newTurn, newTextinput]) => {
    if (newTurn === 'human' && newTextinput) newTextinput.$el.querySelector('input').focus()
    else if (newTurn === 'ai' && newTextinput) newTextinput.$el.querySelector('input').blur()
  },
  { immediate: true }
)

async function submit() {
  await submitPrompt()
  turn.value = 'ai'
  prompt.value = ''
}

async function submitPrompt() {
  if (prompt.value.trim() === '') return

  const response = await askQuestion(prompt.value)

  if (response.decision_tree) treeData.value = response.decision_tree
  if (ai.winner) showWinner.value = true

  turn.value = 'human'
}

async function submitAnswer(answer) {
  await answerQuestion(answer)
  turn.value = 'human'
}

onMounted(async () => {
  await ai.initialize()
  await gameStore.loadImages()
})

watch(
  () => webSocketStore.fastifyStarted,
  (started) => {
    console.log({ started, router })
    !started && router.push('/interactive-start')
  },
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

const characterImage = computed(() => {
  if (!gameStore.selectedCharacter) return null
  return gameStore.allCharacters.find(({ name }) => name === gameStore.selectedCharacter)
})
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

.character-panel {
  z-index: 3;
  position: absolute;
  top: 10rem;
  left: 12%;
  display: flex;
  gap: 2rem;
}

.character-select {
  width: 512px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 0;
}

.selected-character-container {
  height: inherit;
  border: 2px solid #1254e3;
  display: flex;
  width: 260px;
  gap: 1rem;
  justify-content: space-evenly;
  flex-direction: column;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  width: 512px;
  gap: 1.3rem;
  transition: outline 200ms ease-in;
  padding-bottom: 2rem;
}

.questions-container {
  position: absolute;
  top: 46rem;
  left: 12%;
  width: 512px;
}

.ai-question {
  width: 50rem;
  height: 76px;
  background-color: #4393de50;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;
}

.decision-tree-container {
  position: absolute;
  width: 100%;
  height: 60rem;
  bottom: 0;
  overflow: scroll;
  left: 2.5rem;
}

// .tree {
//   position: absolute;
//   top: 58rem;
// }
</style>
