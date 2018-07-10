/**
 * Usage data tables parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { AbilitiesRanking } from "../model/ranking-abilities";
import { ItemsRanking } from "../model/ranking-items";
import { MovesRanking } from "../model/ranking-moves";
import { toId } from "../utils/text-utils";

/**
 * Extracts the moves ranking from a json data file.
 * @param json  JSON data to parse.
 * @returns     The moves ranking.
 */
export function extractMovesRanking(json: any): MovesRanking {
    const ranking: MovesRanking = new MovesRanking(null);
    const movesRanking = {};
    let totalMoves = 0;

    if (typeof json === "object" && typeof json.data === "object") {
        Object.values(json.data).forEach((pokemonData: any) => {
            if (typeof pokemonData === "object" && typeof pokemonData.Moves === "object") {
                const moves = pokemonData.Moves;
                for (const move in moves) {
                    if (moves.hasOwnProperty(move)) {
                        const moveId = toId(move);
                        const count = moves[move];
                        totalMoves += count;
                        if (!movesRanking[moveId]) {
                            movesRanking[moveId] = count;
                        } else {
                            movesRanking[moveId] += count;
                        }
                    }
                }
            }
        });
    }

    ranking.totalMoves = totalMoves;
    for (const move in movesRanking) {
        if (move && movesRanking.hasOwnProperty(move)) {
            const raw = movesRanking[move];
            ranking.moves.push({
                name: move,
                pos: 0,
                raw,
                usage: (raw * 100 / totalMoves),
            });
        }
    }

    ranking.moves.sort((a, b) => {
        if (a.usage < b.usage) {
            return 1;
        } else if (a.usage > b.usage) {
            return -1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    let pos = 0;
    for (const move of ranking.moves) {
        pos++;
        move.pos = pos;
    }

    return ranking;
}

/**
 * Extracts the items ranking from a json data file.
 * @param json  JSON data to parse.
 * @returns     The items ranking.
 */
export function extractItemsRanking(json: any): ItemsRanking {
    const ranking: ItemsRanking = new ItemsRanking(null);
    const itemsRanking = {};
    let totalItems = 0;

    if (typeof json === "object" && typeof json.data === "object") {
        Object.values(json.data).forEach((pokemonData: any) => {
            if (typeof pokemonData === "object" && typeof pokemonData.Items === "object") {
                const items = pokemonData.Items;
                for (const item in items) {
                    if (item && items.hasOwnProperty(item)) {
                        const itemId = toId(item);
                        const count = items[item];
                        totalItems += count;
                        if (!itemsRanking[itemId]) {
                            itemsRanking[itemId] = count;
                        } else {
                            itemsRanking[itemId] += count;
                        }
                    }
                }
            }
        });
    }

    ranking.totalItems = totalItems;
    for (const item in itemsRanking) {
        if (itemsRanking.hasOwnProperty(item)) {
            const raw = itemsRanking[item];
            ranking.items.push({
                name: item,
                pos: 0,
                raw,
                usage: (raw * 100 / totalItems),
            });
        }
    }

    ranking.items.sort((a, b) => {
        if (a.usage < b.usage) {
            return 1;
        } else if (a.usage > b.usage) {
            return -1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    let pos = 0;
    for (const item of ranking.items) {
        pos++;
        item.pos = pos;
    }

    return ranking;
}

/**
 * Extracts the abilities ranking from a json data file.
 * @param json  JSON data to parse.
 * @returns     The abilities ranking.
 */
export function extractAbilitiesRanking(json: any): AbilitiesRanking {
    const ranking: AbilitiesRanking = new AbilitiesRanking(null);
    const abilitiesRanking = {};
    let totalAbilities = 0;

    if (typeof json === "object" && typeof json.data === "object") {
        Object.values(json.data).forEach((pokemonData: any) => {
            if (typeof pokemonData === "object" && typeof pokemonData.Abilities === "object") {
                const abilities = pokemonData.Abilities;
                for (const ability in abilities) {
                    if (ability && abilities.hasOwnProperty(ability)) {
                        const abilityId = toId(ability);
                        const count = abilities[ability];
                        totalAbilities += count;
                        if (!abilitiesRanking[abilityId]) {
                            abilitiesRanking[abilityId] = count;
                        } else {
                            abilitiesRanking[abilityId] += count;
                        }
                    }
                }
            }
        });
    }

    ranking.totalAbilities = totalAbilities;
    for (const ability in abilitiesRanking) {
        if (abilitiesRanking.hasOwnProperty(ability)) {
            const raw = abilitiesRanking[ability];
            ranking.abilities.push({
                name: ability,
                pos: 0,
                raw,
                usage: (raw * 100 / totalAbilities),
            });
        }
    }

    ranking.abilities.sort((a, b) => {
        if (a.usage < b.usage) {
            return 1;
        } else if (a.usage > b.usage) {
            return -1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    let pos = 0;
    for (const ability of ranking.abilities) {
        pos++;
        ability.pos = pos;
    }

    return ranking;
}
