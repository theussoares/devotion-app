<template>
  <div class="min-h-screen bg-base-200 pb-20">
    <div class="navbar bg-primary text-primary-content shadow sticky top-0 z-40">
      <div class="flex-1">
        <h1 class="text-xl font-bold px-4">Ranking de Constância</h1>
      </div>
    </div>

    <!-- Filters -->
    <div class="p-4 flex gap-2 justify-center bg-base-100 shadow-sm">
      <button 
        class="btn btn-sm rounded-full" 
        :class="filter === 'global' ? 'btn-primary' : 'btn-ghost'"
        @click="filter = 'global'"
      >
        Global
      </button>
      <button 
        class="btn btn-sm rounded-full" 
        :class="filter === 'city' ? 'btn-primary' : 'btn-ghost'"
        @click="filter = 'city'"
        :disabled="!currentUserCity"
      >
        Minha Cidade ({{ currentUserCity || '...' }})
      </button>
    </div>

    <!-- Leaderboard -->
    <div class="p-4 flex flex-col gap-2">
      <div 
        v-for="(profile, index) in filteredProfiles" 
        :key="profile.id" 
        class="flex items-center gap-4 bg-base-100 p-4 rounded-xl shadow-sm border-l-4"
        :class="index < 3 ? 'border-primary' : 'border-transparent'"
      >
        <div class="font-bold text-xl opacity-50 w-6 text-center">#{{ index + 1 }}</div>
        
        <div class="avatar">
          <div class="w-12 rounded-full ring ring-offset-2" :class="index === 0 ? 'ring-yellow-400' : 'ring-base-300'">
            <img :src="profile.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.username" />
          </div>
        </div>

        <div class="flex-1">
          <div class="font-bold truncate">{{ profile.full_name }}</div>
          <div class="text-xs opacity-60 truncate">{{ profile.city }}</div>
        </div>

        <div class="flex flex-col items-end">
          <div class="font-black text-2xl text-primary">{{ profile.current_streak }}</div>
          <div class="text-xs uppercase font-bold opacity-50">Dias</div>
        </div>
      </div>

      <div v-if="filteredProfiles.length === 0" class="text-center opacity-50 py-10">
        Ninguém pontuou ainda. Seja o primeiro!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const userId = useState<string | null>('userId')

const filter = ref<'global' | 'city'>('global')
const currentUserCity = ref('')
const profiles = ref<any[]>([])

// Get current user city for filtering
onMounted(async () => {
  if (userId.value) {
    const { data } = await client.from('profiles').select('city').eq('id', userId.value).single()
    if (data) currentUserCity.value = data.city || ''
  }
})

// Fetch all profiles (limit 50 for MVP)
const { data, refresh } = await useAsyncData('ranking', async () => {
  const { data } = await client
    .from('profiles')
    .select('*')
    .order('current_streak', { ascending: false })
    .limit(50)
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
</script>
