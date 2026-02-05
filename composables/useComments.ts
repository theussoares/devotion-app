import type { Database } from '@/types/database.types'

export const useComments = (postId: string) => {
    const client = useSupabaseClient<Database>()
    const userId = useState<string | null>('userId')

    const comments = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const submitting = ref(false)

    const fetchComments = async () => {
        loading.value = true
        error.value = null
        try {
            const { data, error: err } = await client
                .from('comments')
                .select(`
                    *,
                    profiles (id, username, full_name, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: false })

            if (err) throw err
            console.log('fetchComments debug:', { postId, data, count: data?.length })
            comments.value = data || []
        } catch (e: any) {
            console.error('Error fetching comments:', e)
            error.value = e.message || 'Erro ao carregar comentários'
        } finally {
            loading.value = false
        }
    }

    const addComment = async (content: string) => {
        if (!userId.value) return

        submitting.value = true
        error.value = null

        try {
            const { error: err } = await client
                .from('comments')
                .insert({
                    post_id: postId,
                    user_id: userId.value,
                    content: content.trim()
                })

            if (err) throw err

            // Refresh to get the real comment with profile data
            await fetchComments()
            return true
        } catch (e: any) {
            console.error('Error adding comment:', e)
            error.value = e.message || 'Erro ao enviar comentário'
            return false
        } finally {
            submitting.value = false
        }
    }

    const deleteComment = async (commentId: string) => {
        // Optimistic update
        const previousComments = [...comments.value]
        comments.value = comments.value.filter(c => c.id !== commentId)

        try {
            const { error: err } = await client
                .from('comments')
                .delete()
                .eq('id', commentId)

            if (err) throw err
        } catch (e: any) {
            console.error('Error deleting comment:', e)
            // Rollback
            comments.value = previousComments
            error.value = 'Erro ao excluir comentário'
        }
    }

    return {
        comments,
        loading,
        error,
        submitting,
        fetchComments,
        addComment,
        deleteComment
    }
}
