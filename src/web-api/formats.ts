/**
 * Formats lists (API)
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { IMonthStatus } from "../model/interfaces";
import { getFormatName } from "../utils/formats-names";
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
 * API call. Formats lists (Pokemon).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsPokemon(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const sortCriteria = toId(request.query["sorted-by"]);
    const filterTopPokemon = toId(request.query["top-pokemon"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterNumberBattles = parseNumberAttrFilter(request.query.battles);
    const filterAverageWeigth = parseNumberAttrFilter(request.query.avgwt);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsPokemon(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterNumberBattles) {
                if (!checkNumberAttrFilter(filterNumberBattles, format.totalBattles)) {
                    continue;
                }
            }
            if (filterAverageWeigth) {
                if (!checkNumberAttrFilter(filterAverageWeigth, format.avgwt)) {
                    continue;
                }
            }
            if (filterTopPokemon) {
                if (filterTopPokemon !== format.topPokemon) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            if (sortCriteria === "battles") {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else if (a.format.totalBattles > b.format.totalBattles) {
                        return -1;
                    } else if (a.format.totalBattles < b.format.totalBattles) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            }
        } else {
            if (sortCriteria === "battles") {
                result = result.sort((a, b) => {
                    if (a.format.totalBattles > b.format.totalBattles) {
                        return -1;
                    } else if (a.format.totalBattles < b.format.totalBattles) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                });
            }
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "pokemon/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            battles: r.format.totalBattles,
                            avgwt: r.format.avgwt,
                            topPokemon: r.format.topPokemon,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "pokemon/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    battles: r.format.totalBattles,
                    avgwt: r.format.avgwt,
                    topPokemon: r.format.topPokemon,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}

/**
 * API call. Formats lists (Moves).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsMoves(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const sortCriteria = toId(request.query["sorted-by"]);
    const filterTopMove = toId(request.query["top-move"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterNumberMoves = parseNumberAttrFilter(request.query.moves);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsMoves(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterNumberMoves) {
                if (!checkNumberAttrFilter(filterNumberMoves, format.totalMoves)) {
                    continue;
                }
            }
            if (filterTopMove) {
                if (filterTopMove !== format.topMove) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            if (sortCriteria === "moves") {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else if (a.format.totalMoves > b.format.totalMoves) {
                        return -1;
                    } else if (a.format.totalMoves < b.format.totalMoves) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            }
        } else {
            if (sortCriteria === "moves") {
                result = result.sort((a, b) => {
                    if (a.format.totalMoves > b.format.totalMoves) {
                        return -1;
                    } else if (a.format.totalMoves < b.format.totalMoves) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                });
            }
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "moves/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            moves: r.format.totalMoves,
                            topMove: r.format.topMove,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "moves/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    moves: r.format.totalMoves,
                    topMove: r.format.topMove,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}

/**
 * API call. Formats lists (Items).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsItems(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const sortCriteria = toId(request.query["sorted-by"]);
    const filterTopItem = toId(request.query["top-item"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterNumberItems = parseNumberAttrFilter(request.query.items);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsItems(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterNumberItems) {
                if (!checkNumberAttrFilter(filterNumberItems, format.totalItems)) {
                    continue;
                }
            }
            if (filterTopItem) {
                if (filterTopItem !== format.topItem) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            if (sortCriteria === "items") {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else if (a.format.totalItems > b.format.totalItems) {
                        return -1;
                    } else if (a.format.totalItems < b.format.totalItems) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            }
        } else {
            if (sortCriteria === "items") {
                result = result.sort((a, b) => {
                    if (a.format.totalItems > b.format.totalItems) {
                        return -1;
                    } else if (a.format.totalItems < b.format.totalItems) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                });
            }
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "items/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            items: r.format.totalItems,
                            topItem: r.format.topItem,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "items/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    items: r.format.totalItems,
                    topItem: r.format.topItem,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}

/**
 * API call. Formats lists (Abilities).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsAbilities(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const sortCriteria = toId(request.query["sorted-by"]);
    const filterTopAbility = toId(request.query["top-ability"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterNumberAbilities = parseNumberAttrFilter(request.query.abilities);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsAbilities(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterNumberAbilities) {
                if (!checkNumberAttrFilter(filterNumberAbilities, format.totalAbilities)) {
                    continue;
                }
            }
            if (filterTopAbility) {
                if (filterTopAbility !== format.topAbility) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            if (sortCriteria === "abilities") {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else if (a.format.totalAbilities > b.format.totalAbilities) {
                        return -1;
                    } else if (a.format.totalAbilities < b.format.totalAbilities) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            }
        } else {
            if (sortCriteria === "abilities") {
                result = result.sort((a, b) => {
                    if (a.format.totalAbilities > b.format.totalAbilities) {
                        return -1;
                    } else if (a.format.totalAbilities < b.format.totalAbilities) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                });
            }
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "abilities/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            abilities: r.format.totalAbilities,
                            topAbility: r.format.topAbility,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "abilities/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    abilities: r.format.totalAbilities,
                    topAbility: r.format.topAbility,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}

/**
 * API call. Formats lists (Leads).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsLeads(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const sortCriteria = toId(request.query["sorted-by"]);
    const filterTopPokemon = toId(request.query["top-lead"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterNumberLeads = parseNumberAttrFilter(request.query.leads);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsLeads(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterNumberLeads) {
                if (!checkNumberAttrFilter(filterNumberLeads, format.totalLeads)) {
                    continue;
                }
            }
            if (filterTopPokemon) {
                if (filterTopPokemon !== format.topLead) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            if (sortCriteria === "leads") {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else if (a.format.totalLeads > b.format.totalLeads) {
                        return -1;
                    } else if (a.format.totalLeads < b.format.totalLeads) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    if (a.ss < b.ss) {
                        return -1;
                    } else if (a.ss > b.ss) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            }
        } else {
            if (sortCriteria === "leads") {
                result = result.sort((a, b) => {
                    if (a.format.totalLeads > b.format.totalLeads) {
                        return -1;
                    } else if (a.format.totalLeads < b.format.totalLeads) {
                        return 1;
                    } else {
                        return a.format.id.localeCompare(b.format.id)
                            || (a.format.baseline > b.format.baseline ? -1 : 1);
                    }
                });
            } else {
                result = result.sort((a, b) => {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                });
            }
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "leads/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            leads: r.format.totalLeads,
                            topLead: r.format.topLead,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "leads/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    leads: r.format.totalLeads,
                    topLead: r.format.topLead,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}

/**
 * API call. Formats lists (Metagame).
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIFormatsMetagame(request: Express.Request, response: Express.Response) {
    const xml = toId(request.query["return-as"]) === "xml";
    const months = await SmogonStatsAPI.getMonths();
    const params = parseParameters(request);
    if (params.useLatestMonth) {
        const last = SmogonStatsAPI.getDefaultMonth(months);
        params.year = last.year;
        params.month = last.month;
    }
    const filterContains = toId(request.query["search-for"]);
    const filterTopStyle = toId(request.query["top-style"]);
    const filterBaselines = parseNumberAttrFilter(request.query.baseline);
    const filterStall = parseNumberAttrFilter(request.query.stalliness);
    if (checkMonth(months, params.year, params.month)) {
        const formats = await SmogonStatsAPI.getFormatsMetagame(params.year, params.month);
        let result = [];
        for (const format of formats.formats) {
            if (filterBaselines) {
                if (!checkNumberAttrFilter(filterBaselines, format.baseline)) {
                    continue;
                }
            }
            if (filterStall) {
                if (!checkNumberAttrFilter(filterStall, format.stalliness)) {
                    continue;
                }
            }
            if (filterTopStyle) {
                if (filterTopStyle !== format.topStyle) {
                    continue;
                }
            }
            let searchSort = -1;
            if (filterContains) {
                searchSort = format.id.indexOf(filterContains);
                if (searchSort === -1) {
                    continue;
                }
            }
            result.push({ format, ss: searchSort });
        }
        if (filterContains) {
            result = result.sort((a, b) => {
                if (a.ss < b.ss) {
                    return -1;
                } else if (a.ss > b.ss) {
                    return 1;
                } else {
                    return a.format.id.localeCompare(b.format.id)
                        || (a.format.baseline > b.format.baseline ? -1 : 1);
                }
            });
        } else {
            result = result.sort((a, b) => {
                return a.format.id.localeCompare(b.format.id)
                    || (a.format.baseline > b.format.baseline ? -1 : 1);
            });
        }
        if (xml) {
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            const formatsRes = [];
            const res: any = {
                result: [
                    { feature: "metagame/formats" },
                    { year: params.year },
                    { month: params.month },
                    { formats: formatsRes },
                ],
            };
            for (const r of result) {
                formatsRes.push({
                    format: [{
                        _attr: {
                            id: r.format.id,
                            baseline: r.format.baseline,
                            stalliness: r.format.stalliness,
                            topStyle: r.format.topStyle,
                        },
                    }, getFormatName(r.format.id)],
                });
            }
            response.write(XML(res, { indent: "  " }));
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            const res = {
                result: {
                    feature: "metagame/formats",
                    year: params.year, month: params.month, formats: [],
                },
            };
            for (const r of result) {
                res.result.formats.push({
                    id: r.format.id,
                    name: getFormatName(r.format.id),
                    baseline: r.format.baseline,
                    stalliness: r.format.stalliness,
                    topStyle: r.format.topStyle,
                });
            }
            response.write(JSON.stringify(res, null, 2));
            response.end();
        }
    } else {
        returnError(response, xml, 404, "MONTH_NOT_AVAILABLE",
            "There is no information for the month you requested.");
    }
}
