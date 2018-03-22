import * as memoryCache from "memory-cache";

export class MemoryCache {

    private internalCache = new memoryCache.Cache();

    constructor() {
    }

    public put(key: string, value: any, timeoutMs?: number): void {
        this.internalCache.put(key, value, timeoutMs);
    }

    public get(key: string): any {
        return this.internalCache.get(key);
    }

    public del(key: string): void {
        this.internalCache.del(key);
    }

    public clear(): void {
        this.internalCache.clear();
    }
}

class _CacheManager {
    private caches: { [namespace: string]: MemoryCache } = {};

    public for(namespace: string): MemoryCache {
        let cache = this.caches[namespace];
        if (!cache) {
            cache = this.caches[namespace] = new MemoryCache();
        }

        return cache;
    }
}

export const Cache = new _CacheManager();

export const CACHE_INTEGRATIONS = "integrations";
export const CACHE_NEB = "neb";
export const CACHE_UPSTREAM = "upstream";
export const CACHE_SCALAR_ACCOUNTS = "scalar-accounts";
export const CACHE_WIDGET_TITLES = "widget-titles";
export const CACHE_FEDERATION = "federation";