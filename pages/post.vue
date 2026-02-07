<template>
  <div class="min-h-screen bg-black text-white pb-24">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-gray-800 px-4 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button @click="router.back()" class="btn btn-ghost btn-sm btn-circle">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-bold">Nova Publicação</h1>
        <div class="w-10"></div> <!-- Spacer for centering -->
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Type Selector Pills -->
      <div class="flex gap-3 mb-4">
        <button
          @click="type = 'devotional'"
          class="flex-1 py-4 px-6 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
          :class="type === 'devotional' 
            ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'"
        >
          <Icon name="lucide:flame" class="w-5 h-5" />
          Devocional
        </button>
        <button
          @click="type = 'text'"
          class="flex-1 py-4 px-6 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
          :class="type === 'text' 
            ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'"
        >
          <Icon name="lucide:message-circle" class="w-5 h-5" />
          Post Livre
        </button>
      </div>

      <!-- Context Message -->
      <div class="mb-6 px-4 py-3 rounded-xl text-sm" :class="type === 'devotional' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-900 text-gray-400 border border-gray-800'">
        <div v-if="type === 'devotional'" class="flex items-center gap-2">
          <Icon name="lucide:flame" class="w-4 h-4" />
          <span>Conta para o Ranking de Constância • Foto obrigatória</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <Icon name="lucide:message-circle" class="w-4 h-4" />
          <span>Não conta para ranking • Foto opcional</span>
        </div>
      </div>

      <!-- Photo Upload Block -->
      <div class="mb-6">
        <div 
          v-if="!previewUrl"
          @click="triggerFileInput"
          class="relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-gray-900/50 flex flex-col items-center justify-center gap-3"
          :class="type === 'devotional' ? 'border-primary/30 bg-primary/5' : 'border-gray-800 bg-gray-900/30'"
        >
          <Icon name="lucide:camera" class="w-12 h-12 text-gray-500" />
          <div class="text-center">
            <p class="font-semibold text-gray-300">Toque para adicionar foto</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ type === 'devotional' ? 'Obrigatório' : 'Opcional' }}
            </p>
          </div>
        </div>

        <!-- Photo Preview -->
        <div v-else class="relative aspect-square rounded-2xl overflow-hidden bg-black border border-gray-800">
          <img :src="previewUrl" class="w-full h-full object-cover" alt="Preview" />
          <button 
            @click="clearFile" 
            class="absolute top-3 right-3 btn btn-circle btn-sm bg-black/80 hover:bg-black border-gray-700 text-white"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Hidden File Input -->
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*" 
          class="hidden" 
          @change="handleFileChange" 
        />
      </div>

      <!-- Caption Field -->
      <div class="mb-6">
        <textarea
          v-model="caption"
          placeholder="Escreva sua reflexão..."
          class="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none transition-all duration-200"
          :class="{ 'border-red-500/50': caption.length > 1000 }"
          rows="6"
          maxlength="1000"
        ></textarea>
        <div class="flex justify-between items-center mt-2 px-2">
          <span class="text-xs text-gray-500">
            {{ caption.length }}/1000 caracteres
          </span>
          <span v-if="caption.length > 950" class="text-xs" :class="caption.length >= 1000 ? 'text-red-500' : 'text-yellow-500'">
            {{ caption.length >= 1000 ? 'Limite atingido' : 'Quase no limite' }}
          </span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="w-4 h-4" />
        {{ errorMsg }}
      </div>
    </div>

    <!-- Fixed Publish Button -->
    <div class="fixed bottom-[60px] left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 px-4 py-4 z-20">
      <div class="max-w-2xl mx-auto">
        <button
          @click="submitPost"
          :disabled="!canPublish || uploading"
          class="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2"
          :class="canPublish && !uploading
            ? 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'"
        >
          <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
          <Icon v-else name="lucide:send" class="w-5 h-5" />
          {{ uploading ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { createPost, uploadImage } = usePosts()

const type = ref<'devotional' | 'text'>('devotional')
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const caption = ref('')
const uploading = ref(false)
const errorMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Computed: Can publish?
const canPublish = computed(() => {
  // Caption must not be empty
  if (!caption.value.trim()) return false
  
  // Caption must be <= 1000 chars
  if (caption.value.length > 1000) return false
  
  // Devotional requires photo
  if (type.value === 'devotional' && !file.value) return false
  
  return true
})

function triggerFileInput() {
  fileInput.value?.click()
}

const moderating = ref(false)

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    let selectedFile: File | undefined = target.files[0]
    
    if (!selectedFile) return

    // Handle HEIC conversion
    if (selectedFile.name.toLowerCase().endsWith('.heic') || selectedFile.type === 'image/heic') {
      try {
        moderating.value = true // Reuse moderating state to show activity
        const heic2any = (await import('heic2any')).default
        const result = await heic2any({
          blob: selectedFile,
          toType: 'image/jpeg',
          quality: 0.8
        })
        
        const blob = Array.isArray(result) ? result[0] : result
        if (!blob) throw new Error('Erro na conversão da imagem')
        
        selectedFile = new File([blob], selectedFile.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        })
      } catch (e) {
        console.error('HEIC conversion failed:', e)
        errorMsg.value = 'Erro ao processar imagem HEIC. Tente outro formato.'
        moderating.value = false
        return
      }
    }

    file.value = selectedFile
    if (file.value) {
      previewUrl.value = URL.createObjectURL(file.value)
      // Optional: Moderate on selection (better UX) or Submit
      // Let's validate on selection to fail fast
      validateImage(file.value)
    }
  }
}

async function validateImage(imageFile: File) {
  moderating.value = true
  errorMsg.value = ''
  
  try {
    const { moderateImage } = usePosts()
    const result = await moderateImage(imageFile)
    
    if (!result.approved) {
      errorMsg.value = `Imagem bloqueada: ${result.reason}`
      // Clear file
      file.value = null
      previewUrl.value = null
      if (fileInput.value) fileInput.value.value = ''
    }
  } catch (e: any) {
    console.error(e)
    errorMsg.value = 'Erro ao validar imagem: ' + e.message
    // Optional: Allow user to retry or block
  } finally {
    moderating.value = false
  }
}

function clearFile() {
  file.value = null
  previewUrl.value = null
  errorMsg.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function submitPost() {
  if (!canPublish.value) return
  
  // Double check moderation if needed, but since we moderating on selection
  // we can rely on file being present (cleared if failed)
  
  uploading.value = true
  errorMsg.value = ''

  try {
    let imageUrl = null

    // Upload image if exists
    if (file.value) {
      imageUrl = await uploadImage(file.value)
    }

    await createPost({
      caption: caption.value.trim(),
      type: type.value,
      image_url: imageUrl
    })

    // Show success toast (you can add a toast library)
    clearNuxtData('feed') // Invalidate feed cache
    await navigateTo('/')
  } catch (e: any) {
    console.error(e)
    errorMsg.value = e.message || 'Erro ao publicar. Tente novamente.'
  } finally {
    uploading.value = false
  }
}

// Clear error when user changes type
watch(type, () => {
  errorMsg.value = ''
})
</script>
