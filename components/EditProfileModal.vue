<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal modal-open z-[5000]">
      <div class="modal-box max-w-md bg-gray-900 border border-gray-800">
        <h3 class="font-bold text-lg mb-4 text-white">Editar Perfil</h3>

        <!-- Bio Input -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text text-gray-300">Bio</span>
            <span class="label-text-alt text-gray-500">{{ bioText.length }}/160</span>
          </label>
          <textarea
            v-model="bioText"
            class="textarea textarea-bordered h-24 bg-gray-800 text-white border-gray-700 focus:border-primary"
            placeholder="Escreva uma breve descrição sobre você..."
            maxlength="160"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <Icon name="lucide:alert-circle" class="w-5 h-5" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeModal" :disabled="saving">
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="saving"
          >
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">close</button>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Database } from '@/types/database.types'

const props = defineProps<{
  isOpen: boolean
  currentBio?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: [bio: string]
}>()

const client = useSupabaseClient<Database>()
const userId = useState<string | null>('userId')

const bioText = ref(props.currentBio || '')
const saving = ref(false)
const errorMessage = ref<string | null>(null)

// Sync with prop changes
watch(() => props.currentBio, (newBio) => {
  bioText.value = newBio || ''
})

function closeModal() {
  emit('close')
  errorMessage.value = null
}

async function handleSave() {
  if (!userId.value) return

  saving.value = true
  errorMessage.value = null

  try {
    const { error } = await client
      .from('profiles')
      .update({ bio: bioText.value.trim() || null })
      .eq('id', userId.value)

    if (error) {
      console.error('Update error:', error)
      throw new Error('Erro ao atualizar perfil')
    }

    emit('saved', bioText.value.trim())
    closeModal()
  } catch (e: any) {
    errorMessage.value = e.message || 'Erro ao salvar'
  } finally {
    saving.value = false
  }
}
</script>
