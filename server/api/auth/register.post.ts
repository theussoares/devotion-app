import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(3),
    username: z.string().min(3),
    city: z.string().min(1),
    cityIbgeId: z.number(),
    captchaToken: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    console.log('[Register] Start')
    try {
        const body = await readBody(event)
        console.log('[Register] Body received', { email: body.email, username: body.username })

        // 1. Validate
        const result = registerSchema.safeParse(body)
        if (!result.success) {
            console.error('[Register] Validation failed', result.error)
            throw createError({
                statusCode: 400,
                statusMessage: 'Dados inválidos',
                data: result.error.flatten()
            })
        }
        const payload = result.data
        console.log('[Register] Validation success')

        // 2. Captcha
        const isHuman = await verifyCaptcha(payload.captchaToken)
        console.log('[Register] Captcha verification result:', isHuman)
        if (!isHuman) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Captcha inválido. Tente novamente.'
            })
        }

        const config = useRuntimeConfig()
        const client = await serverSupabaseClient(event)
        console.log('[Register] Supabase client initialized')

        // 3. Pre-check Username Availability
        const { data: existingUser } = await client
            .from('profiles')
            .select('username')
            .eq('username', payload.username)
            .single()

        if (existingUser) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Este nome de usuário já está em uso.'
            })
        }

        // 4. Create Auth User
        console.log('[Register] Calling Supabase signUp...')
        const { data: authData, error: authError } = await client.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                emailRedirectTo: config.public.siteUrl,
                data: {
                    full_name: payload.fullName,
                    username: payload.username,
                    city: payload.city,
                    city_ibge_id: payload.cityIbgeId
                }
            }
        })

        if (authError) {
            console.error('[Register] Supabase signUp error:', authError)

            let statusMessage = authError.message || 'Erro ao criar conta'

            // Translate common Supabase errors
            if (statusMessage.includes('email rate limit exceeded')) {
                statusMessage = 'Muitas tentativas de envio de email. Aguarde um momento e tente novamente.'
            } else if (statusMessage.includes('User already registered')) {
                statusMessage = 'Este email já está cadastrado.'
            } else if (statusMessage.includes('Password should be')) {
                statusMessage = 'A senha não atende aos requisitos mínimos.'
            }

            throw createError({
                statusCode: 400,
                statusMessage: statusMessage
            })
        }

        if (!authData.user) {
            console.error('[Register] No user returned from signUp')
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro interno: Usuário não foi criado.'
            })
        }

        console.log('[Register] User created successfully:', authData.user.id)

        // 5. Create Profile (Explicitly)
        // Use Service Role to bypass RLS (since user might not be logged in yet or policy restricts)
        const serviceClient = await serverSupabaseServiceRole(event)

        const { error: profileError } = await serviceClient
            .from('profiles')
            .insert({
                id: authData.user.id,
                username: payload.username,
                full_name: payload.fullName,
                city: payload.city,
                city_ibge_id: payload.cityIbgeId
            })

        if (profileError) {
            console.error('[Register] Failed to create profile:', profileError)
            // Optional: Cleanup auth user if profile creation fails? 
            // For MVP, we'll just throw.
            throw createError({
                statusCode: 500,
                statusMessage: 'Conta criada, mas erro ao configurar perfil. Contate o suporte.'
            })
        }

        console.log('[Register] Profile created successfully')

        return { success: true }
    } catch (e: any) {
        console.error('[Register] UNHANDLED ERROR:', e)
        // If it's already a H3Error, throw it as is
        if (e.statusCode) {
            throw e
        }
        // Otherwise wrap in 500
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: e.message
        })
    }
})
