import { GoogleGenerativeAI } from '@google/generative-ai'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Server-side endpoint to moderate images using Google Gemini Flash
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('[Moderation] Request received')

        // 1. Validate Authentication
        // Wrap in try-catch specifically for auth to debug auth issues
        let user
        try {
            user = await serverSupabaseUser(event)
        } catch (authError: any) {
            console.error('[Moderation] Auth Error:', authError)
            return { approved: false, reason: 'Erro de Autenticação (Debug): ' + authError.message }
        }

        if (!user) {
            return { approved: false, reason: 'Unauthorized: Usuário não logado.' }
        }

        // 2. Parse FormData
        const formData = await readMultipartFormData(event)
        if (!formData || !formData.length) {
            return { approved: false, reason: 'Erro: Nenhum arquivo recebido.' }
        }

        const file = formData.find(f => f.name === 'image')
        if (!file || !file.data) {
            return { approved: false, reason: 'Erro: Arquivo inválido.' }
        }

        // 3. Initialize Gemini Client
        const config = useRuntimeConfig()
        const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

        if (!apiKey) {
            return { approved: false, reason: 'Erro Config: API Key ausente.' }
        }

        // ... (Gemini Logic) ...
        const genAI = new GoogleGenerativeAI(apiKey)
        // Models to try - prioritizing Gemini 2.0 as requested
        const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-latest', 'gemini-pro-vision']
        let lastError = null

        const imagePart = {
            inlineData: {
                data: file.data.toString('base64'),
                mimeType: file.type || 'image/jpeg'
            },
        }

        for (const modelName of modelsToTry) {
            try {
                // ... logic to call model ...
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent([
                    `You are a strict Content Safety Moderator... Response format (JSON only): { "safe": boolean, "reason": string }`,
                    imagePart
                ])
                const text = result.response.text()

                // Parse JSON
                let analysis: any = {}
                try {
                    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
                    analysis = JSON.parse(cleanJson)
                } catch (e) {
                    // If JSON fails, continue to next model? No, model worked but output bad JSON. 
                    // Just fail this model attempt.
                    throw new Error('JSON Parse Error: ' + text.substring(0, 50))
                }

                if (analysis.safe === false) {
                    return { approved: false, reason: analysis.reason || 'Conteúdo impróprio.' }
                }

                return { approved: true } // Success!

            } catch (e: any) {
                lastError = e
                console.log(`[Moderation] Model ${modelName} failed: ${e.message}`)
            }
        }

        return { approved: false, reason: 'Debug: Todos os modelos falharam. ' + (lastError?.message || '') }

    } catch (e: any) {
        console.error('[Moderation] Critical Error:', e)
        return { approved: false, reason: 'CRITICAL: ' + e.message }
    }
})
