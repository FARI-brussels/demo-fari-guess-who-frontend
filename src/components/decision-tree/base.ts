import * as d3 from 'd3'

/**
 * Create the base tree structure.
 * @param svgTree - The SVG element to render the tree.
 * @param treeData - The hierarchical tree data.
 * @param color - The color theme for the tree.
 */

export const createBaseTree = ({
  svgTree,
  treeData,
  color,
  selectedCharacter
}: {
  svgTree: SVGSVGElement
  treeData: any
  color?: string
  selectedCharacter?: string
}) => {
  const svg = d3.select(svgTree)
  const width = +svg.attr('width')
  const root = d3.hierarchy(treeData)
  const treeHeight = (root.height + 1) * 100

  const g = svg.append('g').attr('transform', 'translate(0,40)')
  const tree = d3.tree().size([width - 300, treeHeight])

  tree(root)

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

  g.selectAll('.link')
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

    .style('stroke', (d) => {
      if (!selectedCharacter) return color === 'gray' ? '#959595' : '#4393DE'

      if (nodesInRightAnswerPath.has(d)) {
        if (!d.data.name.includes(selectedCharacter)) {
          const found = findSelectedCharacter(d, selectedCharacter)
          if (!found) return 'red'
        }
      }
      return color === 'gray' ? '#959595' : '#4393DE'
    })
    .style('stroke-width', (d) => (nodesInRightAnswerPath.has(d) && d.children ? '3px' : '2px'))
    .style('stroke-dasharray', (d) => (nodesInRightAnswerPath.has(d) ? null : '5,5'))

  //extra
  const node = g
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))

  node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  return node
}

function findSelectedCharacter(
  nodes: d3.HierarchyNode<any>,
  selectedCharacter: string | undefined
) {
  if (!nodes.data?.children || !nodes?.children) return false

  if (nodes.children) {
    const found = nodes.children.find(({ name }: { name: string }) => name === selectedCharacter)
    if (found) return true

    for (const child of nodes.children) {
      if (findSelectedCharacter(child, selectedCharacter)) return true
    }
  }

  if (nodes.data.children) {
    const found = nodes.data.children.find(
      ({ name }: { name: string }) => name === selectedCharacter
    )
    if (found) return true

    for (const child of nodes.data.children) {
      if (findSelectedCharacter(child, selectedCharacter)) return true
    }
  }

  return false
}

export function renderIcons(node, color, onTooltipClick) {
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
      color === 'gray' ? '/src/assets/question-gray.svg' : '/src/assets/question.svg'
    )
    .attr('width', 30)
    .attr('height', 30)
    .attr('x', -15)
    .attr('y', -35)
    .on('click', onTooltipClick)
}
