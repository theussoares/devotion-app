<template>
  <div class="relative w-full">
    <div class="relative">
      <!-- Search Icon -->
      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <Icon name="lucide:search" class="w-5 h-5" />
      </div>

      <!-- Input -->
      <input
        v-model="modelValue"
        type="text"
        placeholder="Buscar usuários..."
        class="input input-bordered w-full pl-12 pr-12 bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-primary"
      />

      <!-- Clear Button -->
      <button
        v-if="modelValue"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        @click="$emit('clear')"
      >
        <Icon name="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <!-- Character hint -->
    <p v-if="modelValue && modelValue.length < 2" class="text-xs text-gray-500 mt-2 ml-1">
      Digite pelo menos 2 caracteres para buscar
    </p>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
}>()

const modelValue = useVModel(props, 'modelValue', emit)
</script>
