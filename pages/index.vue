<template>
  <div class="pb-20 max-w-[680px] mx-auto">
    <!-- Polling Banner (Floating Top) -->
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="-translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-full opacity-0">
      <div v-if="hasNewPosts" class="fixed top-20 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <button class="pointer-events-auto bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 hover:scale-105 transition-transform" @click="refreshFeed">
          <span>{{ newPostCount > 0 ? newPostCount : '' }} Novas publicações</span>
          <Icon name="lucide:arrow-up" class="w-3 h-3" />
        </button>
      </div>
    </transition>
    
    <!-- Top Header Mobile (Devotion Logo) -->
    <div class="flex justify-center py-4 md:hidden border-b border-gray-800/50 sticky top-0 bg-base-100/80 backdrop-blur z-20">
         <h1 class="font-bold text-xl tracking-tighter text-white">devotion</h1>
    </div>

    <!-- Feed Content -->
    <div v-if="pending" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-md text-gray-700"></span>
    </div>

    <div v-else class="flex flex-col">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const userId = useState<string | null>('userId')
const hasNewPosts = ref(false)
const newPostCount = ref(0)
let pollingInterval: any = null

async function fetchFeedData() {
    const { data, error } = await client
        .from('posts')
        .select(`
            *,
            profiles (username, full_name, avatar_url),
            likes (user_id),
            comments (count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
        return []
    }

    return data.map(p => ({
        ...p,
        likes_count: p.likes.length,
        liked_by_me: userId.value ? p.likes.some((l: any) => l.user_id === userId.value) : false,
        comments: null,
        comments_count: p.comments ? p.comments[0]?.count : 0
    }))
}

/* --- Data Fetching --- */
const { data: posts, pending, refresh } = await useAsyncData('feed', fetchFeedData, {
    watch: [userId]
})

/* --- Polling --- */
onMounted(() => {
  pollingInterval = setInterval(checkForUpdates, 120 * 1000) // 2 min
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})

async function checkForUpdates() {
     if (!posts.value || posts.value.length === 0) return

     try {
         const { count, error } = await client
            .from('posts')
            .select('created_at', { count: 'exact', head: true })
            .gt('created_at', posts.value[0]?.created_at)

         if (error) throw error
         
         if (count && count > 0) {
             hasNewPosts.value = true
             newPostCount.value = count
         }
     } catch (e) {
         console.error('Polling error:', e)
     }
}

async function refreshFeed() {
    // Explicitly re-fetch to ensure reactivity
    const newData = await fetchFeedData()
    if (newData) {
        posts.value = newData
    }
    
    hasNewPosts.value = false
    newPostCount.value = 0
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
