<template>
  <div class="flex gap-3 py-3 group">
    <div class="avatar">
      <div class="w-8 h-8 rounded-full">
        <img 
          :src="comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.profiles?.username}`" 
          :alt="comment.profiles?.username || 'User'" 
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-0.5">
        <span class="font-bold text-sm">{{ comment.profiles?.username }}</span>
        <span class="text-xs text-gray-500">{{ timeAgo(comment.created_at) }}</span>
      </div>
      <p class="text-sm text-gray-200 leading-snug break-words whitespace-pre-wrap">{{ comment.content }}</p>
    </div>
    
    <button 
      v-if="canDelete" 
      @click="$emit('delete', comment.id)"
      class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error"
      title="Excluir comentário"
    >
      <Icon name="lucide:trash-2" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  comment: any
  currentUserId: string | null
  postOwnerId: string
}>()

const emit = defineEmits(['delete'])

const canDelete = computed(() => {
  return props.currentUserId && (
    props.currentUserId === props.comment.user_id || 
    props.currentUserId === props.postOwnerId
  )
})

function timeAgo(dateStr: string | null) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 604800)}sem`
}
</script>
