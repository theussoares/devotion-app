export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = (query.q as string)?.trim()

    // Validação: mínimo 2 caracteres
    if (!q || q.length < 2) {
        return { users: [] }
    }

    const client = await serverSupabaseClient(event)

    try {
        const { data, error } = await client
            .from('profiles')
            .select('id, username, full_name, avatar_url, city, current_streak')
            .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
            .limit(20)

        if (error) {
            console.error('Search error:', error)
            throw error
        }

        return { users: data || [] }
    } catch (e) {
        console.error('Search failed:', e)
        return { users: [] }
    }
})
