export type DecisionTreeCharacter = { name: string; justification: string }

export type DecisionTreeInput = [
  {
    no: DecisionTreeCharacter[]
    yes: DecisionTreeCharacter[]
    question: string
    response: 'yes' | 'no'
    information_gain: number
  }
]

export type DecisionTreeNode = {
  name: string
  children?: DecisionTreeNode[]
  rightAnswer?: boolean
}

export type DecisionTree = DecisionTreeNode[]
