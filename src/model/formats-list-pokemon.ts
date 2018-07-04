/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IPokemonFormat } from "./interfaces";

/**
 * Represents a list of formats (Pokemon).
 */
export class PokemonFormatsList {
    public formats: IPokemonFormat[];

    /**
     * Creates a new instance of PokemonFormatsList.
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
