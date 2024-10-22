import { defineStore } from 'pinia'
import { ref } from 'vue'

const importImages = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,svg}')

export const useGameStore = defineStore('gameStore', () => {
  const allCharacters = ref<{ name: string; path: string; remaining: boolean }[]>([])
  const remainingCharacters = ref<{ name: string; path: string }[]>([])

  function filterCharacters(remaining: { justification: string; name: string }[]) {
    allCharacters.value.forEach((c) => {
      if (!remaining.find((r) => r.name === c.name)) c.remaining = false
    })
  }

  async function loadImages() {
    const imagePaths = []
    for (const path in importImages) {
      const module = await importImages[path]()
      const fileName = path.split('/').pop() || ''
      const name = fileName.replace(/\.[^/.]+$/, '')
      imagePaths.push({
        name: capitalize(name),
        path: module.default,
        remaining: true
      })
    }

    const shuffledImages = shuffleArray(imagePaths)
    allCharacters.value = shuffledImages
    remainingCharacters.value = shuffledImages
  }

  return { allCharacters, remainingCharacters, filterCharacters, loadImages }
})

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const capitalize = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase())
