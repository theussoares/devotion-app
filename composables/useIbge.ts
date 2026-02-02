export const useIbge = () => {
    // Cache for city searches to avoid spamming the API
    // Key: query string, Value: List of cities
    const searchCache = new Map<string, any[]>()

    // Base URL for IBGE API
    const BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios'

    /**
     * Search cities by name (Standardized to lower case for cache matches)
     * @param query - City name fragment (e.g., "Sao")
     * @returns Array of cities with { id, nome, microrregiao: { mesorregiao: { UF: { sigla } } } }
     */
    const searchCities = async (query: string) => {
        if (!query || query.length < 3) return []

        const cacheKey = `ibge:search:${query.toLowerCase()}`

        // Check internal runtime cache first
        if (searchCache.has(cacheKey)) {
            return searchCache.get(cacheKey)
        }

        // Using Nuxt's useFetch for request deduplication and SSR support if needed
        // Note: The IBGE API doesn't support 'like' search directly on this endpoint comfortably without fetching all, 
        // but typically for autocomplete we can use the main endpoint or specific search endpoints if available.
        // Actually, IBGE doesn't have a "search by name" endpoint that filters server-side easily for ALL municipalities without fetching a lot.
        // However, a common approach is to fetch by UF or use a known provider. 
        // BUT, given the scope, we can use the "Localidades" API which is quite fast.
        // A better endpoint for autocomplete is: https://servicodados.ibge.gov.br/api/v1/localidades/municipios
        // It returns ALL (5570) items. That's heavy (approx 1.5MB).
        // OPTIMIZATION: We will fetch all once and cache client-side if the user interacts, OR rely on a lightweight proxy if defined.
        // FOR NOW: We will use a direct fetch but we CANNOT filter server side on IBGE.
        // Wait, standard practice for IBGE autocomplete:
        // There is NO search endpoint. We usually fetch all and filter client side.
        // 5000 items is manageable in memory for desktop/modern mobile.

        // Let's implement a "Lazy Load All" strategy.
        // We fetch all municipalities ONCE and filter locally. 

        const nuxtApp = useNuxtApp()
        const cachedAll = nuxtApp.payload.data['ibge-all-cities'] || (nuxtApp.static.data as any)['ibge-all-cities']

        let allCities = cachedAll

        if (!allCities) {
            const { data } = await useFetch(BASE_URL, {
                key: 'ibge-all-cities',
                server: false, // Client side only to save server bandwidth if irrelevant for SEO
                lazy: true
            })
            if (data.value) allCities = data.value
        }

        // If we still don't have data (first load pending), we might return empty or wait
        // Ideally we useAsyncData to block if critical, but for autocomplete we want non-blocking.
        if (!allCities && !currPromise) {
            // If allow calling without hook context (unlikely here but safe to keep referenced)
            // We can just return [] and let the reactivity update later if we used useFetch correctly.
            // But useFetch is composable.
        }

        // REVISION: The above usage of useFetch inside a function called by event handler is WRONG.
        // useFetch must be called during setup.
        // We should use $fetch for ad-hoc requests.

        return await fetchAndFilter(query)
    }

    // Static promise to avoid multiple simultaneous requests for the big list
    let fetchPromise: Promise<any[]> | null = null
    const allCitiesCache = ref<any[]>([])

    const fetchAndFilter = async (query: string) => {
        if (allCitiesCache.value.length === 0) {
            if (!fetchPromise) {
                fetchPromise = $fetch<any[]>(BASE_URL)
                    .then(res => {
                        allCitiesCache.value = res.map((c: any) => ({
                            id: c.id,
                            name: c.nome,
                            uf: c.microrregiao.mesorregiao.UF.sigla
                        }))
                        return allCitiesCache.value
                    })
                    .catch(err => {
                        console.error('IBGE API Error', err)
                        return []
                    })
                    .finally(() => {
                        fetchPromise = null
                    })
            }
            await fetchPromise
        }

        const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        const results = allCitiesCache.value.filter(c => {
            const cityName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            return cityName.includes(q)
        }).slice(0, 20) // Limit results for performance

        searchCache.set(`ibge:search:${query.toLowerCase()}`, results)
        return results
    }

    const getCityById = async (id: number) => {
        // If we have the cache, find it there
        if (allCitiesCache.value.length > 0) {
            return allCitiesCache.value.find(c => c.id === id)
        }
        // Fallback to direct fetch
        try {
            const data = await $fetch<any>(`${BASE_URL}/${id}`)
            if (data) {
                return {
                    id: data.id,
                    name: data.nome,
                    uf: data.microrregiao.mesorregiao.UF.sigla
                }
            }
        } catch (e) {
            return null
        }
    }

    const getStates = async () => {
        // IBGE States Endpoint
        // https://servicodados.ibge.gov.br/api/v1/localidades/estados
        const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
        try {
            const data = await $fetch<any[]>(url)
            return data.map(uf => ({
                id: uf.id,
                sigla: uf.sigla,
                nome: uf.nome
            }))
        } catch (error) {
            console.error('Error fetching states', error)
            return []
        }
    }

    const getCitiesByState = async (ufId: number) => {
        // IBGE Cities by State Endpoint
        // https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios
        const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios?orderBy=nome`
        try {
            const data = await $fetch<any[]>(url)
            return data.map(city => ({
                id: city.id,
                name: city.nome
            }))
        } catch (error) {
            console.error('Error fetching cities', error)
            return []
        }
    }

    return {
        searchCities,
        getCityById,
        getStates,
        getCitiesByState
    }
}
