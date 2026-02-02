import { z } from 'zod'

export const supportSchema = z.object({
    phone: z.preprocess(
        val => val ?? '',
        z.string({ required_error: 'O telefone é obrigatório' })
            .min(10, 'O telefone deve incluir DDD e número')
            // Simple regex for digits, parens, dash, space
            .regex(/^[\d\s\-\(\)\+]+$/, 'Telefone inválido')
    )
})

export type SupportSchema = z.infer<typeof supportSchema>
