/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IAbilitiesFormat } from "./interfaces";

/**
 * Represents a list of formats (Abilities).
 */
export class AbilitiesFormatsList {
    public formats: IAbilitiesFormat[];

    /**
     * Creates a new instance of AbilitiesFormatsList.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.formats = data.formats || [];
        } else {
            this.formats = [];
        }
    }
}
