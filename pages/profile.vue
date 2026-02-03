<template>
  <div v-if="profile" class="px-4 py-6">
    <!-- Header: Threads Style -->
     <!-- Settings Button -->
        <button @click="isMenuOpen = true" class="absolute top-2 right-4 btn btn-circle btn-ghost btn-sm text-gray-400 hover:text-white">
            <Icon name="lucide:settings" class="w-5 h-5" />
        </button>
        <div class="w-full h-10"></div>
    <div class="flex justify-between items-start mb-6 relative">
       <div class="flex-1">
           <h1 class="text-2xl font-bold tracking-tight text-white">{{ profile.full_name }}</h1>
           <div class="text-sm text-gray-500 mb-2">@{{ profile.username }} <span class="mx-1">•</span> {{ profile.city }}</div>
           <p v-if="profile.bio" class="text-sm text-gray-300 whitespace-pre-wrap">{{ profile.bio }}</p>
       </div>
       <ProfilePhotoUpload 
           :current-avatar="profile.avatar_url"
           :username="profile.username"
           @uploaded="handleAvatarUploaded"
       />
    </div>

    <!-- Settings Modal -->
    <dialog :open="isMenuOpen" class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isMenuOpen }">
      <div class="modal-box bg-gray-900 border border-gray-800 w-full">
        <h3 class="font-bold text-lg mb-4 text-white">Opções</h3>
        <ul class="menu bg-base-200 rounded-box p-2 w-full">
          <li>
              <a @click="openEditProfile" class="py-3 hover:bg-gray-800"><Icon name="lucide:edit-2" class="w-4 h-4 mr-2" /> Editar Perfil</a>
          </li>
          <li>
              <router-link to="/terms" class="py-3 hover:bg-gray-800"><Icon name="lucide:file-text" class="w-4 h-4 mr-2" /> Termos de Uso</router-link>
          </li>
          <li>
              <router-link to="/privacy" class="py-3 hover:bg-gray-800"><Icon name="lucide:shield" class="w-4 h-4 mr-2" /> Privacidade</router-link>
          </li>
          <div class="divider my-1 border-gray-800"></div>
          <li>
              <a @click="handleLogout" class="py-3 hover:bg-gray-800 text-gray-400"><Icon name="lucide:log-out" class="w-4 h-4 mr-2" /> Sair</a>
          </li>
          <li>
              <a @click="handleDeleteAccount" :class="{'opacity-50 pointer-events-none': isDeleting}" class="py-3 hover:bg-red-900/20 text-red-500 font-bold"><Icon name="lucide:trash-2" class="w-4 h-4 mr-2" /> {{ isDeleting ? 'Excluindo...' : 'Excluir Conta' }}</a>
          </li>
        </ul>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost w-full" @click="isMenuOpen = false">Cancelar</button>
          </form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="isMenuOpen = false">close</button>
      </form>
    </dialog>

    <!-- Edit Profile Modal -->
    <EditProfileModal 
        :is-open="isEditProfileOpen"
        :current-bio="profile.bio"
        @close="isEditProfileOpen = false"
        @saved="handleBioSaved"
    />

    <!-- Stats Pill (Streak) -->
    <div class="flex gap-4 mb-8">
        <div class="bg-gray-900 rounded-2xl p-4 flex-1 flex flex-col items-start border border-gray-800">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Sequência de devocionais</span>
            <div class="text-3xl font-black text-white mt-1 flex items-center gap-2">
                {{ profile.current_streak }} 
                <span class="text-2xl animate-pulse">🔥</span>
            </div>
            <span class="text-xs text-gray-500">dias seguidos</span>
        </div>
    </div>

    <!-- Tabs (Visual) -->
    <div class="flex border-b border-gray-800 mb-6">
        <button 
          class="flex-1 pb-3 text-sm font-bold transition-colors"
          :class="activeTab === 'timeline' ? 'border-b-2 border-white text-white' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
          @click="activeTab = 'timeline'"
        >
          Timeline
        </button>
        <button 
          class="flex-1 pb-3 text-sm font-medium transition-colors"
          :class="activeTab === 'devotional' ? 'border-b-2 border-white text-white' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
          @click="activeTab = 'devotional'"
        >
          Devocional
        </button>
        <button 
          class="flex-1 pb-3 text-sm font-medium text-gray-700 cursor-not-allowed"
          title="Em breve"
        >
          Curtidos 🔒
        </button>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'devotional'">
        <MonthCalendar :posts="devotionalPosts" @select="viewDay"/>
    </div>

    <div v-if="activeTab === 'timeline'" class="flex flex-col gap-0 border-t border-gray-800">
         <div v-if="posts && posts.length > 0">
             <PostCard v-for="post in posts" :key="post.id" :post="post" />
         </div>
         <div v-else class="text-center py-10 opacity-50 text-sm">
             Nenhuma publicação ainda.
         </div>
    </div>

    <!-- Modal for Multiple Posts (Calendar) -->
    <DayPostsModal
      :isOpen="showDayModal"
      :posts="selectedDayPosts"
      @close="showDayModal = false"
    />
  </div>
  
  <div v-else class="flex justify-center py-20">
    <span class="loading loading-dots loading-lg text-gray-700"></span>
  </div>
