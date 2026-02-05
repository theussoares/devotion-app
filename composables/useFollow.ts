import type { Database } from '@/types/database.types'

export const useFollow = () => {
    const client = useSupabaseClient<Database>()
    const userId = useState<string | null>('userId')

    const isFollowing = async (targetUserId: string) => {
        if (!userId.value) return false
        const { data } = await client.from('follows')
            .select('*')
            .match({ follower_id: userId.value, following_id: targetUserId })
            .maybeSingle()
        return !!data
    }

    const toggleFollow = async (targetUserId: string, currentStatus: boolean) => {
        if (!userId.value) throw new Error('Auth required')

        if (currentStatus) {
            // Unfollow
            const { error } = await client.from('follows')
                .delete()
                .match({ follower_id: userId.value, following_id: targetUserId })
            if (error) throw error
            return false
        } else {
            // Follow
            const { error } = await client.from('follows')
                .insert({ follower_id: userId.value, following_id: targetUserId })
            if (error) throw error
            return true
        }
    }

    const getFollowers = async (targetUserId: string, search: string = '') => {
        let query = client.from('follows')
            .select(`
                follower_id,
                profiles:follower_id (id, username, full_name, avatar_url, bio, city)
            `)
            .eq('following_id', targetUserId)

        if (search) {
            // Note: Searching on joined table columns is tricky in simple syntax, 
            // but we can search on the result if valid, or use !inner if supported well.
            // For now, let's fetch and filter in standard usage or use a view if needed.
            // However, Supabase allows filtering on foreign tables:
            // .ilike('profiles.username', `%${search}%`)
            // But 'profiles' is an alias here.
            // Let's try to rely on client side filtering for MVP if list is small, 
            // OR use a proper RPC function if performance is needed.
            // Given the requirements "input de pesquisa", let's returned all then filter for MVP 
            // to avoid complex joins issues unless necessary.
        }

        const { data, error } = await query

        console.log('getFollowers debug:', { targetUserId, search, data, error })

        if (error) {
            console.error('Error fetching followers:', error)
            return []
        }

        // Transform and filter
        let users = data.map((item: any) => item.profiles).filter((p: any) => p !== null && p.username) // Filter out nulls/deleted users

        if (search) {
            const lowerSearch = search.toLowerCase()
            users = users.filter((u: any) =>
                u.username?.toLowerCase().includes(lowerSearch) ||
                u.full_name?.toLowerCase().includes(lowerSearch)
            )
        }

        return users
    }

    const getFollowing = async (targetUserId: string, search: string = '') => {
        let query = client.from('follows')
            .select(`
                following_id,
                profiles:following_id (id, username, full_name, avatar_url, bio, city)
            `)
            .eq('follower_id', targetUserId)

        const { data, error } = await query

        console.log('getFollowing debug:', { targetUserId, search, data, error })

        if (error) {
            console.error('Error fetching following:', error)
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

    return { isFollowing, toggleFollow, getFollowers, getFollowing }
}
