import { z } from 'zod'

export const loginSchema = z.object({
    email: z.preprocess(
        val => val ?? '',
        z.string().min(1, 'O e-mail é obrigatório').email('Email inválido')
    ),
    password: z.preprocess(
        val => val ?? '',
        z.string().min(1, 'A senha é obrigatória')
    )
})

export const registerSchema = z.object({
    fullName: z.preprocess(
        val => val ?? '',
        z.string().min(3, 'Nome deve ter pelo menos 3 caracteres')
    ),
    username: z.preprocess(
        val => val ?? '',
        z.string()
            .min(3, 'Usuário deve ter pelo menos 3 caracteres')
            .regex(/^@?[\w\.]+$/, 'Usuário deve conter apenas letras, números e pontos')
            .transform(val => val.startsWith('@') ? val : `@${val}`)
    ),
    email: z.preprocess(
        val => val ?? '',
        z.string().min(1, 'O e-mail é obrigatório').email('Email inválido')
    ),
    password: z.preprocess(
        val => val ?? '',
        z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
    ),
    city: z.preprocess(
        val => val ?? '',
        z.string().min(1, 'A cidade é obrigatória')
    ),
    cityIbgeId: z.preprocess(
        val => val ?? 0,
        z.number().gt(0, 'Selecione uma cidade da lista')
    )
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
