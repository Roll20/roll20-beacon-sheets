import { defineStore } from 'pinia'
import { ref } from 'vue'
import { emptyLevelUp } from '@/builder/levelUp.js'

export const useLevelUpStore = defineStore('levelUp', () => {
  const lu = ref(emptyLevelUp())
  const open = ref(false)
  const step = ref(0)
  const reviewing = ref(false)
  const resumed = ref(false)

  const start = (from, saved = null) => {
    lu.value = saved ? JSON.parse(JSON.stringify(saved)) : emptyLevelUp(from)
    resumed.value = !!saved
    step.value = 0
    reviewing.value = false
    open.value = true
  }

  const close = () => {
    open.value = false
    reviewing.value = false
  }

  return { lu, open, step, reviewing, resumed, start, close }
})
