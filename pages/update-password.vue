<template>
  <div class="hero min-h-dvh bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left max-w-md">
        <h1 class="text-4xl font-bold text-primary">Nova Senha</h1>
        <p class="py-6">Digite sua nova senha abaixo.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body gap-4" @submit.prevent="handleUpdatePassword">
          
          <AppInput
            name="password"
            type="password"
            placeholder="Nova Senha"
            icon="lucide:lock"
          />

          <AppInput
            name="confirmPassword"
            type="password"
            placeholder="Confirmar Nova Senha"
            icon="lucide:lock"
          />

          <div v-if="feedbackMsg" :class="['alert text-sm py-2', isSuccess ? 'alert-success' : 'alert-error']">
            {{ feedbackMsg }}
          </div>
          
          <div class="form-control mt-4">
            <button class="btn btn-primary w-full" :disabled="isSubmitting || isSuccess">
              <span v-if="isSubmitting" class="loading loading-spinner"></span>
              {{ isSuccess ? 'Senha Atualizada!' : 'Atualizar Senha' }}
            </button>
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

const router = useRouter()
const client = useSupabaseClient()

// Schema
const updatePasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
})

// Form Setup
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(updatePasswordSchema)
})

const feedbackMsg = ref('')
const isSuccess = ref(false)

const handleUpdatePassword = handleSubmit(async (values) => {
  feedbackMsg.value = ''
  isSuccess.value = false
  
  try {
    const { error } = await client.auth.updateUser({
      password: values.password
    })

    if (error) throw error

    feedbackMsg.value = 'Senha atualizada com sucesso! Redirecionando...'
    isSuccess.value = true
    
    setTimeout(() => {
        router.push('/')
    }, 2000)

  } catch (error: any) {
    console.error('Update password error:', error)
    feedbackMsg.value = error.message || 'Erro ao atualizar senha.'
    isSuccess.value = false
  }
})
</script>
