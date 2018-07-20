/**
 * URL parameters parsing system
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import { toId } from "../utils/text-utils";

/**
 * Common APi parameters.
 */
export interface IParameters {
    year: number;
    month: number;
    useLatestMonth: boolean;
    format: string;
    baseline: number;
    pokemon: string;
}

/**
 * Parses common parameters.
 * @param request   Client request.
 * @returns         Common parameters.
 */
export function parseParameters(request: Express.Request): IParameters {
    const params: IParameters = {
        year: 0,
        month: 0,
        useLatestMonth: false,
        format: "",
        baseline: 0,
        pokemon: "",
    };
    if (!request.query.month || toId(request.query.month) === "latest") {
        params.useLatestMonth = true;
    } else {
        const parts = ("" + request.query.month).split("-");
        params.year = parseInt(parts[0] + "", 10);
        params.month = parseInt(parts[1] + "", 10);
    }

    params.format = toId(request.query.format);
    if (!request.query.baseline || toId(request.query.baseline) === "default") {
        params.baseline = -1;
    } else {
        params.baseline = parseInt(request.query.baseline + "", 10);
    }

    params.pokemon = toId(request.query.pokemon);

    return params;
}

/**
 * Number attribute filter
 */
export interface INumberAttrFilter {
    operator: string;
    value: number;
}

/**
 * Parser a filter from an string.
 * @param userInput     The input string to parse.
 * @returns             The filter.
 */
export function parseNumberAttrFilter(userInput: string): INumberAttrFilter {
    if (!userInput) {
        return null;
    }
    userInput = (userInput + "").trim();
    if (userInput.indexOf(">=") === 0) {
        return {
            operator: ">=",
            value: Number(userInput.substr(2)),
        };
    } else if (userInput.indexOf("<=") === 0) {
        return {
            operator: "<=",
            value: Number(userInput.substr(2)),
        };
    } else if (userInput.indexOf(">") === 0) {
        return {
            operator: ">",
            value: Number(userInput.substr(1)),
        };
    } else if (userInput.indexOf("<") === 0) {
        return {
            operator: "<",
            value: Number(userInput.substr(1)),
        };
    } else if (userInput.indexOf("=") === 0) {
        return {
            operator: "=",
            value: Number(userInput.substr(1)),
        };
    } else {
        return {
            operator: "=",
            value: Number(userInput),
        };
    }
}

/**
 * Checks if a value passes a filter.
 * @param filter    The filter.
 * @param value     The value to check.
 */
export function checkNumberAttrFilter(filter: INumberAttrFilter, value: number): boolean {
    switch (filter.operator) {
        case ">":
            return value > filter.value;
        case "<":
            return value < filter.value;
        case ">=":
            return value >= filter.value;
        case "<=":
            return value <= filter.value;
        default:
            return value === filter.value;
    }
}
