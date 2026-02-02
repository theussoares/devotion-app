<template>
  <div class="form-control">
    <div class="relative">
      <input
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :id="name"
        :name="name"
        :class="[
          'input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors',
          { 'pl-10': icon, 'input-error': errorMessage }
        ]"
        v-bind="$attrs"
      />
      <span v-if="icon" class="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/50 pointer-events-none">
        <Icon :name="icon" class="w-5 h-5" />
      </span>
    </div>
    <label v-if="errorMessage" class="label pb-0 pt-1">
      <span class="label-text-alt text-error animate-pulse">{{ errorMessage }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'

const props = defineProps<{
  name: string
  label?: string // Optional, we are not using it visually but good for accessibilty if we wanted
  placeholder?: string
  type?: string
  icon?: string
}>()

// The useField composable handles v-model binding and validation
const { value, errorMessage } = useField(() => props.name)
</script>
