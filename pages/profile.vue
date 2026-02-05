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

    <!-- User Lists Components -->
    <UserListModal 
        v-if="showFollowers"
        :is-open="showFollowers"
        title="Seguidores"
        :fetch-function="fetchFollowers"
        @close="showFollowers = false"
    />

    <UserListModal 
        v-if="showFollowing"
        :is-open="showFollowing"
        title="Seguindo"
        :fetch-function="fetchFollowing"
        @close="showFollowing = false"
    />

    <div class="flex flex-col items-center mb-4">
        <!-- Social Stats -->
        <div class="flex items-center gap-8 mt-5 pb-2">
            <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="showFollowers = true">
                <span class="font-bold text-lg text-white">{{ followersCount }}</span>
                <span class="text-xs text-gray-500">seguidores</span>
            </div>
            <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="showFollowing = true">
                <span class="font-bold text-lg text-white">{{ followingCount }}</span>
                <span class="text-xs text-gray-500">seguindo</span>
            </div>
             <div class="flex flex-col items-center">
                <div class="flex items-center gap-1 font-bold text-lg text-amber-500">
                    {{ profile.current_streak }} 
                    <span class="text-xl animate-pulse">🔥</span>
                </div>
                <span class="text-xs text-gray-500">dias seguidos</span>
            </div>
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
             <PostCard 
                 v-for="post in posts" 
                 :key="post.id" 
                 :post="post" 
                 @refresh="removePostLocally(post.id)"
             />
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

// Social Logic
const { getFollowers, getFollowing } = useFollow()
const showFollowers = ref(false)
const showFollowing = ref(false)
// These should ideally come from profile counts, for now let's mock or fetch count if needed.
// IMPORTANT: Profile table doesn't have followers_count/following_count columns in schema provided!
// We'll trust supabase to return counts or we might need to fetch length.
// Given strict instructions "not break anything", I will fetch lengths on mount.
const followersCount = ref(0)
const followingCount = ref(0)
const followersList = ref<any[]>([]) // Cache
const followingList = ref<any[]>([]) // Cache

async function fetchFollowers(search: string) {
    if (!profile.value?.id) return []
    return await getFollowers(profile.value.id, search)
}

async function fetchFollowing(search: string) {
    if (!profile.value?.id) return []
    return await getFollowing(profile.value.id, search)
}

async function loadSocialCounts() {
    if (!profile.value?.id) return
    const { count: fCount } = await client.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.value.id)
    const { count: fingCount } = await client.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.value.id)
    followersCount.value = fCount || 0
    followingCount.value = fingCount || 0
}


// 1. Fetch Profile
const { myProfile: profile } = useProfile()

watch(profile, (newP) => {
    if(newP) loadSocialCounts()
}, { immediate: true })

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

function removePostLocally(id: string) {
    if (posts.value) {
        posts.value = posts.value.filter(p => p.id !== id)
    }
}
</script>
