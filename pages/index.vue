<template>
  <div class="pb-20 max-w-[680px] mx-auto min-h-screen">
    <!-- Top Header Mobile (Devotion Logo) -->
    <div class="flex justify-center py-4 md:hidden border-b border-gray-800/50 sticky top-0 bg-base-100/80 backdrop-blur z-20">
         <h1 class="font-bold text-xl tracking-tighter text-white">devotion</h1>
    </div>

    <!-- Feed Content -->
    <div class="flex flex-col">
      <PostCard 
        v-for="post in feed.posts" 
        :key="post.id" 
        :post="post" 
        @refresh="feed.removePost(post.id)"
      />
    </div>

    <!-- Loading Sentinel / Infinite Scroll Trigger -->
    <div ref="loadMoreTrigger" class="h-10 mt-4 flex justify-center items-center">
        <span v-if="feed.loading" class="loading loading-spinner loading-md text-gray-700"></span>
        <span v-else-if="!feed.hasMore && feed.posts.length > 0" class="text-sm text-gray-500">Isso é tudo por enquanto!</span>
    </div>

    <!-- Empty State -->
    <div v-if="!feed.loading && feed.posts.length === 0" class="flex flex-col items-center justify-center p-10 opacity-50">
        <Icon name="lucide:coffee" class="w-10 h-10 mb-2" />
        <p>Nenhuma publicação ainda.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { useFeedStore } from '~/stores/feed'

const feed = useFeedStore()
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Initial Load & Scroll Retention
onMounted(async () => {
    if (feed.posts.length === 0) {
        await feed.loadMore()
    } else if (feed.scrollY > 0) {
        // Restore scroll position
        requestAnimationFrame(() => {
            window.scrollTo(0, feed.scrollY)
        })
    }
})

// Save Scroll Position on Leave
onBeforeRouteLeave((to, from, next) => {
    feed.setScroll(window.scrollY)
    next()
})

// Infinite Scroll
useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && feed.hasMore && !feed.loading) {
      feed.loadMore()
    }
  },
  { rootMargin: '200px' } // Load before reaching exact bottom
)
</script>
