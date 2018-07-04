/**
 * Laeds ranking parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { LeadsRanking } from "../model/ranking-leads";
import { toId } from "../utils/text-utils";

/**
 * Parses a leads ranking file.
 * @param txt   The raw text to parse.
 * @returns     The parsed pokemon ranking.
 */
export function parseLeadsRanking(txt: string): LeadsRanking {
    const result: LeadsRanking = new LeadsRanking(null);
    const lines = txt.split("\n");

    result.totalLeads = parseInt(((lines[0] + "").split(":")[1] + "").trim(), 10);

    for (let i = 4; i < lines.length; i++) {
        const parts = lines[i].split("|");
        if (parts.length === 7) {
            result.leads.push({
                name: toId(parts[2]),
                pos: parseInt(parts[1].trim(), 10),
                raw: parseInt(parts[4].trim(), 10),
                rawp: parseFloat(parts[5].replace("%", "").trim()),
                usage: parseFloat(parts[3].replace("%", "").trim()),
            });
        }
    }

    return result;
}
