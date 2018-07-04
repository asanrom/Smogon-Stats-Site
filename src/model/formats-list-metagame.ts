/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IMetagameFormat } from "./interfaces";

/**
 * Represents a list of formats (Metagame).
 */
export class MetagameFormatsList {
    public formats: IMetagameFormat[];

    /**
     * Creates a new instance of MetagameFormatsList.
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
