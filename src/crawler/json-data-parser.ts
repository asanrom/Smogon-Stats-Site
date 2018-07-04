/**
 * Usage data tables parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { AbilityData } from "../model/data-ability";
import { ItemData } from "../model/data-item";
import { MoveData } from "../model/data-move";
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
                        totalMoves++;
                        const moveId = toId(move);
                        const count = moves[move];
                        if (!movesRanking[moveId]) {
                            movesRanking[moveId] = 1;
                        } else {
                            movesRanking[moveId]++;
                        }
                    }
                }
            }
        });
    }

    ranking.totalMoves = totalMoves;
    for (const move in movesRanking) {
        if (movesRanking.hasOwnProperty(move)) {
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
                    if (items.hasOwnProperty(item)) {
                        totalItems++;
                        const itemId = toId(item);
                        const count = items[item];
                        if (!itemsRanking[itemId]) {
                            itemsRanking[itemId] = 1;
                        } else {
                            itemsRanking[itemId]++;
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
    for (const move of ranking.items) {
        pos++;
        move.pos = pos;
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
                    if (abilities.hasOwnProperty(ability)) {
                        totalAbilities++;
                        const abilityId = toId(ability);
                        const count = abilities[ability];
                        if (!abilitiesRanking[abilityId]) {
                            abilitiesRanking[abilityId] = 1;
                        } else {
                            abilitiesRanking[abilityId]++;
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
    for (const move of ranking.abilities) {
        pos++;
        move.pos = pos;
    }

    return ranking;
}

/**
 * Extracts the usage data for the moves.
 * @param json      JSON data to parse.
 * @returns         The extracted usage data.
 */
export function extractMoveUsageData(json: any): MoveData[] {
    const data: { [s: string]: MoveData } = {};

    if (typeof json === "object" && typeof json.data === "object") {
        for (const pokemon in json.data) {
            if (json.data.hasOwnProperty(pokemon)) {
                const pokeId = toId(pokemon);
                const pokemonData = json.data[pokemon];
                if (typeof pokemonData === "object" && typeof pokemonData.Moves === "object") {
                    const moves = pokemonData.Moves;
                    for (const move in moves) {
                        if (moves.hasOwnProperty(move)) {
                            const moveId = toId(move);
                            const count = moves[move];
                            if (!data[moveId]) {
                                data[moveId] = new MoveData(null);
                                data[moveId].name = moveId;
                            }
                            data[moveId].pokemonCount.push({
                                count,
                                name: pokeId,
                            });
                        }
                    }
                }
            }
        }
    }

    return Object.values(data);
}

/**
 * Extracts the usage data for the items.
 * @param json      JSON data to parse.
 * @returns         The extracted usage data.
 */
export function extractItemUsageData(json: any): ItemData[] {
    const data: { [s: string]: ItemData } = {};

    if (typeof json === "object" && typeof json.data === "object") {
        for (const pokemon in json.data) {
            if (json.data.hasOwnProperty(pokemon)) {
                const pokeId = toId(pokemon);
                const pokemonData = json.data[pokemon];
                if (typeof pokemonData === "object" && typeof pokemonData.Items === "object") {
                    const items = pokemonData.Items;
                    for (const item in items) {
                        if (items.hasOwnProperty(item)) {
                            const itemId = toId(item);
                            const count = items[item];
                            if (!data[itemId]) {
                                data[itemId] = new MoveData(null);
                                data[itemId].name = itemId;
                            }
                            data[itemId].pokemonCount.push({
                                count,
                                name: pokeId,
                            });
                        }
                    }
                }
            }
        }
    }

    return Object.values(data);
}

/**
 * Extracts the usage data for the abilities.
 * @param json      JSON data to parse.
 * @returns         The extracted usage data.
 */
export function extractAbilityUsageData(json: any): AbilityData[] {
    const data: { [s: string]: AbilityData } = {};

    if (typeof json === "object" && typeof json.data === "object") {
        for (const pokemon in json.data) {
            if (json.data.hasOwnProperty(pokemon)) {
                const pokeId = toId(pokemon);
                const pokemonData = json.data[pokemon];
                if (typeof pokemonData === "object" && typeof pokemonData.Abilities === "object") {
                    const abilities = pokemonData.Abilities;
                    for (const ability in abilities) {
                        if (abilities.hasOwnProperty(ability)) {
                            const abilityId = toId(ability);
                            const count = abilities[ability];
                            if (!data[abilityId]) {
                                data[abilityId] = new MoveData(null);
                                data[abilityId].name = abilityId;
                            }
                            data[abilityId].pokemonCount.push({
                                count,
                                name: pokeId,
                            });
                        }
                    }
                }
            }
        }
    }

    return Object.values(data);
}
