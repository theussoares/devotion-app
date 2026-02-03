import { defineEventHandler, getRequestIP, createError } from 'h3'

// In-memory store for request tracking
// In production, use Redis or similar
const requests = new Map<string, number[]>()

export default defineEventHandler((event) => {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 250 // Max requests per window

    // Initialize IP tracking
    if (!requests.has(ip)) {
        requests.set(ip, [])
    }

    // Get user's request history
    const userRequests = requests.get(ip)!

    // Filter to only recent requests within the window
    const recentRequests = userRequests.filter(time => now - time < windowMs)

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
        throw createError({
            statusCode: 429,
            statusMessage: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
        })
    }

    // Add current request
    recentRequests.push(now)
    requests.set(ip, recentRequests)

    // Cleanup old entries periodically (every 1000 requests)
    if (Math.random() < 0.001) {
        for (const [key, times] of requests.entries()) {
            const validTimes = times.filter(time => now - time < windowMs)
            if (validTimes.length === 0) {
                requests.delete(key)
            } else {
                requests.set(key, validTimes)
            }
        }
    }
})
