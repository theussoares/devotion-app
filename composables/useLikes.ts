import type { Database } from '@/types/database.types'

export const useLikes = () => {
    const client = useSupabaseClient<Database>()
    const userId = useState<string | null>('userId')

    const fetchLikes = async (postId: string, search: string = '') => {
        const { data, error } = await client
            .from('likes')
            .select(`
                user_id,
                profiles (id, username, full_name, avatar_url, bio)
            `)
            .eq('post_id', postId)

        console.log('fetchLikes debug:', { postId, data, error })

        if (error) {
            console.error('Error fetching likes:', error)
            return []
        }

        let users = data.map((item: any) => item.profiles).filter((p: any) => p !== null && p.username)

        if (search) {
            const lowerSearch = search.toLowerCase()
            users = users.filter((u: any) =>
                u.username?.toLowerCase().includes(lowerSearch) ||
                u.full_name?.toLowerCase().includes(lowerSearch)
            )
        }

        return users
    }

    return {
        fetchLikes
    }
}
