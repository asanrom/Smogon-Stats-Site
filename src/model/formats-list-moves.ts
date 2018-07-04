/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IMovesFormat } from "./interfaces";

/**
 * Represents a list of formats (Moves).
 */
export class MovesFormatsList {
    public formats: IMovesFormat[];

    /**
     * Creates a new instance of MovesFormatsList.
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
