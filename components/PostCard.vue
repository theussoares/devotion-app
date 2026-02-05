<template>
  <div class="w-full border-b border-gray-800/40 px-4 py-3 hover:bg-gray-900/10 transition-colors">
    <div class="flex gap-3 h-full">
      <!-- Left Column: Avatar + Thread Line -->
      <div class="flex flex-col items-center gap-2 pt-1 shrink-0">
        <div class="avatar cursor-pointer" @click="goToProfile">
          <!-- Avatar size slightly bumped for better tap target, keeping ring subtle -->
          <div class="w-10 h-10 rounded-full ring-1 ring-base-content/10">
            <img :src="post.profiles?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + post.profiles?.username" class="bg-base-200" />
          </div>
        </div>
        <!-- Thread Line: Subtle continuous line -->
        <div class="w-[2px] grow bg-gray-800/30 rounded-full my-0 opacity-60"></div>
      </div>

      <!-- Right Column: Content -->
      <div class="flex-1 pb-4 min-w-0">
        <!-- Header -->
        <div class="flex justify-between items-start mb-1.5">
           <div class="flex items-center gap-2 py-0.5">
               <h3 class="font-bold text-[15px] cursor-pointer text-white flex items-center gap-1.5" @click="goToProfile">
                   {{ post.profiles?.username }}
                   <!-- Devotion Badge (Minimalist) -->
                   <span v-if="post.type === 'devotional'" title="Devocional">🔥</span>
               </h3>
               
               <span class="text-xs text-gray-500 font-medium">· {{ timeAgo(post.created_at) }}</span>
           </div>
           
           <!-- Actions Menu -->
           <!-- Actions Menu -->
           <div class="relative" ref="menuRef">
               <button @click="isMenuOpen = !isMenuOpen" class="btn btn-circle btn-sm btn-ghost text-gray-500 hover:text-white -mr-2" :class="{ 'text-white bg-white/10': isMenuOpen }">
                   <Icon name="lucide:more-horizontal" class="w-5 h-5" />
               </button>
               <ul v-if="isMenuOpen" class="absolute right-0 mt-1 z-[10] menu p-2 shadow-lg bg-gray-900 border border-gray-800 rounded-box w-52 origin-top-right">
                   <!-- Owner Options -->
                   <li v-if="post.user_id === userId">
                       <a @click="handleDeletePost" class="text-red-500 hover:bg-red-900/20 gap-2">
                           <Icon name="lucide:trash-2" class="w-4 h-4" /> Excluir
                       </a>
                   </li>
                   <!-- Public Options -->
                   <li v-if="post.user_id !== userId">
                       <a @click="handleReport" class="text-yellow-500 hover:bg-yellow-900/20 gap-2">
                           <Icon name="lucide:flag" class="w-4 h-4" /> Denunciar
                       </a>
                   </li>
                   <li v-if="post.user_id !== userId">
                       <a @click="handleBlock" class="text-gray-400 hover:bg-gray-800 gap-2">
                           <Icon name="lucide:ban" class="w-4 h-4" /> Bloquear
                       </a>
                   </li>
               </ul>
           </div>
        </div>

        <!-- Text Content -->
        <p v-if="post.caption" class="text-[15px] mb-3 whitespace-pre-wrap leading-normal text-gray-200 font-normal">
            {{ post.caption }}
        </p>

        <!-- Image Content -->
        <div v-if="post.image_url" class="rounded-xl overflow-hidden border border-gray-800/50 mb-3 bg-gray-900/50">
           <div style="aspect-ratio: 1/1;" class="w-full relative">
             <NuxtImg 
                v-if="!imageError && !post.image_url?.toLowerCase().includes('.heic')"
                :src="post.image_url" 
                format="webp"
                quality="80"
                loading="lazy"
                fit="cover"
                sizes="(max-width: 640px) 100vw, 640px"
                class="absolute inset-0 w-full h-full object-cover" 
                alt="Imagem do post"
                @error="handleImageError"
             />
             <!-- Fallback for failed loads (e.g. HEIC on Windows) or explicit HEIC -->
             <img 
                v-else
                :src="post.image_url"
                class="absolute inset-0 w-full h-full object-cover"
                alt="Imagem do post"
             />
             
           </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-5 items-center mt-1">
            <!-- Like Button -->
            <div class="flex items-center gap-1.5 group p-1 -ml-1 rounded-full transition-colors">
                <button @click.stop="toggleLike" class="hover:bg-white/10 p-1.5 rounded-full transition-colors" aria-label="Curtir">
                    <Icon 
                        :name="isLiked ? 'lucide:heart' : 'lucide:heart'" 
                        class="w-6 h-6 transition-all duration-300"
                        :class="isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-400 group-hover:text-red-400'" 
                        stroke-width="2"
                    />
                </button>
                <span 
                    v-if="likesCount > 0" 
                    @click.stop="showLikesModal = true"
                    class="text-sm font-medium cursor-pointer hover:underline"
                    :class="isLiked ? 'text-red-500' : 'text-gray-400'"
                >
                    {{ likesCount }}
                </span>
            </div>
            
            <!-- Comment Button -->
            <button class="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-colors" @click="showComments = true" aria-label="Comentar">
                <Icon name="lucide:message-circle" class="w-[22px] h-[22px] -scale-x-100" :class="commentsCount > 0 ? 'text-blue-400' : 'text-white'" stroke-width="2" />
                <span v-if="commentsCount > 0" class="text-xs font-medium" :class="commentsCount > 0 ? 'text-blue-400' : 'text-gray-500'">{{ commentsCount }}</span>
            </button>
            
            <!-- Share/Send Button (Optional placeholder for future) -->
            <!-- <button class="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-colors" aria-label="Compartilhar">
                <Icon name="lucide:send" class="w-[22px] h-[22px] text-white -rotate-45 translate-x-0.5 -translate-y-0.5" stroke-width="2" />
            </button> -->
        </div>
      </div>
    </div>
    
    <PostCommentsModal 
        v-if="showComments"
        :is-open="showComments"
        :post-id="post.id"
        :post-owner-id="post.user_id"
        @close="showComments = false"
    />

    <UserListModal
        v-if="showLikesModal"
        :is-open="showLikesModal"
        title="Curtidas"
        :fetch-function="fetchPostLikes"
        @close="showLikesModal = false"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: any
}>()

