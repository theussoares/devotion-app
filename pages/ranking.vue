<template>
  <div class="min-h-screen bg-black text-white pb-24">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-gray-800 px-4 py-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-center mb-6">Ranking de Constância</h1>
        
        <!-- Toggle Pills -->
        <div class="flex gap-3 mb-4">
          <button
            @click="filter = 'global'"
            class="flex-1 py-3 px-6 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
            :class="filter === 'global' 
              ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'"
          >
            <Icon name="lucide:globe" class="w-5 h-5" />
            Global
          </button>
          <button
            @click="filter = 'city'"
            :disabled="!currentUserCity"
            class="flex-1 py-3 px-6 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
            :class="filter === 'city' 
              ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800 disabled:opacity-30 disabled:cursor-not-allowed'"
          >
            <Icon name="lucide:map-pin" class="w-5 h-5" />
            Minha Cidade
          </button>
        </div>

        <!-- City Indicator -->
        <div v-if="filter === 'city' && currentUserCity" class="text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          Ranking de {{ currentUserCity }}
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="!filteredProfiles.length && !loaded" class="space-y-4">
        <div v-for="i in 5" :key="i" class="skeleton h-20 bg-gray-900"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProfiles.length === 0" class="text-center py-20">
        <Icon name="lucide:trophy" class="w-16 h-16 mx-auto mb-4 text-gray-700" />
        <p class="text-gray-500 mb-2">
          {{ filter === 'city' ? 'Ainda não há devocionais na sua cidade.' : 'Ninguém pontuou ainda.' }}
        </p>
        <p class="text-primary font-bold">Seja o primeiro! 🔥</p>
      </div>

      <!-- Ranking List -->
      <div v-else class="space-y-6">
        <!-- Top 1 Hero -->
        <div 
          v-if="filteredProfiles[0]"
          @click="goToProfile(filteredProfiles[0].username)"
          class="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-2 border-yellow-500/30 rounded-3xl p-8 text-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-xl shadow-yellow-500/10"
        >
          <!-- Medal -->
          <div class="text-6xl mb-4">🥇</div>
          
          <!-- Avatar -->
          <div class="avatar mb-4">
            <div class="w-24 h-24 rounded-full ring-4 ring-yellow-500 ring-offset-4 ring-offset-black mx-auto">
              <img :src="filteredProfiles[0].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${filteredProfiles[0].username}`" alt="Avatar" />
            </div>
          </div>
          
          <!-- Name -->
          <h3 class="text-xl font-bold mb-2">{{ filteredProfiles[0].full_name }}</h3>
          
          <!-- Streak -->
          <div class="flex items-center justify-center gap-2 text-primary text-lg font-bold">
            <Icon name="lucide:flame" class="w-5 h-5" />
            {{ formatStreak(filteredProfiles[0].current_streak) }}
          </div>
        </div>

        <!-- Top 2 and 3 Podium -->
        <div v-if="filteredProfiles.length >= 2" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- 2nd Place -->
          <div 
            v-if="filteredProfiles[1]"
            @click="goToProfile(filteredProfiles[1].username)"
            class="bg-gradient-to-br from-gray-400/10 to-gray-500/5 border border-gray-400/30 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">🥈</div>
              <div class="avatar">
                <div class="w-16 h-16 rounded-full ring-2 ring-gray-400 ring-offset-2 ring-offset-black">
                  <img :src="filteredProfiles[1].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${filteredProfiles[1].username}`" alt="Avatar" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold truncate">{{ filteredProfiles[1].full_name }}</h4>
                <div class="flex items-center gap-1 text-primary text-sm font-bold">
                  <Icon name="lucide:flame" class="w-4 h-4" />
                  {{ formatStreak(filteredProfiles[1].current_streak) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 3rd Place -->
          <div 
            v-if="filteredProfiles[2]"
            @click="goToProfile(filteredProfiles[2].username)"
            class="bg-gradient-to-br from-orange-700/10 to-orange-800/5 border border-orange-700/30 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">🥉</div>
              <div class="avatar">
                <div class="w-16 h-16 rounded-full ring-2 ring-orange-700 ring-offset-2 ring-offset-black">
                  <img :src="filteredProfiles[2].avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${filteredProfiles[2].username}`" alt="Avatar" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold truncate">{{ filteredProfiles[2].full_name }}</h4>
                <div class="flex items-center gap-1 text-primary text-sm font-bold">
                  <Icon name="lucide:flame" class="w-4 h-4" />
                  {{ formatStreak(filteredProfiles[2].current_streak) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rest of the List (#4+) -->
        <div v-if="filteredProfiles.length > 3" class="space-y-2 pt-4">
          <div 
            v-for="(profile, index) in filteredProfiles.slice(3)" 
            :key="profile.id"
            @click="goToProfile(profile.username)"
            class="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-900/50 cursor-pointer transition-colors border-b border-gray-800/50 last:border-0"
          >
            <!-- Rank Number -->
            <div class="text-gray-500 font-bold text-lg w-8 text-center">
              #{{ index + 4 }}
            </div>
            
            <!-- Avatar -->
            <div class="avatar">
              <div class="w-12 h-12 rounded-full ring-1 ring-gray-800">
                <img :src="profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`" alt="Avatar" />
              </div>
            </div>
            
            <!-- Name -->
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold truncate">{{ profile.full_name }}</h4>
              <p class="text-xs text-gray-500 truncate">{{ profile.city }}</p>
            </div>
            
            <!-- Streak -->
            <div class="flex items-center gap-1 text-primary font-bold">
              <Icon name="lucide:flame" class="w-4 h-4" />
              {{ profile.current_streak }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const userId = useState<string | null>('userId')
const router = useRouter()

const filter = ref<'global' | 'city'>('global')
const currentUserCity = ref('')
const profiles = ref<any[]>([])
const loaded = ref(false)

// Format streak with proper singular/plural
function formatStreak(days: number): string {
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}

// Navigate to user profile
function goToProfile(username: string | null) {
  if (username) {
    navigateTo(`/user/${username}`)
  }
}

// Get current user city for filtering
onMounted(async () => {
  if (userId.value) {
    const { data } = await client.from('profiles').select('city').eq('id', userId.value).single()
    if (data) currentUserCity.value = data.city || ''
  }
})

// Fetch all profiles (limit 50 for MVP)
const { data } = await useAsyncData('ranking', async () => {
  const { data } = await client
    .from('profiles')
    .select('*')
    .order('current_streak', { ascending: false })
    .limit(50)
  loaded.value = true
  return data || []
})

watchEffect(() => {
  if (data.value) {
    profiles.value = data.value
  }
})

const filteredProfiles = computed(() => {
  if (filter.value === 'city' && currentUserCity.value) {
    return profiles.value.filter(p => p.city === currentUserCity.value)
  }
  return profiles.value
})

// Animate toggle change
watch(filter, () => {
  // Could add animation here
})
</script>
