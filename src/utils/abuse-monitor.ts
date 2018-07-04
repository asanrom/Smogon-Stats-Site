/**
 * Abuse Monitor
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * A tool to avoid potential DoS or command flood.
 */

"use strict";

import * as EventEmitter from "events";

/**
 * Represents an abuse monitor.
 */
export class AbuseMonitor extends EventEmitter {
    private usage: { [s: string]: number };
    private times: { [s: string]: number };
    private locked: { [s: string]: { time: number } };
    private maxFlood: number;
    private intervalFlood: number;
    private expireTime: number;

    /**
     * Creates a new instance of AbuseMonitor.
     * @param maxFlood          Max number of hits.
     * @param intervalFlood     Interval of time.
     * @param expireTime        Expiration time for locks.
     */
    constructor(maxFlood: number, intervalFlood: number, expireTime?: number) {
        super();
        this.usage = {};
        this.times = {};
        this.locked = {};
        this.maxFlood = maxFlood;
        this.intervalFlood = intervalFlood;
        this.expireTime = expireTime || 0;
    }

    /**
     * Checks if an user is locked.
     * @param user  The user to check.
     * @returns     The true value if the user is locked, false otherwise.
     */
    public isLocked(user: string) {
        if (this.expireTime) {
            for (const u in this.locked) {
                if (Date.now() - this.locked[u].time > this.expireTime) {
                    delete this.locked[u];
                    this.emit("unlock", u);
                }
            }
        }
        return !!this.locked[user];
    }

    /**
     * Locks an user.
     * @param user      User to lock.
     * @param reason    Reason for locking.
     */
    public lock(user: string, reason: string) {
        this.locked[user] = { time: Date.now() };
        this.emit("lock", user, reason);
    }

    /**
     * Unlocks an user.
     * @param user  User to unlock.
     */
    public unlock(user) {
        delete this.locked[user];
        this.emit("unlock", user);
    }

    public count(user) {
        const now = Date.now();
        if (!this.times[user]) {
            this.usage[user] = 1;
            this.times[user] = now;
            return false;
        }
        const duration = now - this.times[user];
        if (user in this.usage && duration < this.intervalFlood) {
            this.usage[user]++;
            if (this.usage[user] >= this.maxFlood) {
                this.lock(user, "User " + user + " has been locked (flood: " + this.usage[user] +
                    " hits in the last " + (duration / 1000) + " seconds)");
                return true;
            }
        } else {
            this.usage[user] = 1;
            this.times[user] = now;
        }
        return false;
    }
}
