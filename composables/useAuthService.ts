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

            if (res.session) {
                const { error } = await client.auth.setSession(res.session)
                if (error) console.error('[Login] Error setting session:', error)
            } else {
                console.warn('[Login] Response missing session')
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
