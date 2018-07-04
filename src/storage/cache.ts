/**
 * Storage cache.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Stores in memory cached resources.
 */

"use strict";

interface ICacheEntry {
    lastTimeUsed: number;
    value: any;
}

/**
 * Represents a cache.
 * Stores in memory cached resources.
 */
export class Cache {

    private data: Map<string, ICacheEntry>;
    private capacity: number;

    /**
     * Creates a new instance of Cache.
     * @param capacity Capacity of the cache.
     */
    constructor(capacity: number) {
        this.data = new Map();
        this.capacity = capacity;
    }

    /**
     * Checks if the cache has a resource.
     * @param key   The key of the resource.
     * @returns     The true value if the cache has the resource, false otherwise.
     */
    public has(key: string): boolean {
        return this.data.has(key);
    }

    /**
     * Obtains a resource from the cache.
     * @param key   The key of the resource.
     * @returns     The requested resource.
     */
    public get(key: string): any {
        const entry = this.data.get(key);
        if (entry) {
            entry.lastTimeUsed = Date.now();
            return entry.value;
        } else {
            return null;
        }
    }

    /**
     * Adds a resource to the cache.
     * @param key    The key of the resource.
     * @param value  The value of the resource.
     */
    public put(key: string, value: any) {
        const entry = {
            lastTimeUsed: Date.now(),
            value,
        };
        this.data.set(key, entry);
        if (this.data.size > this.capacity) {
            this.removeLeastUsed();
        }
    }

    /**
     * Clears the cache.
     */
    public clear() {
        this.data.clear();
    }

    /**
     * Removes a resource from the cache.
     * @param key   The key of the resource.
     */
    public remove(key: string) {
        this.data.delete(key);
    }

    private removeLeastUsed() {
        let toRemove = null;
        let leastUsed = Date.now() + 1;
        this.data.forEach((value, key) => {
            if (leastUsed > value.lastTimeUsed) {
                leastUsed = value.lastTimeUsed;
                toRemove = key;
            }
        });
        if (toRemove !== null) {
            this.data.delete(toRemove);
        }
    }
}
