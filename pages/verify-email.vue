<template>
  <div class="min-h-screen flex items-center justify-center bg-black px-4">
    <div class="max-w-md w-full">
      <!-- Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="lucide:mail-check" class="w-10 h-10 text-primary" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-center text-white mb-3">
        Verifique seu email
      </h1>

      <!-- Description -->
      <p class="text-gray-400 text-center mb-2">
        Enviamos um link de confirmação para:
      </p>
      <p class="text-white font-medium text-center mb-8">
        {{ email }}
      </p>

      <!-- Instructions -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Icon name="lucide:info" class="w-4 h-4" />
          Próximos passos
        </h2>
        <ol class="space-y-2 text-sm text-gray-400">
          <li class="flex gap-2">
            <span class="text-primary font-bold">1.</span>
            <span>Abra seu email e procure por uma mensagem da Devotion</span>
          </li>
          <li class="flex gap-2">
            <span class="text-primary font-bold">2.</span>
            <span>Clique no link de confirmação</span>
          </li>
          <li class="flex gap-2">
            <span class="text-primary font-bold">3.</span>
            <span>Volte aqui e faça login</span>
          </li>
        </ol>
      </div>

      <!-- Spam Warning -->
      <div class="alert alert-warning mb-6">
        <Icon name="lucide:alert-triangle" class="w-5 h-5" />
        <div class="text-sm">
          <p class="font-bold">Não recebeu o email?</p>
          <p class="text-xs opacity-80">Verifique sua caixa de spam ou lixo eletrônico</p>
        </div>
      </div>

      <!-- Resend Button -->
      <button
        @click="resendEmail"
        :disabled="loading || cooldown > 0"
        class="btn btn-primary w-full mb-4"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <span v-else-if="cooldown > 0">Aguarde {{ cooldown }}s para reenviar</span>
        <span v-else>Reenviar email de confirmação</span>
      </button>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success mb-4">
        <Icon name="lucide:check-circle" class="w-5 h-5" />
        <span class="text-sm">{{ successMessage }}</span>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <Icon name="lucide:alert-circle" class="w-5 h-5" />
        <span class="text-sm">{{ errorMessage }}</span>
      </div>

      <!-- Back to Login -->
      <button
        @click="goToLogin"
        class="btn btn-ghost w-full"
      >
        Voltar para o login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()

const email = computed(() => route.query.email as string || '')
const loading = ref(false)
const cooldown = ref(0)
const successMessage = ref('')
const errorMessage = ref('')

let timer: NodeJS.Timeout | null = null

// Redirect if no email
onMounted(() => {
  if (!email.value) {
    router.push('/login')
  }
})

async function resendEmail() {
  if (!email.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.value
    })

    if (error) {
      throw new Error(error.message)
    }

    successMessage.value = 'Email reenviado com sucesso!'
    
    // Start cooldown
    cooldown.value = 60
    timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (e: any) {
    errorMessage.value = e.message || 'Erro ao reenviar email'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
