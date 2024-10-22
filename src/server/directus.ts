import { createDirectus, rest, readItems, readItem } from '@directus/sdk'

const client = createDirectus('https://fari-cms.directus.app').with(rest())

export async function getDirectusData() {
  try {
    const data = await client.request(
      readItems('ally_case', {
        fields: ['*.*']
      })
    )
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
