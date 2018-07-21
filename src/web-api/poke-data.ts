/**
 * Pokemon usage data (API)
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { IMonthStatus } from "../model/interfaces";
import { getFormatName } from "../utils/formats-names";
import { getAbilitiesName, getItemName, getMovesName, getNatureName, getPokemonName } from "../utils/pokemon-names";
import { toId } from "../utils/text-utils";
import { SmogonStatsAPI } from "./api";
import { parseParameters } from "./params";

/**
 * Checks if a month exists.
 * @param months    List of visible months.
 * @param year      Year number.
 * @param month     Month number.
 */
function checkMonth(months: IMonthStatus[], year: number, month: number): boolean {
    for (const m of months) {
        if (m.year === year && m.month === month) {
            return true;
        }
    }
    return false;
}

/**
 * Returns an error to the client.
 * @param response  Server response.
 * @param xml       True if using xml.
 * @param status    HTTP(S) status.
 * @param code      Error code.
 * @param message   Error message.
 */
function returnError(response: Express.Response, xml: boolean, status: number, code: string, message: string) {
    if (xml) {
        response.writeHead(status, { "Content-Type": "application/xml; charset=utf-8" });
        response.write(XML({
            error: [{ _attr: { code } }, message],
        }, { indent: "  " }));
        response.end();
    } else {
        response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
        response.write(JSON.stringify({
            error: {
                code,
                message,
            },
        }, null, 2));
        response.end();
    }
}

