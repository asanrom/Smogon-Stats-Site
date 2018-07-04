/**
 * Storage system.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Stores application data.
 */

"use strict";

import { Config } from "../config";
import { Logger } from "../utils/logs";
import { toId } from "../utils/text-utils";
import { Cache } from "./cache";
import { JSONStorage } from "./json-files-storage";
import { MongoDBStorage } from "./mongodb-storage";
import { IStorage } from "./storage-interface";
import { ZIPStorage } from "./zip-files-storage";

const CACHE_CAPACITY = 64;

/**
 * Storage system.
 */
export class Storage {
    public static storage: IStorage;
    public static cache: Cache;

    /**
     * Initializes the storage system.
     */
    public static init() {
        Storage.cache = new Cache(CACHE_CAPACITY);
        switch (toId(Config.storageMode)) {
            case "json":
                Storage.storage = new JSONStorage();
                break;
            case "zip":
                Storage.storage = new ZIPStorage();
                break;
            case "mongo":
            case "mongodb":
                Storage.storage = new MongoDBStorage();
                break;
            default:
                Storage.storage = new JSONStorage();
                Logger.getInstance().warning("Unknown storage mode, using JSON mode as default.");
        }
    }

    /**
     * Reads an stored resource.
     * @param id    The resource identifier.
     * @returns     The resourde value, or null if the resource does not exists.
     */
    public static get(id: string): Promise<any> {
        if (Storage.cache.has(id)) {
            return Promise.resolve(Storage.cache.get(id));
        } else {
            return new Promise((resolve) => {
                Storage.storage.get(id).then((resource) => {
                    Storage.cache.put(id, resource);
                    resolve(resource);
                }).catch((err) => {
                    resolve(null);
                });
            });
        }
    }

    /**
     * Stores a resource.
     * @param id    The resource identifier.
     * @param value The resource value to set.
     */
    public static put(id: string, value: object): Promise<void> {
        Storage.cache.put(id, value);
        return Storage.storage.put(id, value);
    }

    /**
     * Removes a resource.
     * @param id    The resource identifier to remove.
     */
    public static remove(id: string): Promise<void> {
        Storage.cache.put(id, null);
        return Storage.storage.remove(id);
    }
}

Storage.init();
