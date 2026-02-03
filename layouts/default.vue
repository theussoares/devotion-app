<template>
  <div class="min-h-dvh bg-black text-white font-sans antialiased">
    <!-- Desktop Layout with Sidebar -->
    <div class="hidden md:flex min-h-screen">
      <!-- Fixed Sidebar -->
      <aside v-if="userId" class="fixed left-0 top-0 h-screen w-20 border-r border-gray-800 bg-black/95 backdrop-blur-md flex flex-col items-center py-6 gap-6 z-50">
        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-bold text-white mb-4">
          ✝️
        </NuxtLink>

        <!-- Navigation -->
        <nav class="flex flex-col gap-4">
          <NuxtLink to="/" class="btn btn-ghost btn-circle" :class="{ 'text-primary bg-primary/10': route.path === '/' }">
            <Icon name="lucide:home" class="w-6 h-6" />
          </NuxtLink>
          <NuxtLink to="/search" class="btn btn-ghost btn-circle" :class="{ 'text-primary bg-primary/10': route.path === '/search' }">
            <Icon name="lucide:search" class="w-6 h-6" />
          </NuxtLink>
          <NuxtLink to="/post" class="btn btn-ghost btn-circle" :class="{ 'text-primary bg-primary/10': route.path === '/post' }">
            <Icon name="lucide:plus" class="w-6 h-6" />
          </NuxtLink>
          <NuxtLink to="/activity" class="btn btn-ghost btn-circle" :class="{ 'text-primary bg-primary/10': route.path === '/activity' }">
            <Icon name="lucide:heart" class="w-6 h-6" />
          </NuxtLink>
          <NuxtLink to="/ranking" class="btn btn-ghost btn-circle" :class="{ 'text-primary bg-primary/10': route.path === '/ranking' }">
            <Icon name="lucide:trophy" class="w-6 h-6" />
          </NuxtLink>
        </nav>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- User Avatar -->
        <div v-if="userId" class="dropdown dropdown-top dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full ring-2 ring-primary/20">
              <img :src="profile?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'" />
            </div>
          </div>
          <ul tabindex="0" class="menu dropdown-content mb-2 z-[1] p-2 shadow-lg bg-gray-900 rounded-box w-52 border border-gray-800">
            <li>
              <NuxtLink to="/profile" class="hover:bg-gray-800 py-3">
                <Icon name="lucide:user" class="w-4 h-4" /> Meu Perfil
              </NuxtLink>
            </li>
            <li>
              <a @click="signOut" class="hover:bg-gray-800 py-3 text-red-400">
                <Icon name="lucide:log-out" class="w-4 h-4" /> Sair
              </a>
            </li>
          </ul>
        </div>
        <div v-else>
          <NuxtLink to="/login" class="btn btn-ghost btn-circle">
            <Icon name="lucide:log-in" class="w-6 h-6" />
          </NuxtLink>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-20">
        <div class="container mx-auto max-w-[680px] min-h-screen border-x border-gray-800">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="md:hidden min-h-dvh pb-20">
      <!-- Mobile Content -->
      <main class="container mx-auto max-w-[680px] min-h-dvh">
        <slot />
      </main>

      <!-- Mobile Bottom Nav -->
      <div v-if="!isAuthRoute" class="fixed bottom-0 left-0 right-0 z-[999] bg-black/95 backdrop-blur-md border-t border-gray-800 px-6 pt-4 pb-1">
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
          
          <button @click="goTo('/ranking')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/ranking' }">
            <Icon name="lucide:trophy" class="h-7 w-7" stroke-width="2.5" />
          </button>

          <button @click="goTo('/profile')" class="text-gray-500 hover:text-white transition-colors p-2" :class="{ 'text-white': route.path === '/profile' }">
            <Icon name="lucide:user" class="h-7 w-7" stroke-width="2.5" />
          </button>

        </div>
      </div>
    </div>

    <!-- PWA Install Modal -->
    <PwaInstallModal />
  </div>
</template>

<script setup lang="ts">
const userId = useState<string | null>('userId')
const client = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const isAuthRoute = computed(() => {
  return route.path === '/login' || route.path === '/register' || route.path === '/verify-email'
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
