<template>
  <div class="pb-20">
    <div class="navbar bg-base-100 shadow mb-4 sticky top-0 z-40">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl text-primary">Feed Devocional</a>
      </div>
      <div class="flex-none">
        <NuxtLink to="/post" class="btn btn-primary btn-sm btn-circle">
          <plus-icon class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <div v-if="hasNewPosts" class="fixed top-24 left-1/2 -translate-x-1/2 z-50">
      <button class="btn btn-primary btn-sm rounded-full shadow-lg gap-2 animate-bounce" @click="refreshFeed">
        <arrow-up-icon class="w-4 h-4" />
        Novas publicações
      </button>
    </div>

    <div v-if="pending" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div v-for="post in posts" :key="post.id" class="card bg-base-100 shadow-xl mx-auto w-full max-w-md">
        <!-- Header -->
        <div class="flex items-center gap-3 p-4">
          <div class="avatar">
            <div class="w-10 rounded-full">
              <img :src="post.profiles?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + post.profiles?.username" />
            </div>
          </div>
          <div>
            <div class="font-bold cursor-pointer" @click="router.push(`/user/${post.profiles?.username}`)">
              {{ post.profiles?.full_name }}
            </div>
            <div class="text-xs opacity-50 flex items-center gap-1">
              {{ post.created_at ? new Date(post.created_at).toLocaleDateString() : '' }} 
              <span v-if="post.type === 'devotional'" class="badge badge-xs badge-secondary">Devocional</span>
            </div>
          </div>
        </div>

        <!-- Image -->
        <figure v-if="post.image_url" class="rounded-none">
          <img :src="post.image_url" class="w-full object-cover aspect-square" loading="lazy" />
        </figure>

        <!-- Content -->
        <div class="card-body p-4 pt-2">
          <div class="flex justify-between items-center mb-2">
            <div class="flex gap-4">
              <button class="btn btn-ghost btn-circle btn-sm" @click="toggleLike(post)">
                <heart-icon class="w-6 h-6" :class="{ 'fill-red-500 text-red-500': post.liked_by_me }" />
              </button>
              <button class="btn btn-ghost btn-circle btn-sm">
                <message-circle-icon class="w-6 h-6" />
              </button>
            </div>
            <div class="text-sm font-bold opacity-70">{{ post.likes_count || 0 }} curtidas</div>
          </div>

          <p v-if="post.caption">
            <span class="font-bold">{{ post.profiles?.username }}</span> {{ post.caption }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart, MessageCircle, Plus as PlusIcon, ArrowUp as ArrowUpIcon } from 'lucide-vue-next'
import type { Database } from '@/types/database.types'

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const hasNewPosts = ref(false)
let pollingInterval: any = null

// Fetch posts with related profile info and like count
// Note: Supabase JS select allows embedded resources
// Fetch posts with related profile info and like count
const { data: posts, pending, refresh } = await useAsyncData('feed', async () => {
    const { data, error } = await client
        .from('posts')
        .select(`
            *,
            profiles (username, full_name, avatar_url),
            likes (user_id)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
        return []
    }

    // Transform for UI
    return data.map(p => ({
        ...p,
        likes_count: p.likes.length,
        liked_by_me: user.value ? p.likes.some((l: any) => l.user_id === user.value?.id) : false
    }))
}, {
    getCachedData: (key) => {
        const nuxtApp = useNuxtApp()
        const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
        if (!cached) return

        // Check if cache is expired (5 minutes)
        const expirationDate = new Date()
        expirationDate.setMinutes(expirationDate.getMinutes() - 5)

        const cachedTimestamp = (nuxtApp.payload.data as any)[`${key}-timestamp`]
        if (cachedTimestamp && new Date(cachedTimestamp) > expirationDate) {
            return cached
        }
        // If no timestamp or expired, return undefined to re-fetch
        return
    }
})

// Set timestamp after successful fetch
// Watch posts to update cache timestamp
watch(posts, (newPosts) => {
  if (newPosts) {
     const nuxtApp = useNuxtApp()
    ;(nuxtApp.payload.data as any)['feed-timestamp'] = new Date().toISOString()
  }
}, { immediate: true })

onMounted(() => {
  pollingInterval = setInterval(checkForUpdates, 10 * 60 * 1000) // 10 min
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})

async function checkForUpdates() {
     // Check if there is a newer post than the one we are showing
     if (!posts.value || posts.value.length === 0) return

     const { data } = await client
        .from('posts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
     
     if (data && new Date(data.created_at) > new Date(posts.value[0].created_at)) {
         hasNewPosts.value = true
     }
}

async function refreshFeed() {
    await refresh()
    hasNewPosts.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function toggleLike(post: any) {
  if (!user.value?.id) return router.push('/login')

  if (post.liked_by_me) {
    // Unlike
    const { error } = await client.from('likes').delete().match({ post_id: post.id, user_id: user.value.id })
    if (!error) {
       post.liked_by_me = false
       post.likes_count--
    }
  } else {
    // Like
    const { error } = await client.from('likes').insert({ post_id: post.id, user_id: user.value.id })
    if (!error) {
       post.liked_by_me = true
       post.likes_count++
    }
  }
}
</script>
