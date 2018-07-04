/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IItemsFormat } from "./interfaces";

/**
 * Represents a list of formats (Items).
 */
export class ItemsFormatsList {
    public formats: IItemsFormat[];

    /**
     * Creates a new instance of ItemsFormatsList.
     * @param data Input data
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.formats = data.formats || [];
        } else {
            this.formats = [];
        }
    }
}
