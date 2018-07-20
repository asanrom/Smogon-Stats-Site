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
 * @param xml       True if using xml.
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
            const res = { result: [] };
            for (const r of result) {
                res.result.push({
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
            const res = { result: [] };
            for (const r of result) {
                res.result.push({
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
