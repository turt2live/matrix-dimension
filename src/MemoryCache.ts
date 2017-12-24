import * as cache from "memory-cache";

export class MemoryCache {

    private internalCache = new cache.Cache();

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