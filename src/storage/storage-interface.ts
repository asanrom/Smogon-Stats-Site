/**
 * Storage interface
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

/**
 * Represents any storage system.
 */
export interface IStorage {
    /**
     * Reads an stored resource.
     * @param id    The resource identifier.
     * @returns     The resourde value, or null if the resource does not exists.
     */
    get(id: string): Promise<object>;

    /**
     * Stores a resource.
     * @param id    The resource identifier.
     * @param value The resource value to set.
     */
    put(id: string, value: object): Promise<void>;

    /**
     * Removes a resource.
     * @param id    The resource identifier to remove.
     */
    remove(id: string): Promise<void>;
}
