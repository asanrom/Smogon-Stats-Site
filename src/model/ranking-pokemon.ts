/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IPokemonUsage } from "./interfaces";

/**
 * Represents a pokemon usage ranking.
 */
export class PokemonRanking {
    public pokemon: IPokemonUsage[];
    public totalBattles: number;
    public avgWeightTeam: number;

    /**
     * Creates a new instance of PokemonRanking.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.pokemon = data.pokemon || [];
            this.totalBattles = data.totalBattles || 0;
            this.avgWeightTeam = data.avgWeightTeam || 0;
        } else {
            this.pokemon = [];
            this.avgWeightTeam = 0;
            this.totalBattles = 0;
        }
    }
}
