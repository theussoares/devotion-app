export default defineNuxtRouteMiddleware(async (to, from) => {
    const client = useSupabaseClient()
    const userId = useState<string | null>('userId', () => null)

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/terms', '/privacy']
    if (publicRoutes.includes(to.path)) {
        userId.value = null
        return
    }

    try {
        const { data, error } = await client.auth.getUser()

        // Check for specific auth errors (deleted user, invalid JWT, etc)
        if (error) {
            // Only log critical errors, not "session missing" which is normal for logged out users
            if (error.name !== 'AuthSessionMissingError') {
                console.error('Auth middleware error:', error)
            }

            if (
                error.message?.includes('user_not_found') ||
                error.message?.includes('does not exist') ||
                error.code === 'user_not_found'
            ) {
                // Force logout to clear invalid session
                await client.auth.signOut()
                userId.value = null
                return navigateTo('/login')
            }

            // For session missing or other non-critical errors, just set null
            userId.value = null
            return
        }

        userId.value = data.user?.id || null
    } catch (error: any) {
        console.error('Failed to get user ID:', error)
        // Force logout on any critical error
        await client.auth.signOut()
        userId.value = null
        return navigateTo('/login')
    }
})