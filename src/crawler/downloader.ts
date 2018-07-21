/**
 * Smogon usage stats crawler
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Downloads usage stats from Smogon website.
 */

"use strict";

import * as HTTP from "http";
import * as HTTPS from "https";
import * as URL from "url";
import { Config } from "../config";
import { Logger } from "../utils/logs";
import { addLeftZeros } from "../utils/text-utils";

type WGetCallback = (error: Error, result: string) => void;

/**
 * Downloads a web page from the Internet.
 * @param url URL to download from.
 */
function wget(url: URL.URL): Promise<string> {
    Logger.getInstance().debug("Download " + url.toString());
    if (url.protocol === "https:") {
        return new Promise((resolve, reject) => {
            HTTPS.get(url.href, (response) => {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });
                response.on("end", () => {
                    resolve(data);
                });
                response.on("error", (err) => {
                    reject(err);
                });
            }).on("error", (err) => {
                reject(err);
            });
        });
    } else if (url.protocol === "http:") {
        return new Promise((resolve, reject) => {
            HTTP.get(url.href, (response) => {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });
                response.on("end", () => {
                    resolve(data);
                });
                response.on("error", (err) => {
                    reject(err);
                });
            }).on("error", (err) => {
                reject(err);
            });
        });
    } else {
        return Promise.reject("Unknown protocol.");
    }
}

/**
 * Resolves an URL based on Smogon stats base URL.
 * @param url   URL to resolve.
 * @returns     The resolved URL.
 */
function getURL(url: string): URL.URL {
    return new URL.URL(url, Config.smogonStatsURL);
}

/**
 * Downloads usage stats from Smogon website.
 */
export class Downloader {

    /**
     * Downloads the months list.
     */
    public static downloadMonthsList(): Promise<string> {
        return wget(getURL("./"));
    }

    /**
     * Downloads the formats list.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2) + "/"));
    }

    /**
     * Downloads the formats list from /leads/.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadLeadsFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2) + "/leads/"));
    }

    /**
     * Downloads the formats list from /metagame/.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadMetagameFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2) + "/metagame/"));
    }

    /**
     * Downloads the usage rank for a format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadFormatUsage(year: number, month: number, format: string,
                                      baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the usage data for a format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadFormatUsageData(year: number, month: number, format: string,
                                          baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/chaos/" + format + "-" + baseline + ".json"));
    }

    /**
     * Downloads the usage data table for a format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadFormatUsageDataTable(year: number, month: number, format: string,
                                               baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/moveset/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the leads usage data for a format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadLeads(year: number, month: number, format: string,
                                baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/leads/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the metagame stats for a format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMetagameInfo(year: number, month: number, format: string,
                                       baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/metagame/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the formats list for /monotype/
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadMonotypeFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/"));
    }

    /**
     * Downloads the formats list for /monotype/leads/
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadMonotypeLeadsFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/leads/"));
    }

    /**
     * Downloads the formats list for /monotype/metagame/
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     */
    public static downloadMonotypeMetagameFormatsList(year: number, month: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/metagame/"));
    }

    /**
     * Downloads the usage rank for a monotype format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMonotypeFormatUsage(year: number, month: number, format: string,
                                              baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the usage data for a monotype format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMonotypeFormatUsageData(year: number, month: number, format: string,
                                                  baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/chaos/" + format + "-" + baseline + ".json"));
    }

    /**
     * Downloads the usage data table for a monotype format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMonotypeFormatUsageDataTable(year: number, month: number, format: string,
                                                       baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/moveset/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the leads usage stats for a monotype format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMonotypeLeads(year: number, month: number, format: string,
                                        baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/leads/" + format + "-" + baseline + ".txt"));
    }

    /**
     * Downloads the metagame stats for a monotype format.
     * @param year      Year.
     * @param month     Month (from 1 to 12).
     * @param format    Format identifier.
     * @param baseline  Baseline.
     */
    public static downloadMonotypeMetagameInfo(year: number, month: number, format: string,
                                               baseline: number): Promise<string> {
        return wget(getURL("./" + year + "-" + addLeftZeros(month, 2)
            + "/monotype/metagame/" + format + "-" + baseline + ".txt"));
    }
}
