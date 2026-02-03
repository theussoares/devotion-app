import { z } from 'zod'

const searchSchema = z.object({
    q: z.string()
        .min(2, 'Query must be at least 2 characters')
        .max(50, 'Query must be at most 50 characters')
        .regex(/^[a-zA-Z0-9\s@._-]+$/, 'Invalid characters in query')
})

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    // Validate input with Zod
    const result = searchSchema.safeParse(query)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: result.error.errors[0]?.message || 'Invalid query parameters'
        })
    }

    const { q } = result.data
    const client = await serverSupabaseClient(event)

    try {
        const { data, error } = await client
            .from('profiles')
            .select('id, username, full_name, avatar_url, city, current_streak')
            .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
            .limit(20)

        if (error) {
            console.error('Search error:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: 'Failed to search users'
            })
        }

        return { users: data || [] }
    } catch (e: any) {
        console.error('Search failed:', e)

        // If already a createError, rethrow
        if (e.statusCode) {
            throw e
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Search operation failed'
        })
    }
})
