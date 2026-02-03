<template>
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-gray-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 border border-gray-800 animate-in slide-in-from-bottom duration-300">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon name="lucide:download" class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-white">Instalar Devotion</h3>
              <p class="text-xs text-gray-500">Acesso rápido e offline</p>
            </div>
          </div>
          <button @click="handleDismiss" class="btn btn-ghost btn-sm btn-circle">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Benefits -->
        <div class="space-y-2 mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <Icon name="lucide:zap" class="w-4 h-4 text-yellow-500" />
            <span>Carregamento mais rápido</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <Icon name="lucide:wifi-off" class="w-4 h-4 text-blue-500" />
            <span>Funciona offline</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <Icon name="lucide:smartphone" class="w-4 h-4 text-green-500" />
            <span>Ícone na tela inicial</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-gray-800 rounded-xl p-4 mb-6">
          <h4 class="text-sm font-bold text-white mb-3">Como instalar:</h4>
          
          <!-- iOS Instructions -->
          <ol v-if="platform === 'ios'" class="space-y-2 text-sm text-gray-300">
            <li class="flex gap-2">
              <span class="text-primary font-bold">1.</span>
              <span>Toque no ícone <Icon name="lucide:share" class="inline w-4 h-4" /> (compartilhar)</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary font-bold">2.</span>
              <span>Role e toque em "Adicionar à Tela de Início"</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary font-bold">3.</span>
              <span>Toque em "Adicionar"</span>
            </li>
          </ol>

          <!-- Android Instructions -->
          <ol v-else-if="platform === 'android'" class="space-y-2 text-sm text-gray-300">
            <li class="flex gap-2">
              <span class="text-primary font-bold">1.</span>
              <span>Toque no menu <Icon name="lucide:more-vertical" class="inline w-4 h-4" /></span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary font-bold">2.</span>
              <span>Toque em "Instalar app" ou "Adicionar à tela inicial"</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary font-bold">3.</span>
              <span>Confirme a instalação</span>
            </li>
          </ol>

          <!-- Desktop Instructions -->
          <ol v-else class="space-y-2 text-sm text-gray-300">
            <li class="flex gap-2">
              <span class="text-primary font-bold">1.</span>
              <span>Clique no ícone <Icon name="lucide:download" class="inline w-4 h-4" /> na barra de endereço</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary font-bold">2.</span>
              <span>Ou clique no botão abaixo</span>
            </li>
          </ol>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button @click="handleDismiss" class="btn btn-ghost flex-1">
            Agora não
          </button>
          <button @click="handleInstall" class="btn btn-primary flex-1">
            <Icon name="lucide:download" class="w-4 h-4" />
            Instalar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { showModal, platform, handleInstall, handleDismiss } = usePwaInstall()
</script>
