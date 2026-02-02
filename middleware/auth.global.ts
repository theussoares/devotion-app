export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Protected Routes (Whitelist approach or Blacklist)
    // Here we assume everything is protected EXCEPT login/register unless specified otherwise?
    // Actually, earlier files showed `definePageMeta({ middleware: 'auth' })` usage.
    // If we switch to global, we should be consistent.
    // Let's implement a specific logic:
    // 1. If user is NOT logged in, and tries to access Protected Routes -> Redirect Login
    // 2. If user IS logged in, and tries to access Public Auth Routes (Login/Register) -> Redirect Home

    // List of routes that require being logged OUT
    const authRoutes = ['/login', '/register']

    // List of routes that are public (optional, if any)
    // const publicRoutes = ['/about'] 

    if (user.value) {
        // If logged in and trying to go to login/register, redirect home
        if (authRoutes.includes(to.path)) {
            return navigateTo('/')
        }
    } else {
        // If NOT logged in, we rely on page-level middleware 'auth' usually, 
        // OR we can enforce it here for specific paths.
        // User requested: "Middleware global em Nuxt protegendo: /, /post, /profile"
        // Let's enforce it here to be safe and global.

        const protectedRoutes = ['/', '/post', '/profile', '/ranking']
        // Check if path starts with these (to cover sub-paths like /profile/settings if they existed)
        // OR exact match. Since /post is exact...
        // For '/', it matches everything if we use 'startsWith'. Be careful.

        const isProtected = protectedRoutes.some(route => to.path === route || (route !== '/' && to.path.startsWith(route)))

        // Special case for Home '/' which is protected in this app
        const isHome = to.path === '/'

        if (isHome || isProtected) {
            return navigateTo('/login')
        }
    }
})
