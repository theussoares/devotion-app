<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/50 z-[5000] transition-opacity backdrop-blur-sm"
        @click="$emit('close')"
    ></div>

    <!-- Modal -->
    <div 
        class="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-base-100 z-[5001] rounded-t-2xl md:rounded-2xl flex flex-col max-h-[85vh] md:max-h-[600px] md:w-[480px] w-full transition-transform duration-300 transform"
        :class="isOpen ? 'translate-y-0 md:translate-y-0' : 'translate-y-full md:translate-y-10 opacity-0 md:opacity-0'"
        style="box-shadow: 0 -4px 20px rgba(0,0,0,0.3);"
    >
        <!-- Handle for dragging (mobile) -->
        <div class="md:hidden w-full flex justify-center pt-3 pb-1" @click="$emit('close')">
            <div class="w-12 h-1.5 bg-gray-700 rounded-full opacity-50"></div>
        </div>

        <!-- Header -->
        <div class="px-5 py-3 border-b border-gray-800 flex justify-between items-center bg-base-100/95 backdrop-blur rounded-t-2xl sticky top-0 z-10">
            <h3 class="font-bold text-lg text-center flex-1">{{ title }}</h3>
            <button class="btn btn-sm btn-circle btn-ghost absolute right-4" @click="$emit('close')">
                <Icon name="lucide:x" class="w-5 h-5" />
            </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-gray-800/50">
           <div class="relative">
             <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Pesquisar..." 
                class="input input-sm input-bordered w-full pl-9 rounded-full bg-base-200 border-none focus:ring-1 focus:ring-primary/50"
             />
           </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto min-h-[300px]">
            <div v-if="loading" class="flex justify-center p-8">
               <span class="loading loading-spinner loading-md text-gray-600"></span>
            </div>

            <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-500 gap-2">
                <Icon name="lucide:users" class="w-10 h-10 opacity-20" />
                <p>Ninguém encontrado</p>
            </div>

            <div v-else class="flex flex-col">
                <div v-for="user in users" :key="user.id" class="flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors cursor-pointer" @click="goToProfile(user.username)">
                    <div class="avatar">
                        <div class="w-10 h-10 rounded-full border border-gray-800">
                             <img :src="user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`" />
                        </div>
                    </div>
                    <div class="flex flex-col flex-1 min-w-0">
                        <span class="font-bold text-sm truncate text-white">{{ user.username }}</span>
                        <span v-if="user.full_name" class="text-xs text-gray-500 truncate">{{ user.full_name }}</span>
                    </div>
                     <!-- Optional: Follow button could go here -->
                </div>
            </div>
        </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  title: string
  fetchFunction: (search: string) => Promise<any[]>
  dependencyArray?: any[] // Optional triggers to re-fetch
}>()

const emit = defineEmits(['close'])

const users = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const router = useRouter()

// Debounced search
let searchTimeout: any = null
watch(searchQuery, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadUsers()
    }, 400)
})

watch(() => props.isOpen, (val) => {
    if (val) {
        searchQuery.value = ''
        loadUsers()
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
}, { immediate: true })

async function loadUsers() {
    loading.value = true
    try {
        users.value = await props.fetchFunction(searchQuery.value)
    } finally {
        loading.value = false
    }
}

function goToProfile(username: string) {
    if(!username) return
    router.push(`/user/${username}`)
    emit('close')
}

// Clean up
import { onUnmounted } from 'vue'
onUnmounted(() => {
    document.body.style.overflow = ''
})
</script>
