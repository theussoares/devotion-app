import { defineStore } from 'pinia'
import type { Database } from '@/types/database.types'

// Define a type for our Post to keep things typed
// Using 'any' for relations for flexibility but 'created_at' and 'id' are required
interface FeedPost {
    id: string
    created_at: string
    [key: string]: any
}

export const useFeedStore = defineStore('feed', {
    state: () => ({
        posts: [] as FeedPost[],
        cursorCreatedAt: null as string | null,
        cursorId: null as string | null,
        hasMore: true,
        loading: false,
        scrollY: 0,
    }),

    actions: {
        reset() {
            this.posts = []
            this.cursorCreatedAt = null
            this.cursorId = null
            this.hasMore = true
            this.loading = false
            this.scrollY = 0
        },

        setScroll(y: number) {
            this.scrollY = y
        },

        async loadMore(limit = 10) {
            if (this.loading || !this.hasMore) return

            this.loading = true
            const client = useSupabaseClient<Database>()

            // Base query
            let query = client
                .from('posts')
                .select(`
            *,
            profiles (username, full_name, avatar_url),
            likes (user_id),
            comments (count)
        `)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false }) // Secondary sort for stable pagination
                .limit(limit)

            // Apply Compound Cursor
            if (this.cursorCreatedAt && this.cursorId) {
                // Logic: (created_at < cursorTime) OR (created_at == cursorTime AND id < cursorId)
                // PostgREST syntax for OR is: or=(Condition1,Condition2)
                // But combining AND inside OR in PostgREST JS client can be tricky.
                // A robust alternative is using the `lt` operator tuple if supported, or just filtering strictly.
                // Given Supabase constraints, standard approach:
                // Use 'or' filter string raw format:
                // `created_at.lt.${this.cursorCreatedAt},and(created_at.eq.${this.cursorCreatedAt},id.lt.${this.cursorId})`

                query = query.or(`created_at.lt.${this.cursorCreatedAt},and(created_at.eq.${this.cursorCreatedAt},id.lt.${this.cursorId})`)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching feed:', error)
                this.loading = false
                return
            }

            if (!data || data.length === 0) {
                this.hasMore = false
                this.loading = false
                return
            }

            // Map data (add liked_by_me, etc if needed - can be done in component or here)
            // For now, raw data relative to component needs.
            // We need to inject `userId` logic here or in component. 
            // Ideally store holds raw data, component computes display.
            // But for performance, let's keep it consistent with what index.vue expects.

            const session = await client.auth.getSession()
            const userId = session.data.session?.user?.id

            const refinedPosts = data.map((p: any) => ({
                ...p,
                likes_count: p.likes?.length || 0,
                liked_by_me: userId ? p.likes?.some((l: any) => l.user_id === userId) : false,
                comments: null,
                comments_count: p.comments ? p.comments[0]?.count : 0
            }))

            this.posts.push(...refinedPosts)

            // Update Cursor
            const lastPost = refinedPosts[refinedPosts.length - 1]
            this.cursorCreatedAt = lastPost.created_at
            this.cursorId = lastPost.id

            if (data.length < limit) {
                this.hasMore = false
            }

            this.loading = false
        },

        removePost(id: string) {
            this.posts = this.posts.filter(p => p.id !== id)
        }
    }
})
