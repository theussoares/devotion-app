<template>
  <div class="flex flex-col h-full relative">
    <!-- List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain touch-pan-y min-h-0">
        <!-- Loading -->
        <div v-if="loading && comments.length === 0" class="space-y-4 py-2">
            <div v-for="i in 3" :key="i" class="flex gap-3">
                <div class="skeleton w-8 h-8 rounded-full"></div>
                <div class="flex-1 space-y-2">
                    <div class="skeleton h-3 w-24"></div>
                    <div class="skeleton h-3 w-full"></div>
                </div>
            </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!loading && comments.length === 0" class="flex flex-col items-center justify-center h-40 opacity-50 text-center">
            <Icon name="lucide:message-square" class="w-10 h-10 mb-2" />
            <p class="text-sm">Seja o primeiro a comentar!</p>
        </div>

        <!-- Items -->
        <CommentItem 
            v-else 
            v-for="comment in comments" 
            :key="comment.id" 
            :comment="comment" 
            :current-user-id="currentUserId"
            :post-owner-id="postOwnerId"
            @delete="$emit('delete', $event)"
        />
    </div>

    <!-- Input -->
    <CommentInput 
        class="absolute bottom-0 left-0 right-0 z-[6000]"
        :submitting="submitting"
        @submit="$emit('add', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import CommentItem from './CommentItem.vue'
import CommentInput from './CommentInput.vue'

defineProps<{
  comments: any[]
  loading: boolean
  submitting: boolean
  currentUserId: string | null
  postOwnerId: string
}>()

defineEmits(['add', 'delete'])
</script>
