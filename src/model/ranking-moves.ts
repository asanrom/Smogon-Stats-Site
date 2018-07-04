/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IMoveUsage } from "./interfaces";

/**
 * Represents a moves usage ranking.
 */
export class MovesRanking {
    public moves: IMoveUsage[];
    public totalMoves: number;

    /**
     * Creates a new instance of MovesRanking.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.moves = data.moves || [];
            this.totalMoves = data.totalMoves || 0;
        } else {
            this.moves = [];
            this.totalMoves = 0;
        }
    }
}
