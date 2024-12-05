<template>
  <div id="decision-tree-section">
    <svg width="1300" height="1000" ref="svgTree"></svg>
  </div>
  <Transition>
    <div v-if="showTooltip" ref="tooltip" class="tooltip bg-color-blue color-white p-md rounded">
      <img v-if="tooltipInfoType === 'question'" src="@/assets/swirl.svg" />
      <img v-if="tooltipInfoType === 'decision'" src="@/assets/decision.svg" />
      <img
        v-if="tooltipInfoType === 'justification'"
        :src="tooltipJustificationImage"
        class="portrait"
      />
      <hr class="border-color-primary mb-md" />

      <strong
        v-if="tooltipInfoType === 'question' || tooltipInfoType === 'decision'"
        class="font-weight-black font-size-body"
        >{{ tooltipText[tooltipInfoType]?.title }}
      </strong>

      <p v-if="tooltipInfoType === 'question' || tooltipInfoType === 'decision'">
        {{ tooltipText[tooltipInfoType]?.text }}
      </p>

      <strong v-if="tooltipInfoType === 'justification'" class="font-weight-black font-size-body"
        >{{ tooltipJustificationTitle }}
      </strong>

      <p v-if="tooltipInfoType === 'justification'">{{ tooltipJustification }}</p>
    </div>
  </Transition>
  <div class="backdrop" :class="{ 'backdrop-active': showTooltip }"></div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, nextTick, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'

type DecisionTreeName = { name: string; justification: string }
type DecisionTreeNames = DecisionTreeName[]

type DecisionTreeInput = [
  {
    no: DecisionTreeNames[]
    yes: DecisionTreeNames[]
    question: string
    response: 'yes' | 'no'
    information_gain: number
  }
]

const tooltipText = {
  question: {
    icon: 'swirl',
    title: 'Hallucinations',
    text: `AI systems, especially those based on large language models, are known for occasionally generating inaccurate or entirely fabricated information—a phenomenon commonly referred to as “hallucination.” This issue arises because these models are trained on vast datasets that include patterns, but they lack a genuine understanding of the real-world context or factual grounding. When given a prompt or asked a question, they may "fill in the gaps" by generating responses that sound plausible yet lack a basis in reality.`
  },
  decision: {
    icon: 'decision',
    title: 'Decisions',
    text: `Decisions:  Decisions in large language models (LLMs) are based on probability and pattern recognition, not true understanding. When generating text, an LLM selects words based on likely sequences from its training data, mimicking human responses but without genuine judgment. This approach enables versatility but lacks the nuanced decision-making and contextual awareness that humans bring, which is essential in fields requiring precision and ethics.`
  }
}

const tooltipJustification = ref('')
const tooltipJustificationTitle = ref('')
const tooltipJustificationImage = ref('')

const characterImagePath = '/src/assets/images/' as const
const yesIconPath = '/src/assets/yes.svg' as const
const noIconPath = '/src/assets/no.svg' as const
const notificationIconPath = '/src/assets/notification_icon.svg' as const

const yesIconGrayPath = '/src/assets/yes-gray.svg' as const
const noIconGrayPath = '/src/assets/no-gray.svg' as const

const questionRegex = /[^Question:](\s*(.*?)\s*)(?= Length)/
const lengthRegex = /(?<=Length:\s*)(.*?)\s*(?=Information Gain)/
const informationGainRegex = /(?<=Information Gain: )(.*)$/

const props = defineProps<{
  data: JSON
  color?: 'grey' | 'default'
  selectedCharacter?: string
}>()

const svgTree = ref<SVGSVGElement | null>(null)

const tooltip = ref(null)
const showTooltip = ref(false)
const tooltipInfoType = ref<'question' | 'decision' | 'justification'>('question')
onClickOutside(tooltip, () => (showTooltip.value = false))

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

function createDecisionTree(data: DecisionTreeInput) {
  if (typeof data === 'string') data = JSON.parse(data)
  const treeData = organizeTreeData(data)
  console.log({ treeDataOrganized: treeData })
  const node = createBaseTree(treeData)
  console.log({ data, node })
  renderIcons(node)
  renderImages(node)
}

