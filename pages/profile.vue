<template>
  <div v-if="profile">
    <div class="flex flex-col items-center gap-4 py-8">
      <div class="avatar online">
        <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img :src="profile.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.username" />
        </div>
      </div>
      <div class="text-center">
        <h1 class="text-2xl font-bold">{{ profile.full_name }}</h1>
        <p class="opacity-60">@{{ profile.username }} • {{ profile.city }}</p>
      </div>
      
      <div class="stats shadow">
        <div class="stat place-items-center">
          <div class="stat-title">Sequência Atual</div>
          <div class="stat-value text-primary">🔥 {{ profile.current_streak }}</div>
          <div class="stat-desc">dias seguidos</div>
        </div>
      </div>
    </div>

    <div class="divider">Histórico</div>

    <MonthCalendar :posts="posts" @select="viewDay"/>

    <div v-if="selectedDayPost" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Devocional: {{ new Date(selectedDayPost.created_at).toLocaleDateString('pt-BR') }}</h3>
        <figure class="rounded-xl overflow-hidden mb-4">
           <img :src="selectedDayPost.image_url || undefined" class="w-full" />
        </figure>
        <p v-if="selectedDayPost.caption">{{ selectedDayPost.caption }}</p>
        <div class="modal-action">
          <button class="btn" @click="selectedDayPost = null">Fechar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center py-20">
    <span class="loading loading-dots loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/types/database.types'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

// Define the shape of the post object we are selecting
type Post = {
    created_at: string
    image_url: string | null
    caption: string | null
    type: string
}

const selectedDayPost = ref<Post | null>(null)

// 1. Fetch Profile
const { myProfile: profile } = useProfile()
const { userId } = useAuthUser()

// 2. Fetch Devotional Posts (for Calendar)
const { data: posts, error: postsError } = await useAsyncData('my_posts', async () => {
    if (!userId.value) return []
    const { data, error } = await client
        .from('posts')
        .select('created_at, image_url, caption, type')
        .eq('user_id', userId.value)
        .eq('type', 'devotional') // Filter by specific type
    
    if (error) {
        console.error('Posts Fetch Error:', error)
        return []
    }
    return data as Post[]
}, { watch: [userId] })

function viewDay(dateStr: string) {
    if (!posts.value) return
    const post = posts.value.find(p => p.created_at.startsWith(dateStr))
    if (post) {
        selectedDayPost.value = post
    }
}

// Redirect if not logged in
definePageMeta({
    middleware: 'auth'
})
</script>
