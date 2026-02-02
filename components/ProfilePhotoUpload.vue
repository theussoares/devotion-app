<template>
  <div>
    <!-- Trigger Button (Avatar) -->
    <div class="relative cursor-pointer group" @click="openModal">
      <div class="avatar">
        <div class="w-24 rounded-full ring-0 ring-offset-0">
          <img :src="(currentAvatar || defaultAvatar) ?? defaultAvatar" :alt="username || 'User'" />
        </div>
      </div>
      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Icon name="lucide:camera" class="w-8 h-8 text-white" />
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="isOpen" class="modal modal-open z-[5000]">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg mb-4">Alterar foto de perfil</h3>

          <!-- Preview -->
          <div v-if="previewUrl" class="flex justify-center mb-4">
            <div class="avatar">
              <div class="w-32 rounded-full ring-0 ring-offset-0">
                <img :src="previewUrl" alt="Preview" />
              </div>
            </div>
          </div>

          <!-- File Input -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Escolha uma imagem</span>
            </label>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="file-input file-input-bordered w-full"
              @change="handleFileSelect"
            />
            <label class="label">
              <span class="label-text-alt text-gray-500">Máximo 5MB • JPG, PNG ou WEBP</span>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <Icon name="lucide:alert-circle" class="w-5 h-5" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Actions -->
          <div class="modal-action">
            <button class="btn btn-ghost" @click="closeModal" :disabled="uploading">
              Cancelar
            </button>
            <button
              class="btn btn-primary"
              @click="handleUpload"
              :disabled="!selectedFile || uploading"
            >
              <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
              <span v-else>Salvar</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="closeModal">close</button>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentAvatar?: string | null
  username?: string | null
}>()

const emit = defineEmits<{
  uploaded: [url: string]
}>()

const { uploadAvatar, uploading, validateImage } = useProfilePhoto()

const isOpen = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const defaultAvatar = computed(() => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${props.username || 'User'}`
})

function openModal() {
  isOpen.value = true
  errorMessage.value = null
}

function closeModal() {
  isOpen.value = false
  selectedFile.value = null
  previewUrl.value = null
  errorMessage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validar
  const validation = validateImage(file)
  if (!validation.valid) {
    errorMessage.value = validation.error || 'Arquivo inválido'
    selectedFile.value = null
    previewUrl.value = null
    return
  }

  // Criar preview
  selectedFile.value = file
  errorMessage.value = null

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleUpload() {
  if (!selectedFile.value) return

  try {
    const url = await uploadAvatar(selectedFile.value)
    emit('uploaded', url)
    closeModal()
    
    // Toast de sucesso (opcional, se tiver toast system)
    // showToast('Foto atualizada com sucesso!', 'success')
  } catch (e: any) {
    errorMessage.value = e.message || 'Erro ao fazer upload'
  }
}
</script>