const emit = defineEmits(['refresh'])

const client = useSupabaseClient()
const userId = useState('userId')
const router = useRouter()

function goToProfile() {
    router.push(`/user/${props.post.profiles?.username}`)
}

function timeAgo(dateStr: string | null) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000 
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff/60)}m`
    if (diff < 86400) return `${Math.floor(diff/3600)}h`
    return `${Math.floor(diff/86400)}d`
}

const { fetchLikes } = useLikes()

const showLikesModal = ref(false)
const menuRef = ref(null)
const isMenuOpen = ref(false)

import { onClickOutside } from '@vueuse/core'
onClickOutside(menuRef, () => isMenuOpen.value = false)

async function fetchPostLikes(search: string) {
   return await fetchLikes(props.post.id, search)
}

const isLiked = ref(props.post.liked_by_me)
const likesCount = ref(props.post.likes_count)
const isToggling = ref(false)

const imageError = ref(false)

function handleImageError() {
    imageError.value = true
}

// Comment logic
const showComments = ref(false)
const commentsCount = computed(() => {
    // If we have access to real-time count or if we just increment local
    return props.post.comments_count
})

// Sync with props if they change (e.g. feed refresh)
watch(() => props.post, (newPost) => {
    if (!isToggling.value) {
        isLiked.value = newPost.liked_by_me
        likesCount.value = newPost.likes_count
    }
}, { deep: true })

async function handleDeletePost() {
    if(!confirm('Tem certeza que deseja excluir esta publicação?')) return
    
    try {
        const { error } = await client.from('posts').delete().eq('id', props.post.id)
        if(error) throw error
        emit('refresh')
    } catch (e) {
        alert('Erro ao excluir post')
    }
}

async function handleReport() {
   // Placeholder
   alert('Denúncia enviada. Iremos analisar.')
}

async function handleBlock() {
     // Placeholder
    if(confirm(`Bloquear ${props.post.profiles.username}?`)) {
        alert('Usuário bloqueado.')
    }
}

async function toggleLike() {
    if (!userId.value) return router.push('/login')
    if (isToggling.value) return

    isToggling.value = true
    
    // Optimistic UI
    const previousState = isLiked.value
    const previousCount = likesCount.value
    
    isLiked.value = !isLiked.value
    likesCount.value = isLiked.value ? likesCount.value + 1 : likesCount.value - 1
    
    try {
        if (previousState) {
            // Unlike
            const { error } = await client.from('likes')
                .delete()
                .eq('post_id', String(props.post.id))
                .eq('user_id', String(userId.value))
            if (error) throw error
        } else {
             // Like
            const { error } = await client.from('likes')
                .insert({ 
                    post_id: String(props.post.id), 
                    user_id: String(userId.value) 
                })
            if (error) throw error
        }
    } catch (e) {
        console.error('Like error', e)
        // Rollback
        isLiked.value = previousState
        likesCount.value = previousCount
    } finally {
        isToggling.value = false
    }
}

</script>
