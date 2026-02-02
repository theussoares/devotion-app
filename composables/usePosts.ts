import type { Database } from '@/types/database.types'

export const usePosts = () => {
    const client = useSupabaseClient<Database>()
    const { userId } = useAuthUser()

    const createPost = async (content: {
        caption: string,
        type: 'devotional' | 'text',
        image_url?: string | null
    }) => {
        if (!userId.value) throw new Error('User not authenticated')

        // Validation
        if (content.type === 'devotional' && !content.image_url) {
            throw new Error('Devocionais precisam de uma foto.')
        }

        const { error } = await client
            .from('posts')
            .insert({
                user_id: userId.value,
                caption: content.caption,
                type: content.type,
                image_url: content.image_url || null
            })

        if (error) throw error
        return true
    }

    const uploadImage = async (file: File) => {
        if (!userId.value) throw new Error('User not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${userId.value}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await client.storage
            .from('devotionals')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data } = client.storage
            .from('devotionals')
            .getPublicUrl(fileName)

        return data.publicUrl
    }

    return {
        createPost,
        uploadImage
    }
}
