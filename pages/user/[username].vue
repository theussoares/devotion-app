<template>
  <div v-if="profile" class="pb-20">
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost" @click="router.back()">
          <Icon name="lucide:arrow-left" class="w-6 h-6" />
        </button>
      </div>
      <div class="flex-1">
        <span class="font-bold text-lg">@{{ profile.username }}</span>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col items-center gap-4 py-8 bg-base-100 mb-2">
      <div class="avatar">
        <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img :src="profile.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.username" />
        </div>
      </div>
      
      <div class="text-center">
        <h1 class="text-2xl font-bold">{{ profile.full_name }}</h1>
        <p class="opacity-60">{{ profile.city }}</p>
      </div>

       <!-- Social Stats -->
       <div class="flex items-center gap-6 pb-2">
            <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="showFollowers = true">
                <span class="font-bold text-lg">{{ followersCount }}</span>
                <span class="text-xs text-gray-500">seguidores</span>
            </div>
            <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="showFollowing = true">
                <span class="font-bold text-lg">{{ followingCount }}</span>
                <span class="text-xs text-gray-500">seguindo</span>
            </div>
             <div class="flex flex-col items-center">
                <div class="flex items-center gap-1 font-bold text-lg text-primary">
                    {{ profile.current_streak }} 
                    <span class="text-base animate-pulse">🔥</span>
                </div>
                <span class="text-xs text-gray-500">dias seguidos</span>
            </div>
        </div>

      <div class="flex gap-4 items-center mt-2">
        <button 
          v-if="!isOwnProfile" 
          class="btn px-8" 
          :class="isFollowingState ? 'btn-outline' : 'btn-primary'"
          @click="handleFollow"
          :disabled="followLoading"
        >
          {{ isFollowingState ? 'Seguindo' : 'Seguir' }}
        </button>
        <NuxtLink v-else to="/params" class="btn btn-ghost btn-sm">Editar</NuxtLink>
      </div>
    </div>

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

    <!-- Tabs -->
    <div class="flex border-b border-gray-800 mb-6">
        <button 
          class="flex-1 pb-3 text-sm font-bold transition-colors"
          :class="activeTab === 'timeline' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
          @click="activeTab = 'timeline'"
        >
          Timeline
        </button>
        <button 
          class="flex-1 pb-3 text-sm font-medium transition-colors"
          :class="activeTab === 'devotional' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'"
          @click="activeTab = 'devotional'"
        >
          Devocional
        </button>
        <button 
          class="flex-1 pb-3 text-sm font-medium text-gray-400 cursor-not-allowed"
          title="Em breve"
        >
          Curtidos 🔒
        </button>
    </div>

    <!-- Timeline View -->
    <div v-if="activeTab === 'timeline'" class="flex flex-col gap-0 border-t border-gray-800">
         <div v-if="posts && posts.length > 0">
             <PostCard 
                 v-for="post in posts" 
                 :key="post.id" 
                 :post="post" 
                 @refresh="posts = posts?.filter(p => p.id !== post.id)"
             />
         </div>
         <div v-else class="text-center py-10 opacity-50 text-sm">
             Nenhuma publicação ainda.
         </div>
    </div>

    <!-- Calendar View -->
    <div v-else-if="activeTab === 'devotional'" class="px-4">
        <MonthCalendar :posts="calendarPosts" @select="viewDay" />
    </div>

    <!-- Post Modal (Read Only) -->
    <Teleport to="body">
      <div v-if="selectedDayPost" class="modal modal-open z-[5000]">
        <div class="modal-box p-0 overflow-hidden relative">
          <button class="btn btn-sm btn-circle absolute right-2 top-2 bg-black/50 border-none text-white z-10" @click="selectedDayPost = null">✕</button>
          <img v-if="selectedDayPost.image_url" :src="selectedDayPost.image_url" class="w-full object-cover" />
          <div class="p-4">
              <div v-if="selectedDayPost.created_at" class="font-bold text-sm opacity-50 mb-1">
                  {{ new Date(selectedDayPost.created_at).toLocaleDateString() }}
              </div>
              <p>{{ selectedDayPost.caption }}</p>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="selectedDayPost = null">close</button>
        </form>
      </div>
    </Teleport>

  </div>
  <div v-else-if="error" class="text-center py-20 opacity-50">
    Usuário não encontrado.
  </div>
  <div v-else class="flex justify-center py-20">
    <span class="loading loading-dots loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import type { Database, Tables } from '@/types/database.types'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<Database>()
const userId = useState<string | null>('userId')
const { isFollowing, toggleFollow } = useFollow()

const username = route.params.username as string
const activeTab = ref<'timeline' | 'devotional'>('timeline')

// Update PostData logic
// We need full post data for the Card, but partial for calendar is fine.
// Let's use 'any' for simplicity in transition or robust typing.
type Post = any 

const selectedDayPost = ref<Post | null>(null)

// 1. Fetch Profile by Username
const { data: profile, error } = await useAsyncData(`user-${username}`, async () => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) throw error
  return data
})

// 2. State Calculations
const isOwnProfile = computed(() => userId.value === profile.value?.id)
const isFollowingState = ref(false)
const followLoading = ref(false)

// 3. Check Follow Status & Load Stats
const { getFollowers, getFollowing } = useFollow()
const showFollowers = ref(false)
const showFollowing = ref(false)
const followersCount = ref(0)
const followingCount = ref(0)

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

onMounted(async () => {
  if (profile.value) {
      if (!isOwnProfile.value) {
        isFollowingState.value = await isFollowing(profile.value.id)
      }
      loadSocialCounts()
  }
})

// Watch profile change (if navigating between users)
watch(profile, (newP) => {
    if (newP) {
        loadSocialCounts()
        if (!isOwnProfile.value) {
             isFollowing(newP.id).then(res => isFollowingState.value = res)
        }
    }
})

// 4. Fetch All Posts (Timeline + Calendar)
const { data: posts } = await useAsyncData(`user-posts-${username}`, async () => {
  if (!profile.value) return []
  const { data } = await client
    .from('posts')
    .select(`
        *,
        profiles (username, full_name, avatar_url),
        likes (user_id),
        comments (count)
    `)
    .eq('user_id', profile.value.id)
    .order('created_at', { ascending: false })
  
  if (!data) return []

  return data.map(p => ({
        ...p,
        likes_count: p.likes?.length || 0,
        liked_by_me: userId.value ? p.likes?.some((l: any) => l.user_id === userId.value) : false,
        comments: null, // Remove raw count array
        comments_count: p.comments ? p.comments[0]?.count : 0
    }))
}, { watch: [profile] })

// Filter posts for Calendar
const calendarPosts = computed(() => {
  if (!posts.value) return []
  return posts.value
    .filter((p: any) => p.type === 'devotional' && p.created_at)
    .map((p: any) => ({
      ...p,
      created_at: p.created_at as string
    }))
})

async function handleFollow() {
  if (!profile.value) return
  followLoading.value = true
  try {
    isFollowingState.value = await toggleFollow(profile.value.id, isFollowingState.value)
  } catch (e) {
    console.error(e)
  } finally {
    followLoading.value = false
  }
}

function viewDay(dateStr: string) {
  if (!posts.value) return
  
  const post = posts.value.find((p: any) => p.created_at?.startsWith(dateStr) && p.type === 'devotional')
  
  if (post) selectedDayPost.value = post
}
</script>
