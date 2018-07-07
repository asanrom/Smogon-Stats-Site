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
const ABILITIES_FILE = "abilities-min.json";

const DATA_PATH = Path.resolve(__dirname, "../../resources");

/**
 * Reads the pokemon data.
 */
export class PokemonData {

    /**
     * Loads the poemon, items and moves data
     * from the resources files.
     */
    public static load() {
        try {
            PokemonData.pokedex = JSON.parse(FS.readFileSync(Path.resolve(DATA_PATH, POKEDEX_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }

        try {
            PokemonData.moves = JSON.parse(FS.readFileSync(Path.resolve(DATA_PATH, MOVES_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }

        try {
            PokemonData.items = JSON.parse(FS.readFileSync(Path.resolve(DATA_PATH, ITEMS_FILE)).toString());
        } catch (err) {
            Logger.getInstance().error(err);
        }

        try {
            PokemonData.abilities = JSON.parse(FS.readFileSync(Path.resolve(DATA_PATH,
                ABILITIES_FILE)).toString());
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

    /**
     * Obtains the abilities data.
     * @returns The abilities data.
     */
    public static getAbilities(): object {
        return PokemonData.abilities;
    }

    private static pokedex: object;
    private static moves: object;
    private static items: object;
    private static abilities: object;
}

PokemonData.load();
