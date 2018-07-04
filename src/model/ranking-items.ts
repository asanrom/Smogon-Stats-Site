/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IItemUsage } from "./interfaces";

/**
 * Represents an items usage ranking.
 */
export class ItemsRanking {
    public items: IItemUsage[];
    public totalItems: number;

    /**
     * Creates a new instance of ItemsRanking.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.items = data.items || [];
            this.totalItems = data.totalItems || 0;
        } else {
            this.items = [];
            this.totalItems = 0;
        }
    }
}
