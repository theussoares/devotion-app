<template>
  <div class="calendar-widget w-full">
    <div class="flex justify-between items-center mb-6 px-2">
      <h3 class="font-bold text-lg capitalize tracking-tight text-white">{{ monthName }}</h3>
      <div class="flex gap-1">
        <button @click="offset--" class="btn btn-sm btn-circle btn-ghost text-lg text-gray-400 hover:text-white">‹</button>
        <button @click="offset++" class="btn btn-sm btn-circle btn-ghost text-lg text-gray-400 hover:text-white" :disabled="offset >= 0">›</button>
      </div>
    </div>
    
    <!-- Week Header -->
    <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2 opacity-40 uppercase tracking-widest text-gray-500">
      <div v-for="d in ['D','S','T','Q','Q','S','S']" :key="d">{{ d }}</div>
    </div>

    <!-- Days Grid -->
    <div class="grid grid-cols-7 gap-2">
      <!-- Empty slots -->
      <div v-for="n in startDayOfWeek" :key="'empty-'+n"></div>
      
      <!-- Days -->
      <div 
        v-for="day in daysInMonth" 
        :key="day" 
        class="aspect-square flex items-center justify-center rounded-full relative overflow-hidden transition-all duration-200"
        :class="[
          hasPost(day) ? 'cursor-pointer hover:scale-105 shadow-sm border border-gray-800' : 'bg-gray-900/50 text-gray-700'
        ]"
        @click="hasPost(day) ? emit('select', getDate(day)) : null"
      >
        <!-- Day Number -->
        <span v-if="!hasPost(day)" class="text-xs">{{ day }}</span>
        
        <!-- Post Indicator / Image -->
        <template v-else>
           <img 
            v-if="hasPost(day)?.image_url" 
            :src="hasPost(day)?.image_url || undefined" 
            class="absolute inset-0 w-full h-full object-cover" 
          />
          <div v-else class="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center border border-gray-700">
             <span class="text-white font-bold text-xs">🔥</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Post } from '@/types/post.types'

const props = defineProps<{
  posts?: Post[]
}>()

const emit = defineEmits(['select'])

const offset = ref(0) // 0 = current month, -1 = last month

// Helper to get current view date
const viewDate = computed(() => {
  const d = new Date()
  d.setDate(1) // Avoid edge case with 31st vs months with 30 days
  d.setMonth(d.getMonth() + offset.value)
  return d
})

const monthName = computed(() => {
  return viewDate.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const d = new Date(viewDate.value)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
})

const startDayOfWeek = computed(() => {
  const d = new Date(viewDate.value)
  d.setDate(1)
  return d.getDay() // 0 = Sunday
})

function getDate(day: number) {
  const d = new Date(viewDate.value)
  d.setDate(day)
  return d.toISOString().split('T')[0] || ''
}

function hasPost(day: number) {
  const dateStr = getDate(day)
  return props.posts?.find(p => p.created_at?.startsWith(dateStr))
}
</script>
