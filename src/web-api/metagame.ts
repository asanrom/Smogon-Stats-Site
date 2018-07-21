/**
 * Metagame (API)
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { IMonthStatus } from "../model/interfaces";
import { getFormatName } from "../utils/formats-names";
import { capitalize, toId } from "../utils/text-utils";
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
 * API call. Metagame.
 * @param request   Client request.
 * @param response  Server response.
 */
export async function callAPIMetagame(request: Express.Request, response: Express.Response) {
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
            SmogonStatsAPI.gettBaselinesMeta(params.year, params.month, params.format);
        if (baselines.length !== 0) {
            if (params.baseline === -1) {
                params.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
            }
            if (baselines.indexOf(params.baseline) >= 0) {
                const metagame = await SmogonStatsAPI
                    .getMetagameStats(params.year, params.month, params.format, params.baseline);
                if (xml) {
                    response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
                    const res = { result: [] };
                    res.result.push({
                        format: [{ _attr: { id: params.format } },
                        getFormatName(params.format)],
                    });
                    res.result.push({ baseline: params.baseline });
                    if (!selectedFields || selectedFields.indexOf("playstyles") >= 0) {
                        const playStyles = [];
                        for (const style of metagame.playstyles) {
                            playStyles.push({
                                playstyle: [{
                                    _attr: {
                                        id: style.name,
                                        usage: style.usage,
                                    },
                                }, capitalize(style.name)],
                            });
                        }
                        res.result.push({ playstyles: playStyles });
                    }
                    if (!selectedFields || selectedFields.indexOf("stalliness") >= 0) {
                        const bars = [];
                        for (const bar of metagame.graph) {
                            bars.push({ bar: [{ _attr: { stalliness: bar.value } }, bar.p] });
                        }
                        res.result.push({
                            stalliness: [
                                { _attr: { mean: metagame.meanStalliness } },
                                { graph: bars },
                            ],
                        });
                    }
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
                        },
                    };
                    if (!selectedFields || selectedFields.indexOf("playstyles") >= 0) {
                        const playStyles = [];
                        for (const style of metagame.playstyles) {
                            playStyles.push({
                                id: style.name,
                                name: capitalize(style.name),
                                usage: style.usage,
                            });
                        }
                        res.result.playstyles = playStyles;
                    }
                    if (!selectedFields || selectedFields.indexOf("stalliness") >= 0) {
                        const bars = [];
                        for (const bar of metagame.graph) {
                            bars.push({ value: bar.value, percent: bar.p });
                        }
                        res.result.stalliness = {
                            mean: metagame.meanStalliness,
                            graph: bars,
                        };
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
