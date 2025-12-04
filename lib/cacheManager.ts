export class CacheManager {
  private cleanupInterval: NodeJS.Timeout | null = null;

  startPeriodicCleanup(intervalMinutes: number = 30) {
    if (this.cleanupInterval) {
      this.stopPeriodicCleanup();
    }

    this.cleanupInterval = setInterval(async () => {
      try {
        await this.performCleanup();
      } catch (error) {
        console.warn('Cache cleanup failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Started cache cleanup every ${intervalMinutes} minutes`);
  }

  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Stopped cache cleanup');
    }
  }

  async performCleanup(maxAgeHours: number = 1) {
    const maxAgeSeconds = maxAgeHours * 3600;
    
    const response = await fetch(`/api/cache?action=cleanup&maxAge=${maxAgeSeconds}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Cleanup failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Cache cleanup completed:', result.message);
    return result;
  }

  async getCacheStats(url?: string) {
    const queryParams = new URLSearchParams();
    queryParams.set('action', 'stats');
    if (url) queryParams.set('url', url);

    const response = await fetch(`/api/cache?${queryParams}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get cache stats: ${response.status}`);
    }

    const result = await response.json();
    return result.stats;
  }

  async invalidateCache(url: string, refreshInterval: number = 60) {
    const queryParams = new URLSearchParams();
    queryParams.set('url', url);
    queryParams.set('refreshInterval', refreshInterval.toString());

    const response = await fetch(`/api/cache?${queryParams}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Cache invalidation failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Cache invalidated:', result.message);
    return result;
  }

  async forceRefreshWidget(apiUrl: string, refreshInterval: number) {
    await this.invalidateCache(apiUrl, refreshInterval);
    
    const response = await fetch('/api/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: apiUrl,
        refreshInterval,
        maxAge: refreshInterval * 60,
      }),
    });

    if (!response.ok) {
      throw new Error(`Force refresh failed: ${response.status}`);
    }

    return response.json();
  }
}

export const cacheManager = new CacheManager();

if (typeof window !== 'undefined') {
  setTimeout(() => {
    cacheManager.startPeriodicCleanup(30); 
  }, 5000);

  window.addEventListener('beforeunload', () => {
    cacheManager.stopPeriodicCleanup();
  });
}