<template>
  <div class="min-h-screen bg-base-100 text-base-content font-sans">
    <nav class="navbar bg-base-200 shadow-sm sticky top-0 z-50">
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost text-xl font-bold text-primary">Devocional</NuxtLink>
      </div>
      <div class="flex-none gap-2">
        <ul class="menu menu-horizontal px-1">
          <li><NuxtLink to="/ranking">Ranking</NuxtLink></li>
        </ul>
        <div v-if="user" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img :src="profile?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User'" />
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><NuxtLink to="/profile">Meu Perfil</NuxtLink></li>
            <li><a @click="signOut">Sair</a></li>
          </ul>
        </div>
        <div v-else>
          <NuxtLink to="/login" class="btn btn-primary btn-sm">Entrar</NuxtLink>
        </div>
      </div>
    </nav>

    <main class="container mx-auto p-4 max-w-md md:max-w-3xl pb-20">
      <slot />
    </main>

    <!-- Mobile Bottom Nav -->
    <div class="btm-nav md:hidden z-50">
      <NuxtLink to="/" active-class="active">
        <Component :is="HomeIcon" class="h-5 w-5" />
      </NuxtLink>
      <NuxtLink to="/post" active-class="active" class="text-primary">
        <Component :is="PlusCircleIcon" class="h-6 w-6" />
      </NuxtLink>
      <NuxtLink to="/profile" active-class="active">
        <Component :is="UserIcon" class="h-5 w-5" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, PlusCircle, User } from 'lucide-vue-next'

// Need to wrap icons to use as components if not auto-imported, but lucide-vue-next components are direct
const HomeIcon = Home
const PlusCircleIcon = PlusCircle
const UserIcon = User

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

// Use standard fetch or state management for profile
const { data: profile } = await useAsyncData('current_profile', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('profiles').select('*').eq('id', user.value.id).single()
  return data
}, { watch: [user] })

async function signOut() {
  await client.auth.signOut()
  router.push('/login')
}
</script>
