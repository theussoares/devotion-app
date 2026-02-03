<template>
  <div class="hero min-h-dvh bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left max-w-md">
        <h1 class="text-4xl font-bold text-primary">Recuperar Senha</h1>
        <p class="py-6">Informe seu email para receber um link de redefinição de senha.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body gap-4" @submit.prevent="handleSubmitRequest">
          
          <AppInput
            name="email"
            type="email"
            placeholder="Seu email cadastrado"
            icon="lucide:mail"
          />

          <AppCaptcha @verify="token => captchaToken = token" />

          <div v-if="feedbackMsg" :class="['alert text-sm py-2', isSuccess ? 'alert-success' : 'alert-error']">
            {{ feedbackMsg }}
          </div>
          
          <div class="form-control mt-4">
            <button class="btn btn-primary w-full" :disabled="isSubmitting || isSuccess">
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              {{ isSuccess ? 'Email Enviado!' : 'Enviar Link' }}
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
import { z } from 'zod'

// Schema for just email
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

const client = useSupabaseClient()
const config = useRuntimeConfig()

// Form Setup
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema)
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
  
  try {
    const { error } = await client.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${config.public.siteUrl}/update-password`,
      captchaToken: captchaToken.value
    })

    if (error) throw error

    feedbackMsg.value = 'Verifique seu email para redefinir a senha.'
    isSuccess.value = true
    resetForm()
  } catch (error: any) {
    console.error('Reset password error:', error)
    feedbackMsg.value = error.message || 'Erro ao enviar email. Tente novamente.'
    isSuccess.value = false
  }
})
</script>
