/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IPokemonCount } from "./interfaces";

/**
 * Represents the usage data of a move.
 */
export class MoveData {
    public name: string;
    public pokemonCount: IPokemonCount[];

    /**
     * Creates a new instance of MoveData.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.pokemonCount = data.pokemonCount || [];
            this.name = data.name || "";
        } else {
            this.pokemonCount = [];
            this.name = "";
        }
    }
}