function createBaseTree(treeData) {
  const svg = d3.select(svgTree.value)

  const width = +svg.attr('width')
  const root = d3.hierarchy(treeData)

  const treeHeight = (root.height + 1) * 100

  const g = svg.append('g').attr('transform', 'translate(0,40)')
  const tree = d3.tree().size([width - 300, treeHeight])
  svg.append('svg:defs')
  console.log({ treeData })
  tree(root)

  g.attr('height', treeHeight)

  const nodesInRightAnswerPath = new Set()
  root.descendants().forEach((node) => {
    if (node.data.rightAnswer) {
      let current = node
      while (current) {
        nodesInRightAnswerPath.add(current)
        current = current.parent
      }
    }
  })

  const link = g
    .selectAll('.link')
    .data(root.descendants().slice(1))
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr(
      'd',
      (d) => `
        M${d.x},${d.y}
        L${d.x},${(d.y + d.parent.y) / 2}
        L${d.parent.x},${d.parent.y}
      `
    )
    .style('fill', 'none')
    .style('stroke', props.color === 'gray' ? '#959595' : '#4393DE')
    .style('stroke-width', (d) => (nodesInRightAnswerPath.has(d) && d.children ? '3px' : '2px'))
    .style('stroke-dasharray', (d) => (nodesInRightAnswerPath.has(d) ? null : '5,5'))

  const node = g
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))

  node.attr('transform', (d) => `translate(${d.x},${d.y})`)

  return node
}

function buildTree(data: DecisionTreeInput, characters: DecisionTreeNames, index: number) {
  if (index >= data.length || characters.length === 0) {
    return characters.map(({ name, justification }) => ({
      name: `${name}`,
      justification
    }))
  }
  const question = data[index]

  const yesNames = characters.filter((char) => question.yes.find((y) => y.name === char.name))
  const noNames = characters.filter((char) => question.no.find((n) => n.name === char.name))

  if (yesNames.length === 0 && noNames.length === 0) {
    return characters.map(({ name, justification }) => ({ name, justification }))
  }

  const formattedQuestion = `Question: ${question.question} Length: (${yesNames.length + noNames.length}) Information Gain: (${question.information_gain.toFixed(3)})`

  return [
    {
      name: formattedQuestion,
      children: [
        {
          rightAnswer: data[index].response === 'yes',
          name: `Answer: yes (${yesNames.length})`,
          children: yesNames.length ? buildTree(data, yesNames, index + 1) : []
        },
        {
          rightAnswer: data[index].response === 'no',
          name: `Answer: no (${noNames.length})`,
          children: noNames.length ? buildTree(data, noNames, index + 1) : []
        }
      ]
    }
  ]
}

function organizeTreeData(data: DecisionTreeInput) {
  if (!data) return null
  return {
    name: `Question: ${data[0].question} Length: (${data[0].yes.length + data[0].no.length}) Information Gain: (${data[0].information_gain.toFixed(3)})`,
    children: [
      {
        rightAnswer: data[0].response === 'yes',
        response: data[0].response,
        name: `Answer: yes (${data[0].yes.length})`,
        children: buildTree(data, data[0].yes, 1)
      },
      {
        rightAnswer: data[0].response === 'no',
        response: data[0].response,
        name: `Answer: no (${data[0].no.length})`,
        children: buildTree(data, data[0].no, 1)
      }
    ]
  }
}

