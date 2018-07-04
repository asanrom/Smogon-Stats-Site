/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IPlayStyle, IStallBar } from "./interfaces";

/**
 * Format metagame information.
 */
export class FormatMetagame {
    public meanStalliness: number;
    public graph: IStallBar[];
    public playstyles: IPlayStyle[];

    /**
     * Creates a new instance of FormatMetagame.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.meanStalliness = data.meanStalliness || 0;
            this.graph = data.graph || [];
            this.playstyles = data.playstyles || [];
        } else {
            this.meanStalliness = 0;
            this.graph = [];
            this.playstyles = [];
        }
    }
}
