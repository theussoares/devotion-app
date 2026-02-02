export const verifyCaptcha = async (token: string): Promise<boolean> => {
    const config = useRuntimeConfig()

    // Helper to check against a specific secret
    const verify = async (secret: string) => {
        try {
            const formData = new FormData()
            formData.append('secret', secret)
            formData.append('response', token)

            const res = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData
            })
            return res.success
        } catch (e) {
            console.error('Turnstile verification error:', e)
            return false
        }
    }

    // 1. Try Invisible Secret
    if (config.turnstile.secretKey) {
        const success = await verify(config.turnstile.secretKey)
        if (success) return true
    }

    // 2. Try Visible Secret (Fallback)
    if (config.turnstile.secretKeyVisible) {
        const success = await verify(config.turnstile.secretKeyVisible)
        if (success) return true
    }

    return false
}
