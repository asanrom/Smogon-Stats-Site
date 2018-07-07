/**
 * Names for pokemon stuff
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { PokemonData } from "./pokemon-data";
import { toId } from "./text-utils";

/**
 * Obtains the name of a Pokemon.
 * @param pokemon   Pokemon identifier.
 * @returns         The pokemon name.
 */
export function getPokemonName(pokemon: string): string {
    pokemon = toId(pokemon);
    const data = PokemonData.getPokedex()[pokemon];
    if (data) {
        return data.name || pokemon;
    } else {
        return pokemon;
    }
}

/**
 * Obtains the name of a Move.
 * @param pokemon   Move identifier.
 * @returns         The move name.
 */
export function getMovesName(move: string): string {
    move = toId(move);
    const data = PokemonData.getMoves()[move];
    if (data) {
        return data.name || move;
    } else {
        return move;
    }
}

/**
 * Obtains the name of an Item.
 * @param pokemon   Item identifier.
 * @returns         The item name.
 */
export function getItemName(item: string): string {
    item = toId(item);
    const data = PokemonData.getItems()[item];
    if (data) {
        return data.name || item;
    } else {
        return item;
    }
}

/**
 * Obtains the name of an Ability.
 * @param pokemon   Ability identifier.
 * @returns         The ability name.
 */
export function getAbilitiesName(ability: string): string {
    ability = toId(ability);
    const data = PokemonData.getAbilities()[ability];
    if (data) {
        return data.name || ability;
    } else {
        return ability;
    }
}

const Natures = {
    adamant: "Adamant",
    bashful: "Bashful",
    bold: "Bold",
    brave: "Brave",
    calm: "Calm",
    careful: "Careful",
    docile: "Docile",
    gentle: "Gentle",
    hardy: "Hardy",
    hasty: "Hasty",
    impish: "Impish",
    jolly: "Jolly",
    lax: "Lax",
    lonely: "Lonely",
    mild: "Mild",
    modest: "Modest",
    naive: "Naive",
    naughty: "Naughty",
    quiet: "Quiet",
    quirky: "Quirky",
    rash: "Rash",
    relaxed: "Relaxed",
    sassy: "Sassy",
    serious: "Serious",
    timid: "Timid",
};

/**
 * Obtains the name of a Nature.
 * @param pokemon   Nature identifier.
 * @returns         The nature name.
 */
export function getNatureName(nature: string): string {
    nature = toId(nature);
    return Natures[nature] || nature;
}
