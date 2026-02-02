<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold text-primary">Devocional</h1>
        <p class="py-6">Conecte-se, compartilhe e mantenha sua constância espiritual.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body gap-4" @submit.prevent="handleLogin">
          <AppInput
            name="email"
            type="email"
            placeholder="Email"
            icon="lucide:mail"
          />
          
          <AppInput 
            name="password"
            type="password"
            placeholder="Senha"
            icon="lucide:lock"
          />
          <label class="label justify-end pb-0 pt-2">
            <NuxtLink to="/forgot-password" class="label-text-alt link link-hover text-base-content/70">Esqueceu a senha?</NuxtLink>
          </label>
          <div v-if="errorMsg" class="alert alert-error text-sm py-2">
            {{ errorMsg }}
          </div>
          <div class="form-control mt-4">
            <button class="btn btn-primary w-full disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              Entrar
            </button>
          </div>
          
          <AppCaptcha ref="captchaRef" @verify="token => captchaToken = token" />
          <div class="divider my-4">OU</div>
          <div class="text-center text-sm">
            Não tem conta? <NuxtLink to="/register" class="link link-primary font-semibold">Cadastre-se</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '~/schemas/auth'

const user = useSupabaseUser()
const router = useRouter()
const { login } = useAuthService()

// Form Setup
const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema)
})

const errorMsg = ref('')
const captchaToken = ref('')
const captchaRef = ref() // Reference to AppCaptcha component

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const handleLogin = handleSubmit(async (values) => {
  errorMsg.value = ''

  if (!captchaToken.value) {
      // Force captcha to show fallback if it hasn't verified yet
      captchaRef.value?.forceCheck()
      errorMsg.value = 'Por favor, complete a verificação de segurança abaixo.'
      return
  }
  
  const { success, message } = await login(values.email, values.password, captchaToken.value)

  if (!success) {
    errorMsg.value = message || 'Erro ao entrar.'
    // Reset Captcha to allow retry
    captchaRef.value?.reset()
    captchaToken.value = ''
  } else {
    // Auth state change will trigger watchEffect or middleware
  }
})
</script>