</template>

<script setup lang="ts">
// Redirect handled by global middleware

import type { Post } from '@/types/post.types'
import type { Database } from '@/types/database.types'

const router = useRouter()

const userId = useState<string | null>('userId')
const client = useSupabaseClient<Database>()
const { logout } = useAuthService()

// UI State
const isMenuOpen = ref(false)
const isEditProfileOpen = ref(false)
const activeTab = ref<'timeline' | 'devotional'>('timeline')

function openEditProfile() {
    isMenuOpen.value = false
    isEditProfileOpen.value = true
}

async function handleLogout() {
    isMenuOpen.value = false
    await logout()
}

// Danger Zone: Delete Account
const isDeleting = ref(false)
async function handleDeleteAccount() {
    if (!confirm('ATENÇÃO: Você tem certeza que deseja excluir sua conta? Esta ação é irreversível e apagará todos os seus dados.')) {
        return
    }

    // Double confirmation
    const username = profile.value?.username
    const confirmation = prompt(`Para confirmar, digite seu nome de usuário: ${username}`)
    if (confirmation !== username) {
        alert('Nome de usuário incorreto. Ação cancelada.')
        return
    }

    try {
        isDeleting.value = true
        await $fetch('/api/auth/delete', { method: 'DELETE' })
        
        await logout() // Ensure client session is cleared
        alert('Conta excluída com sucesso.')
        router.push('/login')
    } catch (e: any) {
        console.error('Delete account error:', e)
        alert('Erro ao excluir conta: ' + (e.message || 'Tente novamente.'))
    } finally {
        isDeleting.value = false
    }
}

function handleBioSaved(bio: string) {
    // Update profile locally
    if (profile.value) {
        profile.value.bio = bio
    }
}

// Modal state for multiple posts
const showDayModal = ref(false)
const selectedDayPosts = ref<Post[]>([])

// 1. Fetch Profile
const { myProfile: profile } = useProfile()

// 2. Fetch ALL Posts (for Timeline & Calendar)
const { data: posts, error: postsError } = await useAsyncData('my_posts', async () => {
    if (!userId.value) return []
    const { data, error } = await client
        .from('posts')
        .select(`
            *,
            profiles (username, full_name, avatar_url),
            likes (user_id)
        `)
        .eq('user_id', userId.value)
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Posts Fetch Error:', error)
        return []
    }

    // Transform logic same as feed to ensure PostCard compatibility
    return data.map(p => ({
        ...p,
        likes_count: p.likes?.length || 0,
        liked_by_me: userId.value ? p.likes?.some((l: any) => l.user_id === userId.value) : false
    })) as Post[]
}, { watch: [userId] })

// Filter for Calendar
const devotionalPosts = computed(() => {
    if (!posts.value) return []
    return posts.value.filter(p => p.type === 'devotional')
})

function viewDay(dateStr: string) {
    if (!posts.value) return
    
    // Find all posts for this day
    const dayPosts = posts.value.filter(p => 
        p.created_at?.startsWith(dateStr) && p.type === 'devotional'
    )
    
    if (dayPosts.length === 0) return
    
    // Always open modal (even for single post)
    selectedDayPosts.value = dayPosts
    showDayModal.value = true
}

async function handleAvatarUploaded(url: string) {
    // Refresh profile to show new avatar
    if (profile.value) {
        profile.value.avatar_url = url
    }
}
</script>
