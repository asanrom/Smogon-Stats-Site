/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Generator interface.
 */

"use strict";

import { PokemonData } from "../../model/data-pokemon";
import { FormatMetagame } from "../../model/format-metagame";
import { AbilitiesFormatsList } from "../../model/formats-list-abilities";
import { ItemsFormatsList } from "../../model/formats-list-items";
import { LeadsFormatsList } from "../../model/formats-list-leads";
import { MetagameFormatsList } from "../../model/formats-list-metagame";
import { MovesFormatsList } from "../../model/formats-list-moves";
import { PokemonFormatsList } from "../../model/formats-list-pokemon";
import {
    IAbilitiesFormat, IItemsFormat,
    ILeadsFormat, IMetagameFormat,
    IMonthStatus, IMovesFormat,
    IPokemonFormat,
} from "../../model/interfaces";
import { AbilitiesRanking } from "../../model/ranking-abilities";
import { ItemsRanking } from "../../model/ranking-items";
import { LeadsRanking } from "../../model/ranking-leads";
import { MovesRanking } from "../../model/ranking-moves";
import { PokemonRanking } from "../../model/ranking-pokemon";
import { Language } from "../../utils/languages";

export type PrintFunction = (arg: string) => void;

/**
 * Represents the generation data.
 */
export interface IGenerationData {
    isNotFound: boolean;
    language: string;
    cookies: any;
    feature: string;
    months: IMonthStatus[];
    year: number;
    month: number;
    format: string;
    formatName: string;
    baseline: number;
    target: string;
    targetName: string;
    statsData: {
        formatsPokemon: PokemonFormatsList,
        formatsMoves: MovesFormatsList,
        formatsItems: ItemsFormatsList,
        formatsAbilities: AbilitiesFormatsList,
        formatsLeads: LeadsFormatsList,
        formatsMetagame: MetagameFormatsList,
        rankingPokemon: PokemonRanking,
        rankingMoves: MovesRanking,
        rankingItems: ItemsRanking,
        rankingAbilities: AbilitiesRanking,
        rankingLeads: LeadsRanking,
        metagameInfo: FormatMetagame,
        pokemonData: PokemonData,
    };
}

/**
 * Creates a new empty instance of IGenerationData.
 */
export function newGenerationData(): IGenerationData {
    return {
        baseline: 0,
        cookies: {},
        feature: "",
        format: "",
        formatName: "",
        isNotFound: false,
        language: "",
        month: 0,
        months: [],
        statsData: {
            formatsAbilities: null,
            formatsItems: null,
            formatsLeads: null,
            formatsMetagame: null,
            formatsMoves: null,
            formatsPokemon: null,
            metagameInfo: null,
            pokemonData: null,
            rankingAbilities: null,
            rankingItems: null,
            rankingLeads: null,
            rankingMoves: null,
            rankingPokemon: null,
        },
        target: "",
        targetName: "",
        year: 0,
    };
}

/**
 * Represents a generator of HTML web pages.
 */
export interface IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    generateHTML(data: IGenerationData, language: Language, printFunction: PrintFunction,
                 nestedGenerator?: IPageGenerator);
}
