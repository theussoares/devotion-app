import { useDebounceFn } from '@vueuse/core'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export const useSearch = () => {
    const query = ref('')
    const results = ref<Profile[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const search = useDebounceFn(async (q: string) => {
        // Limpar resultados se query muito curta
        if (q.length < 2) {
            results.value = []
            loading.value = false
            return
        }

        loading.value = true
        error.value = null

        try {
            const { users } = await $fetch('/api/search/users', {
                query: { q }
            })
            results.value = users
        } catch (e: any) {
            console.error('Search error:', e)
            error.value = 'Erro ao buscar usuários'
            results.value = []
        } finally {
            loading.value = false
        }
    }, 300) // 300ms debounce

    // Watch query changes
    watch(query, (newQuery) => {
        search(newQuery)
    })

    const clearSearch = () => {
        query.value = ''
        results.value = []
        error.value = null
    }

    return {
        query,
        results,
        loading,
        error,
        clearSearch
    }
}
