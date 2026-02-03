import type { Post } from '@/types/post.types'

export interface DayPosts {
    date: string // "2026-01-16"
    posts: Post[]
    count: number
    streakPost: Post | null // Primeiro post do dia (conta para streak)
}

export const useCalendar = () => {
    /**
     * Agrupa posts por dia
     * - Ordena posts de cada dia do mais recente ao mais antigo
     * - Identifica o primeiro post (mais antigo) como streakPost
     */
    const groupPostsByDay = (posts: Post[]): Record<string, DayPosts> => {
        const grouped = posts.reduce((acc, post) => {
            if (!post.created_at) return acc

            const date = new Date(post.created_at).toISOString().split('T')[0]

            if (!acc[date]) {
                acc[date] = {
                    date,
                    posts: [],
                    count: 0,
                    streakPost: null
                }
            }

            acc[date].posts.push(post)
            acc[date].count++

            return acc
        }, {} as Record<string, DayPosts>)

        // Ordenar posts de cada dia (mais recente primeiro)
        // E identificar o streak post (primeiro = mais antigo)
        Object.values(grouped).forEach(day => {
            day.posts.sort((a, b) => {
                if (!a.created_at || !b.created_at) return 0
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })

            // Streak post é o último da lista (mais antigo)
            day.streakPost = day.posts[day.posts.length - 1] || null
        })

        return grouped
    }

    /**
     * Formata data para exibição
     */
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long'
        })
    }

    /**
     * Formata horário para exibição
     */
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return {
        groupPostsByDay,
        formatDate,
        formatTime
    }
}
