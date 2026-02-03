// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@nuxt/icon', '@vite-pwa/nuxt'],
  supabase: {
    redirect: false, // We will handle redirects manually with middleware
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (server-only)
    geminiApiKey: process.env.GEMINI_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    turnstileSecretKeyVisible: process.env.TURNSTILE_SECRET_KEY_VISIBLE,
    // Public keys (client-side)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      turnstile: {
        siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACW3HOA20ySSxbid', // Invisible Default
        siteKeyVisible: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY_VISIBLE || '0x4AAAAAACW3FnA5LymNDp7a', // Fallback
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Devotion',
      short_name: 'Devotion',
      description: 'Rede social cristã de devocionais diários',
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/deapsdkjozyfoipbivod\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  }
})
