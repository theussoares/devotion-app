<template>
  <div class="min-h-dvh bg-black text-white font-sans antialiased pb-20 md:pb-0">
    <!-- Navbar (Desktop) -->
    <nav class="hidden md:flex navbar bg-black/80 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-800 max-w-[680px] mx-auto">
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost text-xl font-bold tracking-tighter text-white hover:bg-white/10">Devocional</NuxtLink>
      </div>
      <div class="flex-none gap-2">
        <div v-if="userId" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-9 rounded-full ring-1 ring-gray-700">
              <img :src="profile?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'" />
            </div>
          </div>
          <!-- Dropdown Menu -->
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-gray-900 text-white rounded-box w-52 border border-gray-800">
            <li>
                <NuxtLink to="/profile" class="hover:bg-gray-800 py-3" @click="closeDropdown">
                    <Icon name="lucide:user" class="w-4 h-4 mr-2"/> Meu Perfil
                </NuxtLink>
            </li>
            <li>
                <a @click="signOut" class="hover:bg-gray-800 py-3 text-red-400">
                    <Icon name="lucide:log-out" class="w-4 h-4 mr-2"/> Sair
                </a>
            </li>
          </ul>
        </div>
        <div v-else>
          <NuxtLink to="/login" class="btn btn-white btn-sm rounded-full px-6 text-black bg-white hover:bg-gray-200 border-none">Entrar</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto max-w-[680px] min-h-dvh border-x border-transparent md:border-gray-800 relative z-0">
      <slot />
    </main>

    <!-- Mobile Bottom Nav -->
    <div v-if="!isAuthRoute" class="fixed bottom-0 left-0 right-0 z-[999] bg-black/95 backdrop-blur-md border-t border-gray-800 px-6 pt-4 md:hidden pb-1">
      <div class="flex justify-between items-center max-w-[680px] mx-auto">
        
        <button @click="goTo('/')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/' }">
          <Icon name="lucide:home" class="h-7 w-7" stroke-width="2.5" />
        </button>
        
        <button @click="goTo('/search')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/search' }">
          <Icon name="lucide:search" class="h-7 w-7" stroke-width="2.5" />
        </button>
        
        <!-- Post Button -->
        <button @click="goTo('/post')" class="text-gray-500 hover:text-white transition-colors relative group">
             <div class="bg-white text-black px-2 pb-1 pt-2 rounded-2xl border border-transparent group-active:scale-95 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                 <Icon name="lucide:plus" class="h-6 w-6" stroke-width="3.5" />
             </div>
        </button>
        
        <button @click="goTo('/activity')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/activity' }">
          <Icon name="lucide:heart" class="h-7 w-7" stroke-width="2.5" />
        </button>

        <button @click="goTo('/profile')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/profile' }">
          <Icon name="lucide:user" class="h-7 w-7" stroke-width="2.5" />
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userId = useState<string | null>('userId')
const client = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const isAuthRoute = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// Fetch Profile
const { data: profile } = await useAsyncData('current_profile', async () => {
  if (!userId.value) return null
  const { data } = await client.from('profiles').select('*').eq('id', userId.value).single()
  return data
}, { watch: [userId] })

const { logout } = useAuthService()

async function signOut() {
  await logout()
  closeDropdown()
}

function closeDropdown() {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
}

function goTo(path: string) {
    console.log('Navigating to:', path)
    closeDropdown()
    router.push(path)
}
</script>

<style>
/* Global body override */
body {
    background-color: black;
    color: white;
}
/* Safe area padding for iPhones */
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 1rem);
}
</style>
