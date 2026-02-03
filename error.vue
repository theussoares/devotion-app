<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
          <Icon name="lucide:alert-triangle" class="w-10 h-10 text-red-500" />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-black mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
        {{ error?.statusCode || '500' }}
      </h1>

      <!-- Error Message -->
      <h2 class="text-2xl font-bold mb-3 text-white">
        {{ errorTitle }}
      </h2>
      
      <p class="text-gray-400 mb-8 leading-relaxed">
        {{ errorMessage }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <button 
          @click="handleError" 
          class="btn btn-primary w-full bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700"
        >
          <Icon name="lucide:home" class="w-5 h-5 mr-2" />
          Voltar ao Início
        </button>
        
        <button 
          @click="reload" 
          class="btn btn-ghost w-full text-gray-400 hover:text-white"
        >
          <Icon name="lucide:refresh-cw" class="w-5 h-5 mr-2" />
          Tentar Novamente
        </button>
      </div>

      <!-- Debug Info (only in dev) -->
      <div v-if="isDev && error?.message" class="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800 text-left">
        <p class="text-xs font-mono text-gray-500 break-all">
          {{ error.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
})

const isDev = process.dev

const errorTitle = computed(() => {
  const code = props.error?.statusCode
  
  switch (code) {
    case 404:
      return 'Página Não Encontrada'
    case 403:
      return 'Acesso Negado'
    case 500:
      return 'Erro no Servidor'
    default:
      return 'Algo Deu Errado'
  }
})

const errorMessage = computed(() => {
  const code = props.error?.statusCode
  
  switch (code) {
    case 404:
      return 'A página que você está procurando não existe ou foi removida.'
    case 403:
      return 'Você não tem permissão para acessar esta página.'
    case 500:
      return 'Ocorreu um erro inesperado. Nossa equipe já foi notificada.'
    default:
      return 'Desculpe, encontramos um problema. Tente novamente em alguns instantes.'
  }
})

const handleError = () => clearError({ redirect: '/' })
const reload = () => window.location.reload()
</script>
