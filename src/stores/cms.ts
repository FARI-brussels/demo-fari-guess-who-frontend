import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDirectus } from 'fari-directus-parser'

type Locale = 'en' | 'fr' | 'nl'

export const useDataStore = defineStore('data', () => {
  const locale = ref<Locale>('en')
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function getData() {
    data.value = await fetchDirectus({ slug: 'guess-who' })
    console.log({ data: data.value })
  }
  const setLocale = (l: Locale) => (l === 'fr-FR' ? (locale.value = 'fr') : (locale.value = l))

  return {
    locale,
    setLocale,
    data,
    loading,
    error,
    getData
  }
})