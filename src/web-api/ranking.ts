/**
 * Rankings (API)
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { IMonthStatus } from "../model/interfaces";
import { getFormatName } from "../utils/formats-names";
import { getAbilitiesName, getItemName, getMovesName, getPokemonName } from "../utils/pokemon-names";
import { toId } from "../utils/text-utils";
import { SmogonStatsAPI } from "./api";
import { checkNumberAttrFilter, parseNumberAttrFilter, parseParameters } from "./params";

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
 * API call. Ranking (Pokemon).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIRankingPokemon(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterPos = parseNumberAttrFilter(request.query.pos);
    const filterUsage = parseNumberAttrFilter(request.query.usage);
    const filterRaw = parseNumberAttrFilter(request.query.raw);
    const filterRawp = parseNumberAttrFilter(request.query.rawp);
    const filterReal = parseNumberAttrFilter(request.query.real);
    const filterRealp = parseNumberAttrFilter(request.query.realp);
    const filterID = toId(request.query.id);
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getBaselinesPkmn(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const ranking = await SmogonStatsAPI
                    .getPokemonRanking(params.year, params.month, params.format, params.baseline);
                const result = {
                    avgwt: ranking.avgWeightTeam,
                    battles: ranking.totalBattles,
                    pokemon: [],
                };
                for (const pokemon of ranking.pokemon) {
                    if (filterID && filterID !== pokemon.name) {
                        continue;
                    }
                    if (filterPos && !checkNumberAttrFilter(filterPos, pokemon.pos)) {
                        continue;
                    }
                    if (filterUsage && !checkNumberAttrFilter(filterUsage, pokemon.usage)) {
                        continue;
                    }
                    if (filterRaw && !checkNumberAttrFilter(filterRaw, pokemon.raw)) {
                        continue;
                    }
                    if (filterRawp && !checkNumberAttrFilter(filterRawp, pokemon.rawp)) {
                        continue;
                    }
                    if (filterReal && !checkNumberAttrFilter(filterReal, pokemon.real)) {
                        continue;
                    }
                    if (filterRealp && !checkNumberAttrFilter(filterRealp, pokemon.realp)) {
                        continue;
                    }
                    result.pokemon.push(pokemon);
                }
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    res.result.push({ battles: result.battles });
                    res.result.push({ avgwt: result.avgwt });
                    const pokemon = [];
                    for (const poke of result.pokemon) {
                        pokemon.push({
                            pokemon: [{
                                _attr: {
                                    id: poke.name,
                                    pos: poke.pos,
                                    usage: poke.usage,
                                    raw: poke.raw,
                                    rawp: poke.rawp,
                                    real: poke.real,
                                    realp: poke.realp,
                                },
                            }, getPokemonName(poke.name)],
                        });
                    }
                    res.result.push({ ranking: pokemon });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            battles: result.battles,
                            avgwt: result.avgwt,
                            pokemon: [],
                        },
                    };
                    for (const poke of result.pokemon) {
                        res.result.pokemon.push({
                            id: poke.name,
                            name: getPokemonName(poke.name),
                            pos: poke.pos,
                            usage: poke.usage,
                            raw: poke.raw,
                            rawp: poke.rawp,
                            real: poke.real,
                            realp: poke.realp,
                        });
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

/**
 * API call. Ranking (Moves).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIRankingMoves(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterPos = parseNumberAttrFilter(request.query.pos);
    const filterUsage = parseNumberAttrFilter(request.query.usage);
    const filterRaw = parseNumberAttrFilter(request.query.raw);
    const filterID = toId(request.query.id);
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getBaselinesMvs(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const ranking = await SmogonStatsAPI
                    .getMovesRanking(params.year, params.month, params.format, params.baseline);
                const result = {
                    total: ranking.totalMoves,
                    moves: [],
                };
                for (const rankingEntry of ranking.moves) {
                    if (filterID && filterID !== rankingEntry.name) {
                        continue;
                    }
                    if (filterPos && !checkNumberAttrFilter(filterPos, rankingEntry.pos)) {
                        continue;
                    }
                    if (filterUsage && !checkNumberAttrFilter(filterUsage, rankingEntry.usage)) {
                        continue;
                    }
                    if (filterRaw && !checkNumberAttrFilter(filterRaw, rankingEntry.raw)) {
                        continue;
                    }
                    result.moves.push(rankingEntry);
                }
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    res.result.push({ total: result.total });
                    const moves = [];
                    for (const move of result.moves) {
                        moves.push({
                            move: [{
                                _attr: {
                                    id: move.name,
                                    pos: move.pos,
                                    usage: move.usage,
                                    raw: move.raw,
                                },
                            }, getMovesName(move.name)],
                        });
                    }
                    res.result.push({ ranking: moves });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            total: result.total,
                            moves: [],
                        },
                    };
                    for (const move of result.moves) {
                        res.result.moves.push({
                            id: move.name,
                            name: getMovesName(move.name),
                            pos: move.pos,
                            usage: move.usage,
                            raw: move.raw,
                        });
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

/**
 * API call. Ranking (Items).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIRankingItems(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterPos = parseNumberAttrFilter(request.query.pos);
    const filterUsage = parseNumberAttrFilter(request.query.usage);
    const filterRaw = parseNumberAttrFilter(request.query.raw);
    const filterID = toId(request.query.id);
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getbaselinesItms(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const ranking = await SmogonStatsAPI
                    .getItemsRanking(params.year, params.month, params.format, params.baseline);
                const result = {
                    total: ranking.totalItems,
                    items: [],
                };
                for (const rankingEntry of ranking.items) {
                    if (filterID && filterID !== rankingEntry.name) {
                        continue;
                    }
                    if (filterPos && !checkNumberAttrFilter(filterPos, rankingEntry.pos)) {
                        continue;
                    }
                    if (filterUsage && !checkNumberAttrFilter(filterUsage, rankingEntry.usage)) {
                        continue;
                    }
                    if (filterRaw && !checkNumberAttrFilter(filterRaw, rankingEntry.raw)) {
                        continue;
                    }
                    result.items.push(rankingEntry);
                }
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    res.result.push({ total: result.total });
                    const items = [];
                    for (const item of result.items) {
                        items.push({
                            item: [{
                                _attr: {
                                    id: item.name,
                                    pos: item.pos,
                                    usage: item.usage,
                                    raw: item.raw,
                                },
                            }, getItemName(item.name)],
                        });
                    }
                    res.result.push({ ranking: items });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            total: result.total,
                            items: [],
                        },
                    };
                    for (const item of result.items) {
                        res.result.items.push({
                            id: item.name,
                            name: getItemName(item.name),
                            pos: item.pos,
                            usage: item.usage,
                            raw: item.raw,
                        });
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

/**
 * API call. Ranking (Abilities).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIRankingAbilities(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterPos = parseNumberAttrFilter(request.query.pos);
    const filterUsage = parseNumberAttrFilter(request.query.usage);
    const filterRaw = parseNumberAttrFilter(request.query.raw);
    const filterID = toId(request.query.id);
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getBaselinesAbl(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const ranking = await SmogonStatsAPI
                    .getAbilitiesRanking(params.year, params.month, params.format, params.baseline);
                const result = {
                    total: ranking.totalAbilities,
                    abilities: [],
                };
                for (const rankingEntry of ranking.abilities) {
                    if (filterID && filterID !== rankingEntry.name) {
                        continue;
                    }
                    if (filterPos && !checkNumberAttrFilter(filterPos, rankingEntry.pos)) {
                        continue;
                    }
                    if (filterUsage && !checkNumberAttrFilter(filterUsage, rankingEntry.usage)) {
                        continue;
                    }
                    if (filterRaw && !checkNumberAttrFilter(filterRaw, rankingEntry.raw)) {
                        continue;
                    }
                    result.abilities.push(rankingEntry);
                }
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    res.result.push({ total: result.total });
                    const abilities = [];
                    for (const ability of result.abilities) {
                        abilities.push({
                            ability: [{
                                _attr: {
                                    id: ability.name,
                                    pos: ability.pos,
                                    usage: ability.usage,
                                    raw: ability.raw,
                                },
                            }, getAbilitiesName(ability.name)],
                        });
                    }
                    res.result.push({ ranking: abilities });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            total: result.total,
                            abilities: [],
                        },
                    };
                    for (const ability of result.abilities) {
                        res.result.abilities.push({
                            id: ability.name,
                            name: getAbilitiesName(ability.name),
                            pos: ability.pos,
                            usage: ability.usage,
                            raw: ability.raw,
                        });
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

/**
 * API call. Ranking (Leads).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIRankingLeads(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterPos = parseNumberAttrFilter(request.query.pos);
    const filterUsage = parseNumberAttrFilter(request.query.usage);
    const filterRaw = parseNumberAttrFilter(request.query.raw);
    const filterRawp = parseNumberAttrFilter(request.query.rawp);
    const filterID = toId(request.query.id);
    if (checkMonth(months, params.year, params.month)) {
        const baselines = await
            SmogonStatsAPI.getBaselinesLeads(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const ranking = await SmogonStatsAPI
                    .getLeadsRanking(params.year, params.month, params.format, params.baseline);
                const result = {
                    total: ranking.totalLeads,
                    leads: [],
                };
                for (const rankingEntry of ranking.leads) {
                    if (filterID && filterID !== rankingEntry.name) {
                        continue;
                    }
                    if (filterPos && !checkNumberAttrFilter(filterPos, rankingEntry.pos)) {
                        continue;
                    }
                    if (filterUsage && !checkNumberAttrFilter(filterUsage, rankingEntry.usage)) {
                        continue;
                    }
                    if (filterRaw && !checkNumberAttrFilter(filterRaw, rankingEntry.raw)) {
                        continue;
                    }
                    if (filterRawp && !checkNumberAttrFilter(filterRawp, rankingEntry.rawp)) {
                        continue;
                    }
                    result.leads.push(rankingEntry);
                }
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    res.result.push({ total: result.total });
                    const leads = [];
                    for (const lead of result.leads) {
                        leads.push({
                            lead: [{
                                _attr: {
                                    id: lead.name,
                                    pos: lead.pos,
                                    usage: lead.usage,
                                    raw: lead.raw,
                                    rawp: lead.rawp,
                                },
                            }, getPokemonName(lead.name)],
                        });
                    }
                    res.result.push({ ranking: leads });
                    response.write(XML(res, { indent: "  " }));
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    const res = {
                        result: {
                            format: {
                                id: params.format,
                                name: getFormatName(params.format),
                            },
                            baseline: params.baseline,
                            total: result.total,
                            leads: [],
                        },
                    };
                    for (const lead of result.leads) {
                        res.result.leads.push({
                            id: lead.name,
                            name: getPokemonName(lead.name),
                            pos: lead.pos,
                            usage: lead.usage,
                            raw: lead.raw,
                            rawp: lead.rawp,
                        });
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