function renderIcons(node) {
  node
    .filter(
      (d) =>
        d.children &&
        !d.data?.name?.includes('Answer: yes') &&
        !d.data?.name?.includes('Answer: no')
    )
    .append('image')
    .attr(
      'xlink:href',
      props.color === 'gray' ? '/src/assets/question-gray.svg' : '/src/assets/question.svg'
    )
    .attr('width', 30)
    .attr('height', 30)
    .attr('x', -15)
    .attr('y', -35)
    .on('click', function (event, d) {
      tooltipInfoType.value = 'question'
      showTooltip.value = true
    })

  node
    .append('text')
    .classed(
      `${props.color === 'gray' ? 'decision_tree_text-gray decision_tree_text--question-gray' : 'decision_tree_text decision_tree_text--question'}`,
      true
    )
    .attr('x', -25)
    .attr('dy', -15)
    .style('text-anchor', 'end')
    .text((d) => {
      const { name } = d.data
      if (!name) return
      const question = name.match(questionRegex)
      if (question) return question[0]
    })

  node
    .append('text')
    .classed(`${props.color === 'gray' ? 'decision_tree_text-gray' : 'decision_tree_text'}`, true)
    .attr('x', 30)
    .attr('dy', -15)
    .text((d) => {
      const { name } = d.data
      if (!name) return
      const length = name.match(lengthRegex)
      const infoGain = name.match(informationGainRegex)
      if (length && infoGain) return length[0] + infoGain[0]
    })

  node
    .filter((d) => d.data?.name?.includes('Answer: yes'))
    .append('image')
    .attr('xlink:href', `${props.color === 'gray' ? yesIconGrayPath : yesIconPath}`)
    .attr('x', -12)
    .attr('y', -30)
    .on('click', function (event, d) {
      tooltipInfoType.value = 'decision'
      showTooltip.value = true
    })
    .append('image')
    .attr('xlink:href', `${notificationIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: yes'))
    .append('text')
    .classed(props.color === 'gray' ? 'decision_tree_value-gray' : 'decision_tree_value', true)
    .attr('x', 20)
    .attr('dy', -10)
    .text((d) => {
      const { name } = d.data
      if (!name) return
      const value = name.match(/\(.\)/)
      if (value) return value[0]
    })

  node
    .filter((d) => d?.data?.name?.includes('Answer: no'))
    .append('image')
    .attr('xlink:href', `${props.color === 'gray' ? noIconGrayPath : noIconPath}`)
    .attr('x', -12)
    .attr('y', -30)
    .on('click', function (event, d) {
      tooltipInfoType.value = 'decision'
      showTooltip.value = true
    })
    .append('image')
    .attr('xlink:href', `${notificationIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: no'))
    .append('text')
    .classed(props.color === 'gray' ? 'decision_tree_value-gray' : 'decision_tree_value', true)
    .attr('x', 20)
    .attr('dy', -10)
    .text((d) => {
      const { name } = d.data
      const value = name.match(/\(.\)/)
      if (value) return value[0]
    })

  node
    .append('text')
    .classed(`${props.color === 'gray' ? 'decision_tree_text-gray' : 'decision_tree_text'}`, true)
    .attr('x', 20)
    .attr('dy', 3)
    .style('text-anchor', 'start')

  node
    .filter((d) => {
      return d.children
    })
    .append('image')
    .attr('xlink:href', notificationIconPath)
    .attr('width', 15)
    .attr('height', 15)
    .attr('x', 5)
    .attr('y', -35)
}

function renderImages(node) {
  node.each(function (d) {
    if (!d.children) {
      if (!d.data || !d.data.name) return
      const name = d.data.name.split(' (')[0].toLowerCase()
      if (name.includes('answer')) return
      const imageUrl = `${characterImagePath}${name}.jpg`

      const width = 40
      const height = 40
      const cornerRadius = 8

      const clipId = `clip-${name}`

      const svgDefs = d3.select(svgTree.value).select('defs')
      if (svgDefs.empty()) {
        svgDefs.append('defs')
      }
      svgDefs
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('rx', cornerRadius)
        .attr('ry', cornerRadius)
        .attr('width', width)
        .attr('height', height)

      const group = d3.select(this).append('g').attr('transform', 'translate(-20, 0)')

      group
        .append('image')
        .attr('xlink:href', imageUrl)
        .attr('width', width)
        .attr('height', height)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .on('click', function (event, { data: { name, justification } }: { [k: string]: string }) {
          tooltipInfoType.value = 'justification'
          tooltipJustificationTitle.value = name
          tooltipJustification.value = justification
          tooltipJustificationImage.value = imageUrl
          showTooltip.value = true
        })
    }
  })
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

.tooltip {
  position: fixed;
  top: 40rem;
  display: flex;
  flex-direction: column;
  z-index: 4;
  left: 14rem;
  width: 40rem;
  img {
    width: 3rem;
    margin-bottom: 1rem;
    margin-left: auto;
    margin-right: auto;
  }
  .portrait {
    width: 180px;
    border-radius: 1rem;
  }
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
