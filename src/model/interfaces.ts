/**
 * Model
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Model interfaces.
 */

"use strict";

/**
 * Represents the status of a month.
 */
export interface IMonthStatus {
    mid: number;
    year: number;
    month: number;
    status: string;
    visible: boolean;
}

/**
 * Meta-information of a format (Pokemon).
 */
export interface IPokemonFormat {
    name: string;
    id: string;
    baseline: number;
    totalBattles: number;
    avgwt: number;
    topPokemon: string;
}

/**
 * Meta-information of a format (Moves).
 */
export interface IMovesFormat {
    name: string;
    id: string;
    baseline: number;
    totalMoves: number;
    topMove: string;
}

/**
 * Meta-information of a format (Items).
 */
export interface IItemsFormat {
    name: string;
    id: string;
    baseline: number;
    totalItems: number;
    topItem: string;
}

/**
 * Meta-information of a format (Abilities).
 */
export interface IAbilitiesFormat {
    name: string;
    id: string;
    baseline: number;
    totalAbilities: number;
    topAbility: string;
}

/**
 * Meta-information of a format (Leads).
 */
export interface ILeadsFormat {
    name: string;
    id: string;
    baseline: number;
    totalLeads: number;
    topLead: string;
}

/**
 * Meta-information of a format (Metagame).
 */
export interface IMetagameFormat {
    name: string;
    id: string;
    baseline: number;
    stalliness: number;
    topStyle: string;
}

/**
 * Represents the usage stats of a Pokemon.
 */
export interface IPokemonUsage {
    pos: number;
    name: string;
    usage: number;
    raw: number;
    rawp: number;
    real: number;
    realp: number;
}

/**
 * Represents the usage stats of a move.
 */
export interface IMoveUsage {
    pos: number;
    name: string;
    raw: number;
    usage: number;
}

/**
 * Represents the usage stats of an item.
 */
export interface IItemUsage {
    pos: number;
    name: string;
    raw: number;
    usage: number;
}

/**
 * Represents the usage stats of an ability.
 */
export interface IAbilityUsage {
    pos: number;
    name: string;
    raw: number;
    usage: number;
}

/**
 * Represents the usage stats of a lead.
 */
export interface ILeadUsage {
    pos: number;
    name: string;
    raw: number;
    rawp: number;
    usage: number;
}

/**
 * Represents the usage of a playstyle.
 */
export interface IPlayStyle {
    name: string;
    usage: number;
}

/**
 * Represents a bar of stalliness graph.
 */
export interface IStallBar {
    value: number;
    p: number;
}

/**
 * Represents an usage (min).
 */
export interface IMinUsage {
    name: string;
    usage: number;
}

/**
 * Represents the usage of a spread.
 */
export interface ISpreadUsage {
    nature: string;
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
    usage: number;
}

/**
 * Represents the usage of a check / counter.
 */
export interface ICounterUsage {
    name: string;
    ko: number;
    switch: number;
    total: number;
}
