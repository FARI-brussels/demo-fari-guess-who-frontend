<template>
  <div id="decision-tree-section">
    <svg width="1300" height="1000" ref="svgTree"></svg>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, nextTick, watchEffect } from 'vue'

type DecisionTreeName = string
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

const characterImagePath = '/src/assets/images/' as const
const yesIconPath = '/src/assets/yes.svg' as const
const noIconPath = '/src/assets/no.svg' as const

const yesIconGrayPath = '/src/assets/yes-gray.svg' as const
const noIconGrayPath = '/src/assets/no-gray.svg' as const

const questionRegex = /[^Question:](\s*(.*?)\s*)(?= Length)/
const lengthRegex = /(?<=Length:\s*)(.*?)\s*(?=Information Gain)/
const informationGainRegex = /(?<=Information Gain: )(.*)$/

const props = defineProps<{ data: JSON; color?: 'grey' | 'default' }>()

const svgTree = ref<SVGSVGElement | null>(null)

onMounted(() => createDecisionTree(props.data))

watchEffect(() => {
  if (svgTree.value) {
    console.log(props.data, 'hi')
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
  const node = createBaseTree(treeData)

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
  const defs = svg.append('svg:defs')
  tree(root)

  g.attr('height', treeHeight)

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
    .style('stroke-width', '2px')
    .style('stroke-dasharray', '5,5')

  const node = g
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))

  node.attr('transform', (d) => `translate(${d.x},${d.y})`)

  return node
}

function buildTree(data: DecisionTreeInput, names: DecisionTreeNames, index: number) {
  if (index >= data.length || names.length === 0) {
    return names.map((name) => ({
      name: `${name} (1)`
    }))
  }

  const question = data[index]

  const yesNames = names.filter((name) => question.yes.includes(name))
  const noNames = names.filter((name) => question.no.includes(name))

  if (yesNames.length === 0 && noNames.length === 0) {
    return names.map((name) => ({ name: `${name} (leaf)` }))
  }

  const formattedQuestion = `Question: ${question.question} Length: (${yesNames.length + noNames.length}) Information Gain: (${question.information_gain.toFixed(3)})`

  return [
    {
      name: formattedQuestion,
      children: [
        {
          name: `Answer: Yes (${yesNames.length})`,
          children: yesNames.length ? buildTree(data, yesNames, index + 1) : []
        },
        {
          name: `Answer: No (${noNames.length})`,
          children: noNames.length ? buildTree(data, noNames, index + 1) : []
        }
      ]
    }
  ]
}

function organizeTreeData(data: DecisionTreeInput) {
  if (!data) return null
  console.log({ data, type: typeof data })
  return {
    name: `Question: ${data[0].question} Length: (${data[0].yes.length + data[0].no.length}) Information Gain: (${data[0].information_gain.toFixed(3)})`,
    children: [
      {
        name: `Answer: Yes (${data[0].yes.length})`,
        children: buildTree(data, data[0].yes, 1)
      },
      {
        name: `Answer: No (${data[0].no.length})`,
        children: buildTree(data, data[0].no, 1)
      }
    ]
  }
}

function renderIcons(node) {
  console.log({ color: props.color })
  node
    .filter(
      (d) =>
        d.children &&
        !d.data?.name?.includes('Answer: Yes') &&
        !d.data?.name?.includes('Answer: No')
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
    .filter((d) => d.data?.name?.includes('Answer: Yes'))
    .append('image')
    .attr('xlink:href', `${props.color === 'gray' ? yesIconGrayPath : yesIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: Yes'))
    .append('text')
    .classed('decision_tree_value', true)
    .attr('x', 20)
    .attr('dy', -10)
    .text((d) => {
      const { name } = d.data
      if (!name) return
      const value = name.match(/\(.\)/)
      if (value) return value[0]
    })

  node
    .filter((d) => d?.data?.name?.includes('Answer: No'))
    .append('image')
    .attr('xlink:href', `${props.color === 'gray' ? noIconGrayPath : noIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: No'))
    .append('text')
    .classed('decision_tree_value', true)
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
}

function renderImages(node) {
  node.each(function (d) {
    if (!d.children) {
      if (!d.data || !d.data.name) return
      const name = d.data.name.split(' (')[0].toLowerCase()

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
  height: 100%;
  overflow: hidden;
}

svg {
  width: 100%;
  height: 100%;
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
</style>
