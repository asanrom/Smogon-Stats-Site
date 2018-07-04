/**
 * Pokemon ranking parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { PokemonRanking } from "../model/ranking-pokemon";
import { toId } from "../utils/text-utils";

/**
 * Parses a pokemon ranking file.
 * @param txt   The raw text to parse.
 * @returns     The parsed pokemon ranking.
 */
export function parsePokemonRanking(txt: string): PokemonRanking {
    const result: PokemonRanking = new PokemonRanking(null);
    const lines = txt.split("\n");

    result.totalBattles = parseInt(((lines[0] + "").split(":")[1] + "").trim(), 10);
    result.avgWeightTeam = parseFloat(((lines[1] + "").split(":")[1] + "").trim());

    for (let i = 5; i < lines.length; i++) {
        const parts = lines[i].split("|");
        if (parts.length === 9) {
            result.pokemon.push({
                name: toId(parts[2]),
                pos: parseInt(parts[1].trim(), 10),
                raw: parseInt(parts[4].trim(), 10),
                rawp: parseFloat(parts[5].replace("%", "").trim()),
                real: parseInt(parts[6].trim(), 10),
                realp: parseFloat(parts[7].replace("%", "").trim()),
                usage: parseFloat(parts[3].replace("%", "").trim()),
            });
        }
    }

    return result;
}
