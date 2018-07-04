/**
 * Storage - JSON Files
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Stores data in JSON files using the local filesystem.
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";
import { Config } from "../config";
import { toId } from "../utils/text-utils";
import { IStorage } from "./storage-interface";

/**
 * Represents an storage system for usage stats based in
 * JSON files stored into the local filesystem.
 */
export class JSONStorage implements IStorage {
    private storagePath: string;

    /**
     * Creates a new instance of JSONStorage.
     */
    constructor() {
        this.storagePath = Config.storagePath;
        if (!FS.existsSync(this.storagePath)) {
            FS.mkdirSync(this.storagePath);
        }
    }

    /**
     * Reads an stored resource.
     * @param id    The resource identifier.
     * @returns     The resourde value, or null if the resource does not exists.
     */
    public get(id: string): Promise<object> {
        return new Promise((resolve) => {
            const idParts = this.getIdParts(id);
            if (idParts.length > 0) {
                const file = this.getPath(idParts);
                FS.readFile(file, (err, data) => {
                    if (err) {
                        resolve(null);
                    } else {
                        try {
                            resolve(JSON.parse(data.toString()));
                        } catch (err1) {
                            resolve(null);
                        }
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    /**
     * Stores a resource.
     * @param id    The resource identifier.
     * @param value The resource value to set.
     */
    public put(id: string, value: object): Promise<void> {
        return new Promise((resolve, reject) => {
            const idParts = this.getIdParts(id);
            if (idParts.length > 0) {
                const file = this.getPath(idParts);
                this.mkDirs(idParts);
                FS.writeFile(file, JSON.stringify(value), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }

    /**
     * Removes a resource.
     * @param id    The resource identifier to remove.
     */
    public remove(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const idParts = this.getIdParts(id);
            if (idParts.length > 0) {
                const file = this.getPath(idParts);
                FS.unlink(file, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }

    private getIdParts(id: string): string[] {
        const idParts: string[] = [];
        const parts = id.split(".");
        for (let part of parts) {
            part = toId(part);
            if (part.length > 0) {
                idParts.push(part);
            }
        }
        if (idParts.length > 0) {
            idParts[idParts.length - 1] = idParts[idParts.length - 1] + ".json";
        }
        return idParts;
    }

    private getPath(idParts: string[]): string {
        let path = this.storagePath;
        for (const part of idParts) {
            path = Path.resolve(path, part);
        }
        return path;
    }

    private mkDirs(idParts: string[]) {
        let path = this.storagePath;
        for (let i = 0; i < idParts.length - 1; i++) {
            path = Path.resolve(path, idParts[i]);
            if (!FS.existsSync(path)) {
                FS.mkdirSync(path);
            }
        }
    }
}
