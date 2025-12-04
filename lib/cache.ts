import NodeCache from "node-cache";

interface CacheEntry {
  data: any;
  timestamp: number;
  lastSuccessTimestamp: number;
  refreshInterval: number; 
  url: string;
  isStale?: boolean;
  fetchCount: number;
  lastError?: string;
}

interface CacheOptions {
  refreshInterval?: number;
  maxAge?: number;
  gracePeriod?: number; 
}

class IntelligentCache {
  private cache: NodeCache;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {

    this.cache = new NodeCache({
      stdTTL: 0,
      checkperiod: 0, 
    });
  }

  private generateKey(url: string, options?: CacheOptions): string {
    return `cache:${url}`;
  }

  private isDataFresh(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000; 
    return age < entry.refreshInterval;
  }

  private isDataValid(entry: CacheEntry, options?: CacheOptions): boolean {
    const now = Date.now();
    const maxAge = options?.maxAge || 3600; 
    const age = (now - entry.timestamp) / 1000;
    return age < maxAge;
  }

  private shouldAttemptFetch(entry: CacheEntry): boolean {
    const now = Date.now();
    const timeSinceLastFetch = (now - entry.timestamp) / 1000;
    const timeSinceLastSuccess = (now - entry.lastSuccessTimestamp) / 1000;

    const minRetryInterval = Math.min(30, entry.refreshInterval / 2);
    if (timeSinceLastFetch < minRetryInterval) {
      return false;
    }

    if (timeSinceLastSuccess >= entry.refreshInterval) {
      return true;
    }

    return false;
  }

  async get(url: string, options?: CacheOptions): Promise<{ data: any; cached: boolean; stale?: boolean; fromFallback?: boolean }> {
    const key = this.generateKey(url, options);
    const entry = this.cache.get<CacheEntry>(key);

    if (!entry) {
      const data = await this.fetch(url, options);
      return { data, cached: false };
    }

    if (this.isDataFresh(entry)) {
      return { data: entry.data, cached: true };
    }

    if (this.shouldAttemptFetch(entry)) {

        const pendingRequest = this.pendingRequests.get(key);
      if (pendingRequest) {
        try {
          const freshData = await pendingRequest;
          return { data: freshData, cached: false };
        } catch {

            if (this.isDataValid(entry, options)) {
            return { data: entry.data, cached: true, stale: true, fromFallback: true };
          }
          throw new Error('No valid data available');
        }
      }

      try {
        const freshData = await this.fetch(url, options);
        return { data: freshData, cached: false };
      } catch (error) {

        if (this.isDataValid(entry, options)) {
          console.warn(`API fetch failed for ${url}, using stale data:`, error);
          return { data: entry.data, cached: true, stale: true, fromFallback: true };
        }
        throw error;
      }
    }

    if (this.isDataValid(entry, options)) {
      return { data: entry.data, cached: true, stale: true };
    }

    throw new Error('Cached data expired and fetch not attempted');
  }

  private async fetch(url: string, options?: CacheOptions): Promise<any> {
    const key = this.generateKey(url, options);
    
    const existingPromise = this.pendingRequests.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const fetchPromise = this.performFetch(url, options);
    this.pendingRequests.set(key, fetchPromise);

    try {
      const data = await fetchPromise;
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async performFetch(url: string, options?: CacheOptions): Promise<any> {
    const key = this.generateKey(url, options);
    const now = Date.now();
    const refreshInterval = options?.refreshInterval || 60;

    const axios = (await import('axios')).default;
    
    const response = await axios({
      url,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'FinBoard/1.0',
      }
    });

    const data = response.data;

    const existingEntry = this.cache.get<CacheEntry>(key);
    const newEntry: CacheEntry = {
      data,
      timestamp: now,
      lastSuccessTimestamp: now,
      refreshInterval,
      url,
      fetchCount: (existingEntry?.fetchCount || 0) + 1,
    };

    this.cache.set(key, newEntry);
    return data;
  }

  invalidate(url: string, options?: CacheOptions): void {
    const key = this.generateKey(url, options);
    this.cache.del(key);
  }

  getStats(url?: string): any {
    if (url) {
      const keys = this.cache.keys().filter(k => k.startsWith(url));
      return keys.map(key => {
        const entry = this.cache.get<CacheEntry>(key);
        if (entry) {
          return {
            url: entry.url,
            age: (Date.now() - entry.timestamp) / 1000,
            fresh: this.isDataFresh(entry),
            fetchCount: entry.fetchCount,
          };
        }
      }).filter(Boolean);
    }

    return {
      totalEntries: this.cache.keys().length,
      entries: this.cache.keys().map(key => {
        const entry = this.cache.get<CacheEntry>(key);
        if (entry) {
          return {
            url: entry.url,
            age: (Date.now() - entry.timestamp) / 1000,
            fresh: this.isDataFresh(entry),
            fetchCount: entry.fetchCount,
          };
        }
      }).filter(Boolean)
    };
  }

  cleanup(maxAge = 3600): void {
    const now = Date.now();
    const keys = this.cache.keys();
    
    keys.forEach(key => {
      const entry = this.cache.get<CacheEntry>(key);
      if (entry) {
        const age = (now - entry.lastSuccessTimestamp) / 1000;
        if (age > maxAge) {
          this.cache.del(key);
        }
      }
    });
  }
}

export const intelligentCache = new IntelligentCache();

export const apiCache = new NodeCache({
  stdTTL: 30,
  checkperiod: 60,
});