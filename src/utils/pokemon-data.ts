/**
 * Pokemon data resources
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Minimal Pokemon data resources (pokedex, moves, items).
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";

import { Logger } from "./logs";

const POKEDEX_FILE = "pokedex-min.json";
const MOVES_FILE = "moves-min.json";
const ITEMS_FILE = "items-min.json";

/**
 * Reads the pokemon data.
 */
export class PokemonData {

    /**
     * Loads the poemon, items and moves data
     * from the resources files.
     */
    public static load(path: string) {
        try {
            PokemonData.pokedex = JSON.parse(FS.readFileSync(Path.resolve(path, POKEDEX_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }

        try {
            PokemonData.moves = JSON.parse(FS.readFileSync(Path.resolve(path, MOVES_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }

        try {
            PokemonData.items = JSON.parse(FS.readFileSync(Path.resolve(path, ITEMS_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    /**
     * Obtains the pokemon data.
     * @returns The pokemon data.
     */
    public static getPokedex(): object {
        return PokemonData.pokedex;
    }

    /**
     * Obtains the moves data.
     * @returns The moves data.
     */
    public static getMoves(): object {
        return PokemonData.moves;
    }

    /**
     * Obtains the items data.
     * @returns The items data.
     */
    public static getItems(): object {
        return PokemonData.items;
    }

    private static pokedex: object;
    private static moves: object;
    private static items: object;
}
