/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IPokemonCount } from "./interfaces";

/**
 * Represents the usage data of an item.
 */
export class ItemData {
    public pokemonCount: IPokemonCount[];
    public name: string;

    /**
     * Creates a new instance of ItemData.
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
