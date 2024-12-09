import type { DecisionTreeInput, DecisionTreeCharacter, DecisionTree } from './types'

export function buildTree(
  data: DecisionTreeInput,
  names: DecisionTreeCharacter[],
  index: number
): DecisionTree {
  if (index >= data.length || !names.length) {
    return names.map(({ name }) => ({
      name,
      children: []
    }))
  }

  const { question, yes, no, information_gain } = data[index]

  const yesNames = names.filter(({ name }) => yes.find((e) => e.name === name))
  const noNames = names.filter(({ name }) => no.find((e) => e.name === name))

  if (yesNames.length === 0 && noNames.length === 0)
    return names.map(({ name }) => ({
      name,
      children: []
    }))

  const formattedQuestion = `Question: ${question} Length: (${yes.length + no.length}) Information Gain: (${information_gain.toFixed(3)})`

  return [
    {
      name: formattedQuestion,
      children: [
        {
          rightAnswer: data[index].response === 'yes',
          name: `Answer: yes (${yes.length})`,
          children: yes.length ? buildTree(data, yesNames, index + 1) : []
        },
        {
          rightAnswer: data[index].response === 'no',
          name: `Answer: no (${no.length})`,
          children: no.length ? buildTree(data, noNames, index + 1) : []
        }
      ]
    }
  ]
}

export function organizeTreeData(
  data: DecisionTreeInput,
  callback: (arg: DecisionTreeInput) => void
) {
  if (!data) return null

  callback(data)

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

export const handleCharacters = (data: DecisionTreeInput) => {
  data.forEach(({ yes, no }) =>
    [...yes, ...no].forEach((c) => {
      const index = characterInfos.findIndex((char) => char.name === c.name)

      if (index !== -1) characterInfos[index] = c
      else characterInfos.push(c)
    })
  )
}
