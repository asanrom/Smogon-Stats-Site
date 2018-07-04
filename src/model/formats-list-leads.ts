/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { ILeadsFormat } from "./interfaces";

/**
 * Represents a list of formats (Laeds).
 */
export class LeadsFormatsList {
    public formats: ILeadsFormat[];

    /**
     * Creates a new instance of LeadsFormatsList.
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
