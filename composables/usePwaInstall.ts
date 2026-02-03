export const usePwaInstall = () => {
    const showModal = ref(false)
    const deferredPrompt = ref<any>(null)
    const isInstalled = ref(false)
    const platform = ref<'ios' | 'android' | 'desktop'>('desktop')

    // Detect platform
    const detectPlatform = () => {
        if (process.client) {
            const ua = navigator.userAgent.toLowerCase()
            if (/iphone|ipad|ipod/.test(ua)) {
                platform.value = 'ios'
            } else if (/android/.test(ua)) {
                platform.value = 'android'
            } else {
                platform.value = 'desktop'
            }
        }
    }

    // Check cookies
    const checkCookies = () => {
        const installed = useCookie('pwa_installed')
        const dismissed = useCookie('pwa_dismissed')

        if (installed.value === 'true') {
            isInstalled.value = true
            return false // Don't show modal
        }

        if (dismissed.value) {
            const dismissedTime = parseInt(dismissed.value as string)
            const now = Date.now()
            const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60)

            if (hoursPassed < 24) {
                return false // Don't show modal (within 24h)
            }
        }

        return true // Show modal
    }

    // Handle install
    const handleInstall = async () => {
        if (deferredPrompt.value) {
            deferredPrompt.value.prompt()
            const { outcome } = await deferredPrompt.value.userChoice

            if (outcome === 'accepted') {
                markAsInstalled()
            }
        } else {
            // iOS or manual install
            markAsInstalled()
        }
    }

    // Mark as installed
    const markAsInstalled = () => {
        const cookie = useCookie('pwa_installed', {
            maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
        })
        cookie.value = 'true'
        showModal.value = false
        isInstalled.value = true
    }

    // Handle dismiss
    const handleDismiss = () => {
        const cookie = useCookie('pwa_dismissed', {
            maxAge: 60 * 60 * 24 // 24 hours
        })
        cookie.value = Date.now().toString()
        showModal.value = false
    }

    // Initialize
    onMounted(() => {
        detectPlatform()

        // Listen for beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            deferredPrompt.value = e
        })

        // Check if should show modal
        if (checkCookies()) {
            // Delay to avoid annoying users immediately
            setTimeout(() => {
                showModal.value = true
            }, 3000) // 3 seconds delay
        }
    })

    return {
        showModal,
        platform,
        isInstalled,
        handleInstall,
        handleDismiss,
        canInstall: computed(() => !!deferredPrompt.value)
    }
}
