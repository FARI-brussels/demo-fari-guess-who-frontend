<template>
  <div class="bg-color-blue">
    <div class="title-container">
      <FTitle> Guess who </FTitle>
      <FButtonIcon
        name="tooltip"
        class="tooltip"
        color="blue-light"
        small
        @click="toggleInfoCard"
      />

      <FSubTitle> AI Education</FSubTitle>
    </div>
    <FButton class="start-button" @click="router.push('/character-select')" label="start" />
    <FSlideTransition :show="showInfoCard">
      <FCard v-if="showInfoCard" @close="toggleInfoCard" @update:locale="setLocale" class="card">
        {{ data.description[locale] }}

        <div class="researchers-container">
          <span class="researchers">
            research head: <span class="research-head color-black"> {{ data.research_head }} </span>
          </span>
          <span class="researchers">
            research lead: <span class="research-lead color-black"> {{ data.research_lead }} </span>
          </span>
        </div>
        <template #footer> <div v-if="data.logo" v-html="data.logo"></div> </template>
      </FCard>
    </FSlideTransition>
    <div class="backdrop" :class="{ 'backdrop-active': showInfoCard }"></div>

    <video class="video" :src="startScreenAnimation" autoplay loop muted>
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
import {
  FTitle,
  FSubTitle,
  FButton,
  FButtonIcon,
  FCard,
  FSlideTransition
} from 'fari-component-library'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'
import startScreenAnimation from '@/assets/videos/startscreen_animation_human.mp4'
import { useDataStore } from '@/stores/cms'

const router = useRouter()
const gameStore = useGameStore()

const showInfoCard = ref(false)
const toggleInfoCard = () => (showInfoCard.value = !showInfoCard.value)

onMounted(async () => await gameStore.loadImages())
console.log('Video Source Path:', startScreenAnimation)

const { data, locale } = storeToRefs(useDataStore())
const { getData, setLocale } = useDataStore()

onMounted(getData)
</script>

<style scoped lang="scss">
.title {
  font-size: 3rem;
}

.title-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 20%;
  left: 30%;
}

.start-button {
  position: absolute;
  left: 45%;
  top: 45%;
}

.video {
  width: 100%;
  height: auto;
  z-index: -1;
  pointer-events: none;
  object-fit: cover;
}

.tooltip {
  position: absolute;
  left: 29rem;
}

.card {
  position: absolute;
  top: 25%;
  left: 2.5%;
  z-index: 3;
}

.researchers-container {
  margin-top: auto;
  display: flex;
  flex-direction: column;
}

.researchers {
  color: #888;
  text-transform: uppercase;
}

.research-head,
.research-lead {
  text-transform: none;
}

.backdrop {
  visibility: hidden;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(0);
  z-index: 2;
  transition: all 100ms;

  &-active {
    visibility: visible;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(2px);
    transition: all 300ms;
  }
}
</style>
