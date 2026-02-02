export default defineNuxtRouteMiddleware(async (to, from) => {
    const client = useSupabaseClient()
    const userId = useState<string | null>('userId', () => null)
    try {
        const { data } = await client.auth.getUser()
        userId.value = data.user?.id || null
    } catch (error) {
        console.error('Failed to get user ID:', error)
        userId.value = null
        return navigateTo('/login')
    }
})