import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

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

        // 3. Create Auth User
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
            throw createError({
                statusCode: 400,
                statusMessage: authError.message || 'Erro ao criar conta'
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

        // 4. Update Profile (Atomic Consistency)
        // See comments in original file about RLS issues. 
        // We assume trigger handles metadata mapping for now.

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
