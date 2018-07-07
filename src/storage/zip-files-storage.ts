/**
 * Storage - JSON Files
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Stores data in JSON files using the local filesystem.
 */

"use strict";

import * as AdmZip from "adm-zip";
import * as FS from "fs";
import * as Path from "path";
import { Config } from "../config";
import { toId } from "../utils/text-utils";
import { IStorage } from "./storage-interface";

/**
 * Represents the location of a file.
 */
interface IZipLocation {
    dirs: string[];
    zipFile: string;
    subFile: string;
}

/**
 * Represents an storage system for usage stats based in
 * JSON files stored into the local filesystem.
 */
export class ZIPStorage implements IStorage {
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
            const location = this.getLocation(id);
            FS.exists(location.zipFile, (exits) => {
                if (exits) {
                    try {
                        const zip = new AdmZip(location.zipFile);
                        if (zip.getEntry(location.subFile) !== null) {
                            zip.readAsTextAsync(location.subFile, (data) => {
                                try {
                                    resolve(JSON.parse(data));
                                } catch (err) {
                                    resolve(null);
                                }
                            });
                        } else {
                            resolve(null);
                        }
                    } catch (err) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Stores a resource.
     * @param id    The resource identifier.
     * @param value The resource value to set.
     */
    public put(id: string, value: object): Promise<void> {
        return new Promise((resolve, reject) => {
            const location = this.getLocation(id);
            this.mkDirs(location.dirs);
            FS.exists(location.zipFile, (exits) => {
                if (!exits) {
                    const zip = new AdmZip();
                    zip.writeZip(location.zipFile);
                }
                try {
                    const zip = new AdmZip(location.zipFile);
                    if (zip.getEntry(location.subFile)) {
                        zip.deleteFile(location.subFile);
                    }
                    zip.addFile(location.subFile, Buffer.from(JSON.stringify(value)));
                    zip.writeZip(location.zipFile);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * Removes a resource.
     * @param id    The resource identifier to remove.
     */
    public remove(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const location = this.getLocation(id);
            FS.exists(location.zipFile, (exits) => {
                if (!exits) {
                    resolve();
                    return;
                }
                try {
                    const zip = new AdmZip(location.zipFile);
                    if (zip.getEntry(location.subFile)) {
                        zip.deleteFile(location.subFile);
                        zip.writeZip(location.zipFile);
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private getLocation(id: string): IZipLocation {
        const res = {
            dirs: [],
            subFile: "default",
            zipFile: "default.zip",
        };
        const parts = this.getIdParts(id);
        if (parts.length > 1) {
            if (parts.length === 2) {
                res.zipFile = parts[0] + ".zip";
                res.subFile = parts[1] + ".json";
            } else if (parts.length === 3) {
                res.dirs.push(parts[0]);
                res.zipFile = parts[1] + ".zip";
                res.subFile = parts[2] + ".json";
            } else {
                for (let i = 0; i < parts.length - 2; i++) {
                    res.dirs.push(parts[i]);
                }
                res.zipFile = parts[parts.length - 2] + ".zip";
                res.subFile = parts[parts.length - 1] + ".json";
            }
        } else if (parts.length === 1) {
            res.subFile = parts[0] + ".json";
        }
        res.zipFile = this.getPath(res.dirs, res.zipFile);
        return res;
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
        return idParts;
    }

    private getPath(dirs: string[], zipFile: string): string {
        let path = this.storagePath;
        for (const part of dirs) {
            path = Path.resolve(path, part);
        }
        path = Path.resolve(path, zipFile);
        return path;
    }

    private mkDirs(dirs: string[]) {
        let path = this.storagePath;
        for (const dir of dirs) {
            path = Path.resolve(path, dir);
            if (!FS.existsSync(path)) {
                FS.mkdirSync(path);
            }
        }
    }
}
