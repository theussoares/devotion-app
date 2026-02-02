<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 animate-pulse">
        <div class="w-12 h-12 rounded-full bg-gray-800"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-800 rounded w-1/3"></div>
          <div class="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
        <div class="w-20 h-8 bg-gray-800 rounded-full"></div>
      </div>
    </div>

    <!-- Empty State (no query) -->
    <div v-else-if="!query || query.length < 2" class="text-center py-20">
      <Icon name="lucide:search" class="w-16 h-16 mx-auto text-gray-700 mb-4" />
      <p class="text-gray-500 text-sm">Busque por usuários</p>
    </div>

    <!-- No Results -->
    <div v-else-if="results.length === 0" class="text-center py-20">
      <Icon name="lucide:user-x" class="w-16 h-16 mx-auto text-gray-700 mb-4" />
      <p class="text-gray-500 text-sm">Nenhum usuário encontrado</p>
      <p class="text-gray-600 text-xs mt-2">Tente buscar por outro nome ou @username</p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-2">
      <div
        v-for="user in results"
        :key="user.id"
        class="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
        @click="goToProfile(user.username)"
      >
        <!-- Avatar -->
        <div class="avatar">
          <div class="w-12 h-12 rounded-full ring-1 ring-gray-700">
            <img :src="user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-white truncate">{{ user.full_name }}</h3>
            <span v-if="user.current_streak && user.current_streak > 0" class="text-xs">🔥</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>@{{ user.username }}</span>
            <span v-if="user.city" class="flex items-center gap-1">
              <span>•</span>
              <span class="truncate">{{ user.city }}</span>
            </span>
          </div>
        </div>

        <!-- Follow Button (placeholder) -->
        <button
          v-if="user.id !== currentUserId"
          class="btn btn-sm btn-primary rounded-full px-4"
          @click.stop="handleFollow(user.id)"
        >
          Seguir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

defineProps<{
  results: Profile[]
  loading: boolean
  query: string
}>()

const router = useRouter()
const userId = useState<string | null>('userId')
const currentUserId = computed(() => userId.value)

function goToProfile(username: string | null) {
  if (username) {
    router.push(`/user/${username}`)
  }
}

function handleFollow(targetUserId: string) {
  // TODO: Implement follow logic
  console.log('Follow user:', targetUserId)
}
</script>
