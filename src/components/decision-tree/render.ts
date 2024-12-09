import * as d3 from 'd3'

const notificationIconPath = '/src/assets/notification_icon.svg' as const
const characterImagePath = '/src/assets/images/' as const

const yesIconPath = '/src/assets/yes.svg' as const
const noIconPath = '/src/assets/no.svg' as const
const yesIconGrayPath = '/src/assets/yes-gray.svg' as const
const noIconGrayPath = '/src/assets/no-gray.svg' as const

const informationGainRegex = /(?<=Information Gain: )(.*)$/
const lengthRegex = /(?<=Length:\s*)(.*?)\s*(?=Information Gain)/
const questionRegex = /[^Question:](\s*(.*?)\s*)(?= Length)/

type D3Node = d3.Selection<SVGGElement, d3.HierarchyNode<any>, SVGGElement, unknown>

export function renderIcons({
  node,
  color,
  handler
}: {
  node: D3Node
  color?: string
  handler: (arg: 'question' | 'decision') => void
}) {
  console.log({ color })
  node
    .filter(
      (d) =>
        d.children && !d.data.name?.includes('Answer: yes') && !d.data.name?.includes('Answer: no')
    )
    .append('image')
    .attr(
      'xlink:href',
      color === 'gray' ? '/src/assets/question-gray.svg' : '/src/assets/question.svg'
    )
    .attr('width', 30)
    .attr('height', 30)
    .attr('x', -15)
    .attr('y', -35)
    .on('click', function (event, d) {
      handler('question')
    })

  node
    .append('text')
    .classed(
      `${color === 'gray' ? 'decision_tree_text-gray decision_tree_text--question-gray' : 'decision_tree_text decision_tree_text--question'}`,
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
    .classed(`${color === 'gray' ? 'decision_tree_text-gray' : 'decision_tree_text'}`, true)
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
    .attr('xlink:href', `${color === 'gray' ? yesIconGrayPath : yesIconPath}`)
    .attr('x', -12)
    .attr('y', -30)
    .on('click', function (event, d) {
      handler('decision')
    })
    .append('image')
    .attr('xlink:href', `${notificationIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: yes'))
    .append('text')
    .classed(color === 'gray' ? 'decision_tree_value-gray' : 'decision_tree_value', true)
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
    .attr('xlink:href', `${color === 'gray' ? noIconGrayPath : noIconPath}`)
    .attr('x', -12)
    .attr('y', -30)
    .on('click', function (_event, _d) {
      handler('decision')
    })
    .append('image')
    .attr('xlink:href', `${notificationIconPath}`)
    .attr('x', -12)
    .attr('y', -30)

  node
    .filter((d) => d?.data?.name?.includes('Answer: no'))
    .append('text')
    .classed(color === 'gray' ? 'decision_tree_value-gray' : 'decision_tree_value', true)
    .attr('x', 20)
    .attr('dy', -10)
    .text((d) => {
      const { name } = d.data
      const value = name.match(/\(.\)/)
      if (value) return value[0]
    })

  node
    .append('text')
    .classed(`${color === 'gray' ? 'decision_tree_text-gray' : 'decision_tree_text'}`, true)
    .attr('x', 20)
    .attr('dy', 3)
    .style('text-anchor', 'start')

  node
    .filter((d) => d.children)
    .append('image')
    .attr('xlink:href', notificationIconPath)
    .attr('width', 15)
    .attr('height', 15)
    .attr('x', 5)
    .attr('y', -35)
}

export const renderImages = ({
  node,
  svgTree,
  handler
}: {
  node: D3Node
  svgTree: SVGSVGElement
  handler: ({ name, imageUrl }: { name: string; imageUrl: string }) => void
}) =>
  node.each(function (d: { children: any; data: { name: string } }) {
    if (!d.children) {
      if (!d.data || !d.data.name) return
      const name = d.data.name.split(' (')[0].toLowerCase()
      if (name.includes('answer')) return
      const imageUrl = `${characterImagePath}${name}.jpg`

      const width = 40
      const height = 40
      const cornerRadius = 10

      const clipId = `clip-${name}`

      let svgDefs = d3.select(svgTree).select('defs')
      if (svgDefs.empty()) svgDefs = d3.select(svgTree).append('defs')

      svgDefs
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('rx', cornerRadius)
        .attr('ry', cornerRadius)

      const group = d3.select(this).append('g').attr('transform', 'translate(-20, 0)')

      group
        .append('image')
        .attr('xlink:href', imageUrl)
        .attr('width', width)
        .attr('height', height)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .on('click', function (_event: any, { data: { name } }: { data: { [k: string]: string } }) {
          handler({ name, imageUrl })
        })
    }
  })
