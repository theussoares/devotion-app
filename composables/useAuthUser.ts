import type { Database } from '@/types/database.types'

// Wrapper to get the user ID robustly (handling the sub/id issue)
export const useAuthUser = () => {
    const user = useSupabaseUser()

    const userId = computed(() => {
        if (!user.value) return null
        return (user.value as any).id || (user.value as any).sub
    })

    return {
        user,
        userId,
        isAuthenticated: computed(() => !!userId.value)
    }
}
