import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    captchaToken: z.string().min(1, 'Token de segurança obrigatório')
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validate Input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Dados inválidos ou captcha ausente.',
            data: result.error.flatten()
        })
    }

    const { email, password, captchaToken } = result.data

    // 2. Verify Captcha
    const isHuman = await verifyCaptcha(captchaToken)
    if (!isHuman) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Falha na verificação de segurança (Captcha). Tente novamente.'
        })
    }

    // 3. Authenticate with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        let message = 'Erro ao realizar login.'

        // Map Supabase errors to friendly Portuguese messages
        if (error.message === 'Invalid login credentials') {
            message = 'E-mail ou senha incorretos.'
        } else if (error.message.includes('Email not confirmed')) {
            message = 'E-mail não confirmado. Verifique sua caixa de entrada.'
        } else if (error.message.includes('Too many requests')) {
            message = 'Muitas tentativas. Tente novamente mais tarde.'
        }

        throw createError({
            statusCode: 401,
            statusMessage: message
        })
    }

    return {
        success: true,
        user: data.user,
        session: data.session
    }
})
