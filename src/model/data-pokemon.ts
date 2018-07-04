/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import {
    ICounterUsage, IMinUsage, ISpreadUsage,
} from "./interfaces";

/**
 * Represents the usage data of a pokemon.
 */
export class PokemonData {
    public name: string;
    public raw: number;
    public avgWeight: number;
    public viability: number;
    public moves: IMinUsage[];
    public items: IMinUsage[];
    public abilities: IMinUsage[];
    public spreads: ISpreadUsage[];
    public teammates: IMinUsage[];
    public counters: ICounterUsage[];

    /**
     * Creates a new instance of PokemonData.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.name = data.name || name;
            this.raw = data.raw || 0;
            this.avgWeight = data.avgWeight || 0;
            this.viability = data.viability || 0;
            this.moves = data.moves || [];
            this.items = data.items || [];
            this.abilities = data.abilities || [];
            this.spreads = data.spreads || [];
            this.teammates = data.teammates || [];
            this.counters = data.counters || [];
        } else {
            this.name = "";
            this.raw = 0;
            this.avgWeight = 0;
            this.viability = 0;
            this.moves = [];
            this.items = [];
            this.abilities = [];
            this.spreads = [];
            this.teammates = [];
            this.counters = [];
        }
    }
}
