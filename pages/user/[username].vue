<template>
  <div v-if="profile" class="pb-20">
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost" @click="router.back()">
          <arrow-left-icon class="w-6 h-6" />
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

      <div class="flex gap-4 items-center">
        <div class="stats shadow bg-base-200">
            <div class="stat place-items-center py-2 px-6">
            <div class="stat-value text-primary text-2xl">🔥 {{ profile.current_streak }}</div>
            <div class="stat-desc font-bold">dias</div>
            </div>
        </div>

        <button 
          v-if="!isOwnProfile" 
          class="btn" 
          :class="isFollowingState ? 'btn-outline' : 'btn-primary'"
          @click="handleFollow"
          :disabled="followLoading"
        >
          {{ isFollowingState ? 'Seguindo' : 'Seguir' }}
        </button>
        <NuxtLink v-else to="/params" class="btn btn-ghost btn-sm">Editar</NuxtLink>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="px-4">
        <h3 class="font-bold text-lg mb-2">Histórico de Devocional</h3>
        <MonthCalendar :posts="calendarPosts" @select="viewDay" />
    </div>

    <!-- Post Modal (Read Only) -->
    <div v-if="selectedDayPost" class="modal modal-open">
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

  </div>
  <div v-else-if="error" class="text-center py-20 opacity-50">
    Usuário não encontrado.
  </div>
  <div v-else class="flex justify-center py-20">
    <span class="loading loading-dots loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import type { Database, Tables } from '@/types/database.types'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<Database>()
const { userId } = useAuthUser()
const { isFollowing, toggleFollow } = useFollow()

const username = route.params.username as string

// Define a specific type for the partial post data we select
type PostData = Pick<Tables<'posts'>, 'created_at' | 'image_url' | 'caption' | 'type'>

const selectedDayPost = ref<PostData | null>(null)

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

// 3. Check Follow Status
onMounted(async () => {
  if (profile.value && !isOwnProfile.value) {
    isFollowingState.value = await isFollowing(profile.value.id)
  }
})

// 4. Fetch Posts for Calendar
const { data: posts } = await useAsyncData(`user-posts-${username}`, async () => {
  if (!profile.value) return []
  const { data } = await client
    .from('posts')
    .select('created_at, image_url, caption, type')
    .eq('user_id', profile.value.id)
    .eq('type', 'devotional')
  
  return data
}, { watch: [profile] })

// Filter posts to ensure they satisfy MonthCalendar props (string type for created_at and image_url)
const calendarPosts = computed(() => {
  if (!posts.value) return []
  return posts.value.filter((p): p is PostData & { created_at: string; image_url: string } => {
    return !!p.created_at && !!p.image_url
  })
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
  
  const post = posts.value.find(p => p.created_at?.startsWith(dateStr))
  
  if (post) selectedDayPost.value = post
}
</script>
