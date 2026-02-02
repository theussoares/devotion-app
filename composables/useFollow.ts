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

    return { isFollowing, toggleFollow }
}
