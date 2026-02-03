<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal modal-open z-[9999]">
      <div class="modal-box max-w-md bg-gray-900 border border-gray-800 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 class="font-bold text-lg text-white">
            {{ formatDate(posts[0]?.created_at || '') }}
          </h3>
          <div class="flex items-center gap-2">
            <span v-if="!selectedPost" class="badge badge-primary">{{ posts.length }} posts</span>
            <button @click="close" class="btn btn-ghost btn-sm btn-circle">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Posts List (when no post selected) -->
        <div v-if="!selectedPost" class="space-y-3 overflow-y-auto pr-2 flex-1">
          <div 
            v-for="post in posts" 
            :key="post.id"
            @click="selectPost(post)"
            class="card bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors border border-gray-700 hover:border-primary/50"
          >
            <div class="card-body p-4">
              <!-- Image -->
              <img 
                v-if="post.image_url" 
                :src="post.image_url" 
                class="w-full h-32 object-cover rounded-lg mb-2"
                alt="Post image"
              />
              
              <!-- Caption Preview -->
              <p class="text-sm text-gray-300 line-clamp-2">
                {{ post.caption }}
              </p>
              
              <!-- Meta -->
              <div class="flex items-center gap-3 text-xs text-gray-400 mt-2">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:clock" class="w-3 h-3" />
                  {{ formatTime(post.created_at || '') }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:heart" class="w-3 h-3" />
                  {{ post.likes_count || 0 }}
                </span>
                
                <!-- Streak Badge -->
                <span 
                  v-if="isStreakPost(post)" 
                  class="badge badge-primary badge-xs gap-1"
                >
                  <Icon name="lucide:flame" class="w-3 h-3" />
                  STREAK
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Post View -->
        <div v-else class="overflow-y-auto pr-2 flex-1">
          <!-- Back Button -->
          <button 
            @click="selectedPost = null" 
            class="btn btn-ghost btn-sm mb-4 gap-2"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            Voltar
          </button>

          <!-- Post Image -->
          <figure v-if="selectedPost.image_url" class="rounded-xl overflow-hidden mb-4 border border-gray-800 aspect-square bg-black">
            <img :src="selectedPost.image_url" class="w-full h-full object-cover" alt="Post image" />
          </figure>

          <!-- Post Caption -->
          <p v-if="selectedPost.caption" class="text-sm text-gray-300 mb-4 whitespace-pre-wrap">
            {{ selectedPost.caption }}
          </p>

          <!-- Post Meta -->
          <div class="flex items-center gap-4 text-sm text-gray-400 pb-4 border-b border-gray-800">
            <span class="flex items-center gap-1">
              <Icon name="lucide:clock" class="w-4 h-4" />
              {{ formatTime(selectedPost.created_at || '') }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:heart" class="w-4 h-4" />
              {{ selectedPost.likes_count || 0 }} curtidas
            </span>
            <span 
              v-if="isStreakPost(selectedPost)" 
              class="badge badge-primary badge-sm gap-1"
            >
              <Icon name="lucide:flame" class="w-4 h-4" />
              STREAK
            </span>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="close">close</button>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Post } from '@/types/post.types'

const props = defineProps<{
  isOpen: boolean
  posts: Post[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { formatDate, formatTime } = useCalendar()
const selectedPost = ref<Post | null>(null)

function close() {
  selectedPost.value = null
  emit('close')
}

function selectPost(post: Post) {
  selectedPost.value = post
}

// Streak post é o último da lista (mais antigo)
function isStreakPost(post: Post) {
  return props.posts[props.posts.length - 1]?.id === post.id
}

// Reset selected post when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    selectedPost.value = null
  }
})
</script>
