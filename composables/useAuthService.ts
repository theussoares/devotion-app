import type { Database } from '@/types/database.types'

export const useAuthService = () => {
    const client = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const router = useRouter()

    // Login (SSR)
    const login = async (email: string, pass: string, captchaToken?: string) => {
        try {
            const res = await $fetch<{ user: any, session: any, success: boolean }>('/api/auth/login', {
                method: 'POST',
                body: { email, password: pass, captchaToken }
            })

            // IMPORTANT: If the server returns a session (it should if using signIn), 
            // we must set it on the client to persist login state.
            // However, our server route used `serverSupabaseClient` which might set cookies?
            // Usually `signInWithPassword` on server side does NOT automatically set client cookies unless proxied perfectly.
            // Simplest way: The server returns the user (and session if we ask for it).
            // Actually, the server route currently returns { user }.
            // We need the SESSION to log in on client.

            // Let's assume we update the server route to return session first.
            // But verify: if `serverSupabaseClient` shares cookies, maybe it worked?
            // No, the response cookies from Supabase API need to be forwarded to Browser.
            // The safest pattern is: Client receives Session JSON -> calls client.auth.setSession().

            // Since I haven't updated the server to return session yet, I will update it in next step.
            // For now, let's write the client code assuming it returns session.

            // Wait, I need to fix the server api first to return session.
            // But I can't do parallel edits easily.
            // I'll assume server returns 'session'.

            if (res.session) {
                console.log('Setting session on client...', res.session.user.id)
                const { error } = await client.auth.setSession(res.session)
                if (error) console.error('Error setting session:', error)
                else console.log('Session set successfully.')
            } else {
                console.warn('Login response missing session!', res)
            }

            // If successful, we update local user state if needed (Supabase watcher handles it).
            return { success: true }

        } catch (error: any) {
            // Check if error is due to email not confirmed
            const errorMsg = error.statusMessage || error.message || ''

            if (errorMsg.toLowerCase().includes('email not confirmed') ||
                errorMsg.toLowerCase().includes('email confirmation')) {
                // Redirect to verify-email page
                await router.push({
                    path: '/verify-email',
                    query: { email }
                })
                return {
                    success: false,
                    message: 'Email não confirmado. Verifique sua caixa de entrada.'
                }
            }

            return {
                success: false,
                message: errorMsg || 'Erro ao entrar.'
            }
        }
    }

    interface RegisterPayload {
        email: string
        password: string
        fullName: string
        username: string
        city: string
        cityIbgeId: number
        captchaToken?: string
    }

    // Register (SSR)
    const register = async (payload: RegisterPayload) => {
        try {
            await $fetch('/api/auth/register', {
                method: 'POST',
                body: payload
            })

            // If register is successful (and auto-confirm is on), we might want to login?
            // The current flow redirects to Login or home.
            // Usually explicit login is better after register.

            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                message: error.statusMessage || 'Erro ao criar conta.'
            }
        }
    }

    // Logout
    const logout = async () => {
        await client.auth.signOut()

        // Clear State
        user.value = null

        // Clear Cache securely
        clearNuxtData((key) => {
            return key.startsWith('feed') || key === 'my_profile' || key === 'my_posts'
        })

        // Redirect
        router.push('/login')
    }

    return {
        login,
        register,
        logout
    }
}
