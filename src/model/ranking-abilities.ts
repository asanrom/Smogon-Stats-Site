/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IAbilityUsage } from "./interfaces";

/**
 * Represents an abilities usage ranking.
 */
export class AbilitiesRanking {
    public abilities: IAbilityUsage[];
    public totalAbilities: number;

    /**
     * Creates a new instance of AbilitiesRanking.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.abilities = data.abilities || [];
            this.totalAbilities = data.totalAbilities || 0;
        } else {
            this.abilities = [];
            this.totalAbilities = 0;
        }
    }
}
