import type { Database } from './database.types'

// Shared Post type with extended fields
export type Post = Database['public']['Tables']['posts']['Row'] & {
    profiles?: {
        username: string | null
        full_name: string | null
        avatar_url: string | null
    }
    likes?: Array<{ user_id: string }>
    likes_count?: number
    liked_by_me?: boolean
}
