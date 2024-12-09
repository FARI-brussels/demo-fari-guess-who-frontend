<template>
  <div id="decision-tree-section">
    <svg width="1300" height="1000" ref="svgTree"></svg>
  </div>

  <Transition>
    <DecisionTreeDialog
      v-if="showdialog"
      ref="dialog"
      :imgSrc="dialogContent.imagePath"
      :thumbnail="dialogInfoType !== 'justification'"
      :title="dialogContent.title"
      :content="dialogContent.text"
    />
  </Transition>
  <div class="backdrop" :class="{ 'backdrop-active': showdialog }"></div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, nextTick, watchEffect, computed, reactive } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { DecisionTreeCharacter, DecisionTreeInput } from './types'
import { organizeTreeData } from './organizeTree'
import { createBaseTree } from './base'
import { renderIcons, renderImages } from './render'
import DecisionTreeDialog from '@/components/DecisionTreeDialog.vue'

const props = defineProps<{
  data: JSON
  color?: 'gray' | 'default'
  selectedCharacter?: string
}>()

const justificationText = ref('')
const justificationTitle = ref('')
const justificationImage = ref('')

const dialog = ref(null)
const showdialog = ref(false)
const dialogInfoType = ref<'question' | 'decision' | 'justification'>('question')

const dialogContent = computed(() => {
  if (dialogInfoType.value === 'question')
    return {
      type: 'question',
      imagePath: '/src/assets/swirl.svg',
      title: 'Hallucinations',
      text: `AI systems, especially those based on large language models, are known for occasionally generating inaccurate or entirely fabricated information—a phenomenon commonly referred to as “hallucination.” This issue arises because these models are trained on vast datasets that include patterns, but they lack a genuine understanding of the real-world context or factual grounding. When given a prompt or asked a question, they may "fill in the gaps" by generating responses that sound plausible yet lack a basis in reality.`
    }
  if (dialogInfoType.value === 'decision')
    return {
      type: 'decision',
      imagePath: '/src/assets/decision.svg',
      title: 'Decisions',
      text: `Decisions:  Decisions in large language models (LLMs) are based on probability and pattern recognition, not true understanding. When generating text, an LLM selects words based on likely sequences from its training data, mimicking human responses but without genuine judgment. This approach enables versatility but lacks the nuanced decision-making and contextual awareness that humans bring, which is essential in fields requiring precision and ethics.`
    }
  if (dialogInfoType.value === 'justification')
    return {
      type: 'justification',
      imagePath: justificationImage.value,
      title: justificationTitle.value,
      text: justificationText.value
    }

  return {
    type: null,
    imagePath: '',
    title: '',
    text: ''
  }
})

const svgTree = ref<SVGSVGElement | null>(null)

const characterInfos = reactive<DecisionTreeCharacter[]>([])

onClickOutside(dialog, () => (showdialog.value = false))

onMounted(() => createDecisionTree(props.data))

watchEffect(() => {
  if (svgTree.value) {
    d3.select(svgTree.value).selectAll('*').remove()
    createDecisionTree(props.data)

    nextTick(() => {
      const container = document.getElementById('decision-tree-section')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }
})

const handleCharacters = (data: DecisionTreeInput) => {
  data.forEach(({ yes, no }) =>
    [...yes, ...no].forEach((c) => {
      const index = characterInfos.findIndex((char) => char.name === c.name)

      if (index !== -1) characterInfos[index] = c
      else characterInfos.push(c)
    })
  )
}

function handledialog(type: 'question' | 'decision') {
  dialogInfoType.value = type
  showdialog.value = true
}

function showJustification({ name, imageUrl }: { name: string; imageUrl: string }) {
  dialogInfoType.value = 'justification'
  const character = characterInfos.find((c) => c.name === name)
  if (!character) return

  justificationText.value = character.justification
  justificationTitle.value = character.name
  justificationImage.value = imageUrl
  showdialog.value = true
}

function createDecisionTree(data: DecisionTreeInput) {
  if (!data || !svgTree.value) return
  if (typeof data === 'string') data = JSON.parse(data)

  const treeData = organizeTreeData(data, handleCharacters)
  const node = createBaseTree({
    treeData,
    svgTree: svgTree.value,
    color: props.color,
    selectedCharacter: props.selectedCharacter
  })

  renderIcons({ node, color: props.color, handler: handledialog })
  renderImages({ node, svgTree: svgTree.value, handler: showJustification })
}
</script>

<style scoped lang="scss">
:deep(.character-image) {
  width: 100px;
  height: auto;
  border-radius: 15px;
}
#decision-tree-section {
  width: 100%;
  overflow: hidden;
  height: 1000px;
}

svg {
  width: 100%;
  height: 100%;
  margin-top: 1rem;
}

.node text {
  font: 12px sans-serif;
}

.link {
  fill: none;
  stroke: white;
  stroke-width: 12px;
}

:deep(.decision_tree_value) {
  fill: white;
}

:deep(.decision_tree_text) {
  fill: #64d8bf;
}
:deep(.decision_tree_text--gray) {
  fill: #454545;
}

:deep(.decision_tree_text--question) {
  stroke: #64d8bf;
  stroke-width: 0.6px;
}

:deep(.decision_tree_text--question-gray) {
  stroke: #454545;
  stroke-width: 0.6px;
}

:deep(circle) {
  stroke: #ccc;
}

:deep(image) {
  border-radius: 50% !important;
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

.backdrop {
  visibility: hidden;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(0);
  z-index: 3;
  transition: all 100ms;

  &-active {
    visibility: visible;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    transition: all 200ms;
  }
}
</style>
