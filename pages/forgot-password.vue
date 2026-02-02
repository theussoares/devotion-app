<template>
  <div class="hero min-h-dvh bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left max-w-md">
        <h1 class="text-4xl font-bold text-primary">Recuperar Acesso</h1>
        <p class="py-6">Informe seu telefone para que nossa equipe de suporte entre em contato e ajude a recuperar sua senha.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body gap-4" @submit.prevent="handleSubmitRequest">
          
          <AppInput
            name="phone"
            type="tel"
            placeholder="Seu telefone (com DDD)"
            icon="lucide:phone"
          />

          <AppCaptcha @verify="token => captchaToken = token" />

          <div v-if="feedbackMsg" :class="['alert text-sm py-2', isSuccess ? 'alert-success' : 'alert-error']">
            {{ feedbackMsg }}
          </div>
          
          <div class="form-control mt-4">
            <button class="btn btn-primary w-full" :disabled="isSubmitting || isSuccess">
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              {{ isSuccess ? 'Enviado!' : 'Solicitar Ajuda' }}
            </button>
          </div>
          
          <div class="text-center text-sm mt-2">
            <NuxtLink to="/login" class="link link-primary">Voltar para Login</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { supportSchema } from '~/schemas/support'

const { createSupportRequest } = useSupport()

// Form Setup
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(supportSchema)
})

const feedbackMsg = ref('')
const isSuccess = ref(false)
const captchaToken = ref('')

const handleSubmitRequest = handleSubmit(async (values) => {
  feedbackMsg.value = ''
  isSuccess.value = false

  if (!captchaToken.value) {
    feedbackMsg.value = 'Aguarde a verificação de segurança'
    return
  }
  
  const { success, message } = await createSupportRequest(values.phone, captchaToken.value)

  if (!success) {
    feedbackMsg.value = message
    isSuccess.value = false
  } else {
    feedbackMsg.value = 'Recebemos sua solicitação! Entraremos em contato em breve.'
    isSuccess.value = true
    resetForm()
  }
})
</script>
