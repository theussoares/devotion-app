<template>
  <div class="card bg-base-100 shadow-xl max-w-lg mx-auto">
    <div class="card-body">
      <h2 class="card-title justify-center mb-6">Nova Publicação</h2>

      <!-- Type Toggle -->
      <div role="tablist" class="tabs tabs-boxed mb-6">
        <a role="tab" class="tab" :class="{ 'tab-active': type === 'devotional' }" @click="type = 'devotional'">Devocional</a>
        <a role="tab" class="tab" :class="{ 'tab-active': type === 'text' }" @click="type = 'text'">Post Livre</a>
      </div>

      <!-- Devotional Context -->
      <div v-if="type === 'devotional'" class="alert alert-info text-xs py-2 mb-4">
        <span>🔥 Conta para o Ranking de Constância. Foto obrigatória.</span>
      </div>
      <div v-else class="alert text-xs py-2 mb-4">
        <span>💬 Postagem livre para comunidade. Não afeta seu streak.</span>
      </div>

      <!-- Image Upload (Required for Devotional, Optional for Text) -->
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Foto {{ type === 'devotional' ? '(Obrigatório)' : '(Opcional)' }}</span>
        </label>
        <input type="file" accept="image/*" class="file-input file-input-bordered w-full" @change="handleFileChange" />
      </div>

      <div v-if="previewUrl" class="mt-4 relative rounded-xl overflow-hidden aspect-video bg-black/10">
        <img :src="previewUrl" class="w-full h-full object-contain" />
        <button class="btn btn-circle btn-xs absolute top-2 right-2 btn-error" @click="clearFile">✕</button>
      </div>

      <!-- Caption -->
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Legenda</span>
        </label>
        <textarea v-model="caption" class="textarea textarea-bordered h-24" placeholder="Escreva algo..."></textarea>
      </div>

      <!-- Feedback -->
      <div v-if="errorMsg" class="alert alert-error mt-4 text-sm">
        {{ errorMsg }}
      </div>

      <!-- Actions -->
      <div class="card-actions justify-end mt-6">
        <button class="btn btn-primary w-full" :disabled="uploading || (type === 'devotional' && !file)" @click="submitPost">
          <span v-if="uploading" class="loading loading-spinner"></span>
          {{ uploading ? 'Enviando...' : 'Publicar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Global middleware handles auth protection
const router = useRouter()
const { createPost, uploadImage } = usePosts()

const type = ref<'devotional' | 'text'>('devotional')
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const caption = ref('')
const uploading = ref(false)
const errorMsg = ref('')

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0] || null
    if (file.value) {
      previewUrl.value = URL.createObjectURL(file.value)
    }
  }
}

function clearFile() {
  file.value = null
  previewUrl.value = null
}

async function submitPost() {
  uploading.value = true
  errorMsg.value = ''

  try {
    let imageUrl = null

    // Upload image if exists
    if (file.value) {
      imageUrl = await uploadImage(file.value)
    }

    await createPost({
      caption: caption.value,
      type: type.value,
      image_url: imageUrl
    })

    clearNuxtData('feed') // Invalidate feed cache
    await navigateTo('/')
  } catch (e: any) {
    console.error(e)
    errorMsg.value = e.message || 'Erro ao publicar.'
  } finally {
    uploading.value = false
  }
}
</script>
