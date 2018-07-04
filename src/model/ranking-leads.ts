/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { ILeadUsage } from "./interfaces";

/**
 * Represents a leads usage ranking.
 */
export class LeadsRanking {
    public totalLeads: number;
    public leads: ILeadUsage[];

    /**
     * Creates a new instance of LeadsRanking.
     * @param data Input data.
     */
    constructor(data: any) {
        if (typeof data === "object" && data !== null) {
            this.leads = data.leads || [];
            this.totalLeads = data.totalLeads || 0;
        } else {
            this.leads = [];
            this.totalLeads = 0;
        }
    }
}
