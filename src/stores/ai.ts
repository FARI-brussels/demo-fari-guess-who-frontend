// store.ts
import { defineStore } from 'pinia'
import { useGameStore } from './game'
import { useWebSocketStore } from './ws'
import { ref } from 'vue'

export const useAIStore = defineStore('aiStore', () => {
  const { filterCharacters } = useGameStore()
  const ws = useWebSocketStore()

  const loading = ref(false)
  const gameStarted = ref(false)
  const winner = ref<'ai' | 'human' | null>(null)

  const robotAnswer = ref({
    response: ''
  })

  const robotQuestion = ref({
    robot_question: '',
    attribute: '',
    max_gain: '',
    value: ''
  })

  async function initialize() {
    loading.value = true
    await fetch('http://localhost:3000/initialize')
    loading.value = false
  }

  async function askQuestion(prompt: string) {
    loading.value = true
    const res = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      body: prompt
    })

    const json = await res.json()

    const { response, remaining_characters, robot_question, attribute, value, max_gain } = json
    robotAnswer.value = response

    robotQuestion.value = {
      robot_question,
      attribute,
      max_gain,
      value
    }

    filterCharacters(remaining_characters)
    console.log(remaining_characters.length)
    if (remaining_characters.length === 1) winner.value = 'human'
    return json
  }

  async function answerQuestion(answer: boolean) {
    const body = JSON.stringify({
      ...robotQuestion.value,
      response: answer ? 'yes' : 'no'
    })

    const res = await fetch('http://localhost:3000/answer', {
      method: 'POST',
      body
    })
    const json = await res.json()
    const { decision_tree = null, remaining_characters = null } = json.response

    if (remaining_characters?.length === 1) winner.value = 'ai'

    ws.sendFastify(JSON.stringify({ decision_tree, remaining_characters }))

    return
  }

  return { initialize, askQuestion, answerQuestion, loading, robotQuestion, winner }
})
