<template>
  <div class="border-t border-gray-800 bg-base-100 p-3 pb-6 safe-area-bottom">
    <div class="flex gap-2 items-end">
        <div class="relative flex-1">
            <textarea
                v-model="text"
                class="textarea textarea-bordered textarea-sm w-full resize-none leading-normal pr-10 min-h-[2.5rem] max-h-24"
                rows="1"
                placeholder="Adicione um comentário..."
                :disabled="submitting"
                @input="adjustHeight"
                @keydown.enter.prevent="submit"
                ref="textareaRef"
            ></textarea>
        </div>
        
        <button 
            class="btn btn-primary btn-sm btn-circle"
            :disabled="!isValid || submitting"
            @click="submit"
        >
            <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
            <Icon v-else name="lucide:send" class="w-4 h-4 ml-0.5" />
        </button>
    </div>
    <div class="text-right px-1 mt-1">
        <span 
            class="text-[10px]" 
            :class="text.length > 500 ? 'text-error' : 'text-gray-600'"
        >
            {{ text.length }}/500
        </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = defineProps<{
  submitting: boolean
}>()

const emit = defineEmits(['submit'])

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isValid = computed(() => {
  const t = text.value.trim()
  return t.length > 0 && t.length <= 500
})

function adjustHeight() {
    if (!textareaRef.value) return
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
}

function submit() {
  if (!isValid.value || props.submitting) return
  emit('submit', text.value)
  text.value = ''
  if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
  }
}
</script>

<style scoped>
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 1.5rem);
}
</style>