/**
 * API call. Pokemon data.
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIPokemonData(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    let selectedFields: string[] = null;
    if (request.query.select) {
        selectedFields = ("" + request.query.select).split(",");
    }
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getBaselinesPkmn(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const pokemonData = await SmogonStatsAPI.getPokemonData(params.year, params.month,
                    params.format, params.baseline, params.pokemon);
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    const data: any[] = [{
                        _attr: {
                            id: params.pokemon,
                            name: getPokemonName(params.pokemon),
                            rawCount: pokemonData.raw,
                            avgWeight: pokemonData.avgWeight,
                            viabilityCeiling: pokemonData.viability,
                        },
                    }];
                    if (!selectedFields || selectedFields.indexOf("abilities") >= 0) {
                        const abilities = [];
                        for (const ability of pokemonData.abilities) {
                            abilities.push({
                                ability: [{
                                    _attr: {
                                        id: ability.name,
                                        usage: ability.usage,
                                    },
                                }, getAbilitiesName(ability.name)],
                            });
                        }
                        data.push({ abilities });
                    }
                    if (!selectedFields || selectedFields.indexOf("items") >= 0) {
                        const items = [];
                        for (const item of pokemonData.items) {
                            items.push({
                                item: [{
                                    _attr: {
                                        id: item.name,
                                        usage: item.usage,
                                    },
                                }, getItemName(item.name)],
                            });
                        }
                        data.push({ items });
                    }
                    if (!selectedFields || selectedFields.indexOf("moves") >= 0) {
                        const moves = [];
                        for (const move of pokemonData.moves) {
                            moves.push({
                                move: [{
                                    _attr: {
                                        id: move.name,
                                        usage: move.usage,
                                    },
                                }, getMovesName(move.name)],
                            });
                        }
                        data.push({ moves });
                    }
                    if (!selectedFields || selectedFields.indexOf("spreads") >= 0) {
                        const spreads = [];
                        for (const spread of pokemonData.spreads) {
                            spreads.push({
                                spread: [{
                                    _attr: {
                                        usage: spread.usage,
                                    },
                                }, {
                                    nature: [{
                                        _attr: {
                                            id: spread.nature,
                                        },
                                    }, getNatureName(spread.nature),
                                    ],
                                }, {
                                    evs: [{
                                        _attr: {
                                            hp: spread.hp,
                                            atk: spread.atk,
                                            def: spread.def,
                                            spa: spread.spa,
                                            spd: spread.spd,
                                            spe: spread.spe,
                                        },
                                    }],
                                }],
                            });
                        }
                        data.push({ spreads });
                    }
                    if (!selectedFields || selectedFields.indexOf("teammates") >= 0) {
                        const teammates = [];
                        for (const mate of pokemonData.teammates) {
                            teammates.push({
                                teammate: [{
                                    _attr: {
                                        id: mate.name,
                                        usage: mate.usage,
                                    },
                                }, getPokemonName(mate.name)],
                            });
                        }
                        data.push({ teammates });
                    }
                    if (!selectedFields || selectedFields.indexOf("counters") >= 0) {
                        const counters = [];
                        for (const counter of pokemonData.counters) {
                            counters.push({
                                counter: [{
                                    _attr: {
                                        id: counter.name,
                                        ko: counter.ko,
                                        switch: counter.switch,
                                        total: counter.total,
                                    },
                                }, getPokemonName(counter.name)],
                            });
                        }
                        data.push({ counters });
                    }
                    res.result.push({ pokemondata: data });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res: any = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            pokemonData: {
                                id: params.pokemon,
                                name: getPokemonName(params.pokemon),
                                rawCount: pokemonData.raw,
                                avgWeight: pokemonData.avgWeight,
                                viabilityCeiling: pokemonData.viability,
                            },
                        },
                    };
                    if (!selectedFields || selectedFields.indexOf("abilities") >= 0) {
                        const abilities = [];
                        for (const ability of pokemonData.abilities) {
                            abilities.push({
                                id: ability.name,
                                name: getAbilitiesName(ability.name),
                                usage: ability.usage,
                            });
                        }
                        res.result.pokemonData.abilities = abilities;
                    }
                    if (!selectedFields || selectedFields.indexOf("items") >= 0) {
                        const items = [];
                        for (const item of pokemonData.items) {
                            items.push({
                                id: item.name,
                                name: getItemName(item.name),
                                usage: item.usage,
                            });
                        }
                        res.result.pokemonData.items = items;
                    }
                    if (!selectedFields || selectedFields.indexOf("moves") >= 0) {
                        const moves = [];
                        for (const move of pokemonData.moves) {
                            moves.push({
                                id: move.name,
                                name: getMovesName(move.name),
                                usage: move.usage,
                            });
                        }
                        res.result.pokemonData.moves = moves;
                    }
                    if (!selectedFields || selectedFields.indexOf("spreads") >= 0) {
                        const spreads = [];
                        for (const spread of pokemonData.spreads) {
                            spreads.push({
                                nature: {
                                    id: spread.nature,
                                    name: getNatureName(spread.nature),
                                },
                                evs: {
                                    hp: spread.hp,
                                    atk: spread.atk,
                                    def: spread.def,
                                    spa: spread.spa,
                                    spd: spread.spd,
                                    spe: spread.spe,
                                },
                                usage: spread.usage,
                            });
                        }
                        res.result.pokemonData.spreads = spreads;
                    }
                    if (!selectedFields || selectedFields.indexOf("teammates") >= 0) {
                        const teammates = [];
                        for (const mate of pokemonData.teammates) {
                            teammates.push({
                                id: mate.name,
                                name: getPokemonName(mate.name),
                                usage: mate.usage,
                            });
                        }
                        res.result.pokemonData.teammates = teammates;
                    }
                    if (!selectedFields || selectedFields.indexOf("counters") >= 0) {
                        const counters = [];
                        for (const counter of pokemonData.counters) {
                            counters.push({
                                id: counter.name,
                                name: getPokemonName(counter.name),
                                ko: counter.ko,
                                switch: counter.switch,
                                total: counter.total,
                            });
                        }
                        res.result.pokemonData.counters = counters;
                    }
                    response.write(JSON.stringify(res, null, 2));
                    response.end();
                }
            } else {
                returnError(response, xml, 404, "BASELINE_NOT_AVAILABLE",
                    "The baseline you specified is not available.");
            }
        } else {
            returnError(response, xml, 404, "FORMAT_NOT_FOUND",
                "The format you requested was not found.");
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}
