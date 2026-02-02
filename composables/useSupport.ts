export const useSupport = () => {
    const client = useSupabaseClient()

    const createSupportRequest = async (phone: string, captchaToken?: string, type: string = 'forgot_password') => {
        // TODO: Verify captchaToken via Edge Function or RLS
        // Currently we trust the client-side check which is insufficient for public inserts.

        const { error } = await (client as any)
            .from('support_requests')
            .insert({
                phone,
                problem_type: type
            })

        if (error) {
            console.error('Error creating support request', error)
            return { success: false, message: 'Erro ao enviar solicitação.' }
        }

        return { success: true, message: 'Solicitação enviada com sucesso!' }
    }

    return {
        createSupportRequest
    }
}
