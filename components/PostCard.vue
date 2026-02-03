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
           <div class="dropdown dropdown-end">
               <button tabindex="0" class="btn btn-circle btn-sm btn-ghost text-gray-500 hover:text-white -mr-2">
                   <Icon name="lucide:more-horizontal" class="w-5 h-5" />
               </button>
               <ul tabindex="0" class="dropdown-content z-[2] menu p-2 shadow-lg bg-gray-900 border border-gray-800 rounded-box w-52 mt-1">
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
        <div v-if="post.image_url" class="rounded-xl overflow-hidden border border-gray-800/50 mb-3">
           <img :src="post.image_url" class="w-full object-cover max-h-[500px]" loading="lazy" />
        </div>

        <!-- Actions -->
        <div class="flex gap-5 items-center mt-1">
            <!-- Like Button -->
            <button class="flex items-center gap-2 group p-1 -ml-1 rounded-full hover:bg-white/5 transition-colors" @click.stop="toggleLike" aria-label="Curtir">
                <Icon name="lucide:heart" class="w-[22px] h-[22px] transition-transform group-active:scale-75" :class="isLiked ? 'text-red-500 fill-red-500' : 'text-white'" stroke-width="2" />
                <span v-if="likesCount > 0" class="text-xs font-medium" :class="isLiked ? 'text-red-500' : 'text-gray-500'">{{ likesCount }}</span>
            </button>
            
            <!-- Comment Button -->
            <button class="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-colors" aria-label="Comentar" @click.stop="showComments = true">
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

const isLiked = ref(props.post.liked_by_me)
const likesCount = ref(props.post.likes_count)
const isToggling = ref(false)

// Comment logic
const showComments = ref(false)
const commentsCount = computed(() => {
    // Ideally this comes from the DB view/aggregation, 
    // for MVP we rely on what's passed or a future update
    return props.post.comments ? props.post.comments.length : (props.post.comments_count || 0)
})

// Sync with props if they change (e.g. feed refresh)
watch(() => props.post, (newPost) => {
    if (!isToggling.value) {
        isLiked.value = newPost.liked_by_me
        likesCount.value = newPost.likes_count
    }
}, { deep: true })

async function handleDeletePost() {
    if (!confirm('Você tem certeza que deseja excluir esta publicação?')) return

    try {
        const { error } = await client.from('posts').delete().eq('id', props.post.id)
        if (error) throw error
        
        // Notify parent
        emit('refresh')
    } catch (e: any) {
        alert('Erro ao excluir: ' + e.message)
    }
}

function handleReport() {
    // MVP: Mock report
    const reason = prompt('Qual o motivo da denúncia? (Spam, Conteúdo Ofensivo, Nudez, etc)')
    if (reason) {
        alert('Obrigado. Sua denúncia foi recebida e será analisada pela nossa equipe de segurança.')
    }
}

function handleBlock() {
    // MVP: Mock block
    if (confirm(`Deseja bloquear @${props.post.profiles?.username}? O conteúdo deste usuário deixará de aparecer para você.`)) {
        alert(`Usuário @${props.post.profiles?.username} foi bloqueado.`)
        emit('refresh')
    }
}

async function toggleLike() {
  if (!userId.value) {
    return router.push('/login')
  }

  const activeUserId = userId.value

  // 2. Optimistic UI Update
  isToggling.value = true
  const previousState = { liked: isLiked.value, count: likesCount.value }

  if (isLiked.value) {
     isLiked.value = false
     likesCount.value--
  } else {
     isLiked.value = true
     likesCount.value++
  }

  // 3. API Request
  try {
      const post = props.post
      if (previousState.liked) {
          // Unlike
          const { error } = await client.from('likes').delete().match({ post_id: post.id, user_id: activeUserId })
          if (error) throw error
      } else {
          // Like
          const { error } = await client.from('likes').insert({ post_id: post.id as string, user_id: activeUserId as string })
          if (error) throw error
      }
  } catch (e: any) {
      console.error('Toggle like error:', e)
      
      // If error is Auth related (401), redirect to login
      if (e.message?.includes('JWT') || e.code === 'PGRST301' || e.status === 401) {
          return router.push('/login')
      }

      // Revert on error
      isLiked.value = previousState.liked
      likesCount.value = previousState.count
  } finally {
      isToggling.value = false
  }
}
</script>
