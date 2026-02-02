import type { Database } from '@/types/database.types'

export const useProfilePhoto = () => {
    const client = useSupabaseClient<Database>()
    const userId = useState<string | null>('userId')
    const uploading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Valida arquivo de imagem
     */
    const validateImage = (file: File): { valid: boolean; error?: string } => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Formato inválido. Use JPG, PNG ou WEBP.'
            }
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'Arquivo muito grande. Máximo 5MB.'
            }
        }

        return { valid: true }
    }

    /**
     * Faz upload do avatar e atualiza o perfil
     */
    const uploadAvatar = async (file: File): Promise<string> => {
        if (!userId.value) {
            throw new Error('Usuário não autenticado')
        }

        // Validação
        const validation = validateImage(file)
        if (!validation.valid) {
            throw new Error(validation.error)
        }

        uploading.value = true
        error.value = null

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId.value}/avatar.${fileExt}`

            // Deletar avatar antigo (se existir)
            // Não tratamos erro aqui pois pode não existir
            await client.storage
                .from('avatars')
                .remove([fileName])
                .catch(() => { }) // Silenciar erro se não existir

            // Upload novo avatar
            const { error: uploadError } = await client.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                throw new Error('Erro ao fazer upload da imagem')
            }

            // Obter URL pública
            const { data } = client.storage
                .from('avatars')
                .getPublicUrl(fileName)

            const publicUrl = data.publicUrl

            // Atualizar perfil com nova URL
            const { error: updateError } = await client
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId.value)

            if (updateError) {
                console.error('Profile update error:', updateError)
                throw new Error('Erro ao atualizar perfil')
            }

            return publicUrl
        } catch (e: any) {
            error.value = e.message || 'Erro ao fazer upload'
            throw e
        } finally {
            uploading.value = false
        }
    }

    return {
        uploadAvatar,
        uploading,
        error,
        validateImage
    }
}
