// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@nuxt/icon'],
  supabase: {
    redirect: false, // We will handle redirects manually with middleware
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY,
      secretKeyVisible: process.env.TURNSTILE_SECRET_KEY_VISIBLE,
    },
    public: {
      turnstile: {
        siteKey: '0x4AAAAAACW3HOA20ySSxbid', // Invisible Default
        siteKeyVisible: '0x4AAAAAACW3FnA5LymNDp7a', // Fallback
      }
    }
  }
})
