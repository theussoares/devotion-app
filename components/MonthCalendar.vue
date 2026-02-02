<template>
  <div class="calendar-widget">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg capitalize">{{ monthName }}</h3>
      <div class="flex gap-2">
        <button @click="offset--" class="btn btn-sm btn-circle btn-ghost">←</button>
        <button @click="offset++" class="btn btn-sm btn-circle btn-ghost" :disabled="offset >= 0">→</button>
      </div>
    </div>
    
    <div class="grid grid-cols-7 gap-1 text-center text-sm mb-2 opacity-50">
      <div v-for="d in ['D','S','T','Q','Q','S','S']" :key="d">{{ d }}</div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <!-- Empty slots for days before start of month -->
      <div v-for="n in startDayOfWeek" :key="'empty-'+n" class="p-2"></div>
      
      <!-- Days -->
      <div 
        v-for="day in daysInMonth" 
        :key="day" 
        class="aspect-square flex items-center justify-center rounded-box relative overflow-hidden"
        :class="hasPost(day) ? 'bg-primary text-primary-content font-bold' : 'bg-base-200 text-base-content/50'"
        @click="emit('select', getDate(day))"
      >
        <span class="z-10 relative">{{ day }}</span>
        <!-- Optional: Show Image Background if day has post (advanced) -->
        <img 
          v-if="hasPost(day)?.image_url" 
          :src="hasPost(day)?.image_url || undefined" 
          class="absolute inset-0 w-full h-full object-cover opacity-60 z-0" 
        />
        <div v-if="hasPost(day)?.image_url" class="absolute inset-0 bg-black/30 z-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  posts?: { created_at: string, image_url?: string | null }[]
}>()

const emit = defineEmits(['select'])

const offset = ref(0) // 0 = current month, -1 = last month

// Helper to get current view date
const viewDate = computed(() => {
  const d = new Date()
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
  return props.posts?.find(p => p.created_at.startsWith(dateStr))
}
</script>

<style scoped>
.calendar-widget {
  @apply bg-base-100 p-4 rounded-xl shadow-sm border border-base-200;
}
</style>
