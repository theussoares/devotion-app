<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/50 z-[5000] transition-opacity"
        @click="$emit('close')"
    ></div>

    <!-- Sheet/Drawer -->
    <div 
        class="fixed bottom-0 left-0 right-0 bg-base-100 z-[5001] rounded-t-2xl flex flex-col h-[85vh] transition-transform duration-300 transform"
        :class="isOpen ? 'translate-y-0' : 'translate-y-full'"
        style="box-shadow: 0 -4px 20px rgba(0,0,0,0.3);"
    >
        <!-- Handle for dragging (visual cue) -->
        <div class="w-full flex justify-center pt-3 pb-1" @click="$emit('close')">
            <div class="w-12 h-1.5 bg-gray-700 rounded-full opacity-50"></div>
        </div>

        <!-- Header -->
        <div class="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-center flex-1 ml-8">Comentários</h3>
            <button class="btn btn-sm btn-circle btn-ghost" @click="$emit('close')">✕</button>
        </div>

        <!-- Content -->
        <div class="flex-1 relative overflow-hidden min-h-0 w-full">
            <CommentList 
                class="w-full h-full"
                :comments="comments"
                :loading="loading"
                :submitting="submitting"
                :current-user-id="currentUserId"
                :post-owner-id="postOwnerId"
                @add="addComment"
                @delete="deleteComment"
            />
        </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import CommentList from './comments/CommentList.vue'

const props = defineProps<{
  isOpen: boolean
  postId: string
  postOwnerId: string
}>()

const emit = defineEmits(['close'])

const userId = useState<string | null>('userId')
const currentUserId = computed(() => userId.value)

const { 
    comments, 
    loading, 
    submitting, 
    fetchComments, 
    addComment: _add, 
    deleteComment: _del 
} = useComments(props.postId)

// Fetch on open
watch(() => props.isOpen, (val) => {
    if (val) {
        console.log('PostCommentsModal open watched', props.postId)
        fetchComments()
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
}, { immediate: true })

// Clean up
import { onUnmounted } from 'vue'
onUnmounted(() => {
    document.body.style.overflow = ''
})

async function addComment(content: string) {
    await _add(content)
}

async function deleteComment(id: string) {
    await _del(id)
}
</script>
