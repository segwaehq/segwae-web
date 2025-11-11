import { useState, useEffect } from 'react'

export interface SocialPlatform {
  id: string
  platform_name: string
  platform_identifier: string
  icon_identifier: string
  color_hex: string
  display_order: number
  is_enabled: boolean
  url_pattern: string | null
}

interface UseSocialPlatformsReturn {
  platforms: SocialPlatform[]
  loading: boolean
  error: Error | null
}

// In-memory cache (survives component re-renders but not page refreshes)
let cachedPlatforms: SocialPlatform[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useSocialPlatforms(): UseSocialPlatformsReturn {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPlatforms = async () => {
      // Check cache first
      const now = Date.now()
      if (
        cachedPlatforms &&
        cacheTimestamp &&
        now - cacheTimestamp < CACHE_DURATION
      ) {
        setPlatforms(cachedPlatforms)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/social-platforms')

        if (!response.ok) {
          throw new Error('Failed to fetch social platforms')
        }

        const data = await response.json()

        // Update cache
        cachedPlatforms = data
        cacheTimestamp = Date.now()

        setPlatforms(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching social platforms:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // On error, use cached data if available
        if (cachedPlatforms) {
          setPlatforms(cachedPlatforms)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  return { platforms, loading, error }
}
