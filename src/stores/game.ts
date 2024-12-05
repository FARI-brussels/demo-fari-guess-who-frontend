import { defineStore } from 'pinia'
import { ref } from 'vue'

const importImages = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,svg}')
const importJson = import.meta.glob('/src/assets/characters.json')

export const useGameStore = defineStore('gameStore', () => {
  const allCharacters = ref<{ name: string; path: string; remaining: boolean }[]>([])
  const remainingCharacters = ref<{ name: string; path: string }[]>([])
  const selectedCharacter = ref<string | null>(null)

  const selectCharacter = (character: string) => (selectedCharacter.value = character)

  function filterCharacters(remaining: { justification: string; name: string }[]) {
    console.log({ remaining })
    allCharacters.value.forEach((c) => {
      if (!remaining.find((r) => r.name === c.name)) c.remaining = false
    })
  }

  async function loadImages() {
    const jsonModules = Object.values(importJson)
    const jsonModule = await jsonModules[0]()
    const characterData = jsonModule.default || []

    const imagePaths = []
    for (const path in importImages) {
      const module = await importImages[path]()
      const fileName = path.split('/').pop() || ''
      const name = capitalize(fileName.replace(/\.[^/.]+$/, ''))

      const characterInfo = characterData.find((character) => character.name === name)
      let description_short = ''
      if (characterInfo && characterInfo.description) {
        const sentences = characterInfo.description.split('. ')
        description_short = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
      }

      imagePaths.push({
        name: capitalize(name),
        path: module.default,
        remaining: true,
        description_short,
        ...characterInfo
      })
    }

    const shuffledImages = shuffleArray(imagePaths)
    allCharacters.value = shuffledImages
    remainingCharacters.value = shuffledImages
  }

  return {
    allCharacters,
    remainingCharacters,
    selectedCharacter,
    selectCharacter,
    filterCharacters,
    loadImages
  }
})

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const capitalize = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase())
