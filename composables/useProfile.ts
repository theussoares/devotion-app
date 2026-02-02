import type { Database } from '@/types/database.types'

export const useProfile = () => {
    const client = useSupabaseClient<Database>()
    const userId = useState<string | null>('userId')

    // Fetch specific profile by Identifier (ID or Username if we added that logic later)
    const fetchProfile = async (id: string) => {
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    }

    // Fetch current user's profile
    const { data: myProfile, refresh: refreshMyProfile } = useAsyncData('my_profile', async () => {
        if (!userId.value) return null
        const { data } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId.value)
            .single()
        return data
    }, { watch: [userId] })

    return {
        myProfile,
        refreshMyProfile,
        fetchProfile
    }
}
