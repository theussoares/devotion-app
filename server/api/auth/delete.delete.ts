import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. Verify User
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    // 2. Initialize Admin Client
    // This uses the SUPABASE_SERVICE_KEY from runtimeConfig
    const client = serverSupabaseServiceRole(event)

    try {
        // 3. Delete User from Auth (This should cascade if DB is configured, or leave orphaned data)
        // For a strict MVP, this ensures the user can't login anymore.
        const { error } = await client.auth.admin.deleteUser(user.id)

        if (error) {
            console.error('Delete user error:', error)
            throw error
        }

        return { success: true }

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete account: ' + error.message
        })
    }
})
