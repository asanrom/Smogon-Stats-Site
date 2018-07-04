/**
 * Storage - MongoDB
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Stores data in a MongoDB database.
 */

"use strict";

import * as FS from "fs";
import { MongoClient } from "mongodb";
import * as Path from "path";
import { Config } from "../config";
import { toId } from "../utils/text-utils";
import { IStorage } from "./storage-interface";

const DEFAULT_COLLECTION = "_default";

export class MongoDBStorage implements IStorage {

    /**
     * Reads an stored resource.
     * @param id    The resource identifier.
     * @returns     The resourde value, or null if the resource does not exists.
     */
    public get(id: string): Promise<object> {
        return new Promise((resolve) => {
            const idParts = this.getIdParts(id);
            let collection: string;
            let key: string;
            if (idParts.length >= 2) {
                key = idParts[idParts.length - 1];
                collection = idParts.slice(0, idParts.length - 1).join(".");
            } else {
                key = idParts[0];
                collection = DEFAULT_COLLECTION;
            }
            MongoClient.connect(Config.mongoURL, Config.mongoOptions, (err, db) => {
                if (err) {
                    db.close();
                    return resolve(null);
                }
                db.db().collection(collection).findOne({ key }, (err1, result) => {
                    db.close();
                    if (err1) {
                        return resolve(null);
                    }
                    resolve(result.value);
                });
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
            const idParts = this.getIdParts(id);
            let collection: string;
            let key: string;
            if (idParts.length >= 2) {
                key = idParts[idParts.length - 1];
                collection = idParts.slice(0, idParts.length - 1).join(".");
            } else {
                key = idParts[0];
                collection = DEFAULT_COLLECTION;
            }
            MongoClient.connect(Config.mongoURL, Config.mongoOptions, (err, db) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                db.db().createCollection(collection, () => {
                    db.db().collection(collection).updateOne({ key }, { key, value }, (err1) => {
                        if (err1) {
                            db.db().collection(collection).insertOne({ key, value }, (err2) => {
                                db.close();
                                if (err2) {
                                    reject(err2);
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            db.close();
                            resolve();
                        }
                    });
                });
            });
        });
    }

    /**
     * Removes a resource.
     * @param id    The resource identifier to remove.
     */
    public remove(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const idParts = this.getIdParts(id);
            let collection: string;
            let key: string;
            if (idParts.length >= 2) {
                key = idParts[idParts.length - 1];
                collection = idParts.slice(0, idParts.length - 1).join(".");
            } else {
                key = idParts[0];
                collection = DEFAULT_COLLECTION;
            }
            MongoClient.connect(Config.mongoURL, Config.mongoOptions, (err, db) => {
                if (err) {
                    return reject(err);
                }
                db.db().collection(collection).deleteOne({ key }, (err1) => {
                    db.close();
                    if (err1) {
                        reject(err1);
                    } else {
                        resolve();
                    }
                });
            });
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
        return idParts;
    }
}
