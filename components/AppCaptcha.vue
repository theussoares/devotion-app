<template>
  <div class="captcha-container">
    <ClientOnly>
      <!-- Instance 1: Invisible (Zero Layout Impact) -->
      <div v-if="mode === 'invisible'" class="fixed opacity-0 pointer-events-none">
         <vue-turnstile 
            v-model="token"
            ref="turnstileInvisible"
            :site-key="config.public.turnstileSiteKey"
            appearance="interaction-only" 
            @verify="onVerify"
            @error="onError"
            @expired="onExpire"
         />
      </div>

      <!-- Instance 2: Visible (Fallback) -->
      <div v-if="mode === 'visible'" class="w-full flex justify-center py-4 min-h-[70px]">
         <vue-turnstile 
            v-model="token"
            ref="turnstileVisible"
            :site-key="config.public.turnstileSiteKey" 
            appearance="always"
            @verify="onVerify"
            @error="onErrorVisible"
         />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import VueTurnstile from 'vue-turnstile'

const emit = defineEmits(['verify', 'validating'])
const config = useRuntimeConfig()

const mode = ref<'invisible' | 'visible'>('invisible')
const token = ref('')
const turnstileInvisible = ref()
const turnstileVisible = ref()

// Watch for token changes to emit immediately
watch(token, (val) => {
    if (val) emit('verify', val)
})

function onVerify(val: string) {
    token.value = val
    emit('verify', val)
}

function onExpire() {
    token.value = ''
    emit('verify', '')
}

function onError() {
    console.warn('Turnstile Invisible failed/timeout, switching to Visible mode.')
    mode.value = 'visible'
}

function onErrorVisible() {
    console.error('Turnstile Visible also failed. Check network or keys.')
}

// Public method to force a check or switch mode if stuck
function forceCheck() {
    if (mode.value === 'invisible' && !token.value) {
        mode.value = 'visible'
    } else if (mode.value === 'visible') {
        reset()
    }
}

function reset() {
    token.value = ''
    if (mode.value === 'invisible' && turnstileInvisible.value) {
        turnstileInvisible.value.reset()
    } else if (mode.value === 'visible' && turnstileVisible.value) {
        turnstileVisible.value.reset()
    }
}

defineExpose({ forceCheck, reset })
</script>
