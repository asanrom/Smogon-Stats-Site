/**
 * Smogon usage stats crawler
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Downloads and parses usage stats from smogon website.
 */

"use strict";

import { FormatMetagame } from "../model/format-metagame";
import { IMonthStatus } from "../model/interfaces";
import {
    IAbilitiesFormat, IItemsFormat,
    ILeadsFormat, IMetagameFormat,
    IMovesFormat, IPokemonFormat,
} from "../model/interfaces";
import { AbilitiesRanking } from "../model/ranking-abilities";
import { ItemsRanking } from "../model/ranking-items";
import { LeadsRanking } from "../model/ranking-leads";
import { MovesRanking } from "../model/ranking-moves";
import { PokemonRanking } from "../model/ranking-pokemon";
import { addLeftZeros } from "../utils/text-utils";
import { Config } from "./../config";
import { AbilitiesFormatsList } from "./../model/formats-list-abilities";
import { ItemsFormatsList } from "./../model/formats-list-items";
import { LeadsFormatsList } from "./../model/formats-list-leads";
import { MetagameFormatsList } from "./../model/formats-list-metagame";
import { MovesFormatsList } from "./../model/formats-list-moves";
import { PokemonFormatsList } from "./../model/formats-list-pokemon";
import { Storage } from "./../storage/storage";
import { Logger } from "./../utils/logs";
import { Downloader } from "./downloader";
import { IFormat, parseFormatsList } from "./formats-list";
import {
    extractAbilitiesRanking,
    extractItemsRanking,
    extractMovesRanking,
} from "./json-data-parser";
import { parseLeadsRanking } from "./leads-ranking-parser";
import { parseMetagameInformation } from "./metagame-parser";
import { parseMonthsList } from "./months-list";
import { parsePokemonRanking } from "./pokemon-ranking-parser";
import { parseUsageDataTable } from "./tables-parser";

const CRAWLER_DELAY = 5000;
const CHECK_INVERVAL = 60 * 60 * 1000;

/**
 * Does the crawler behaviour.
 */
async function crawler() {

    if (Date.now() - StatsCrawler.lastCheck >= CHECK_INVERVAL) {
        let monthsListHTML;
        let changed = false;
        try {
            monthsListHTML = await Downloader.downloadMonthsList();
            StatsCrawler.lastCheck = Date.now();
            const monthsList = parseMonthsList(monthsListHTML);

            for (const month of monthsList) {
                if (!StatsCrawler.months[month.mid]) {
                    StatsCrawler.months[month.mid] = month;
                    changed = true;
                }
            }

            Logger.getInstance().debug("Month data: " + JSON.stringify(monthsList));

            if (changed) {
                Logger.getInstance().info("Updated months list");
                try {
                    await StatsCrawler.saveMonths();
                } catch (err) {
                    Logger.getInstance().error(err);
                }
            }
        } catch (err) {
            Logger.getInstance().error(err);
            Logger.getInstance().warning("Could not download month list. (Connection issues?)");
        }
    }

    let lastMonth: IMonthStatus = {
        mid: 0,
        month: 0,
        status: "ready",
        visible: false,
        year: 0,
    };
    Object.values(StatsCrawler.months).forEach((month) => {
        if (month.mid > lastMonth.mid) {
            lastMonth = month;
        }
    });

    const monthsToCrawl: IMonthStatus[] = [];

    let addedLast = false;
    if (lastMonth.status === "new") {
        monthsToCrawl.push(lastMonth);
        addedLast = true;
    }

    Object.values(StatsCrawler.months).forEach((month) => {
        if ((!addedLast || month.mid !== lastMonth.mid) && (month.status === "pending" || month.status === "working"
            || month.status === "delete")) {
            monthsToCrawl.push(month);
        }
    });

    if (monthsToCrawl.length === 0) {
        return; // Nothing to do
    }

    for (const month of monthsToCrawl) {
        if (StatsCrawler.status.disabled) {
            continue;
        }
        if (month.status === "delete") {
            deleteMonthData(month);
            continue;
        }
        const monthID = month.year + "-" + addLeftZeros(month.month, 2);
        month.status = "working";
        try {
            await StatsCrawler.saveMonths();
        } catch (err) {
            Logger.getInstance().error(err);
        }
        Logger.getInstance().info("Working with month " + monthID + "...");

        /* Formats lists */
        Logger.getInstance().info("[" + monthID + "] " + "Downloading and parsing formats lists...");
        let list: IFormat[];
        try {
            list = parseFormatsList(await Downloader.downloadFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }
        let listMonotype: IFormat[];
        try {
            listMonotype = parseFormatsList(await Downloader.downloadMonotypeFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download monotype formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }
        let listLeads: IFormat[];
        try {
            listLeads = parseFormatsList(await Downloader.downloadLeadsFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download leads formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }
        let listLeadsMonotype: IFormat[];
        try {
            listLeadsMonotype =
                parseFormatsList(await Downloader.downloadMonotypeLeadsFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download leads monotype formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }
        let listMeta: IFormat[];
        try {
            listMeta = parseFormatsList(await Downloader.downloadMetagameFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download metagame formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }
        let listMetaMonotype: IFormat[];
        try {
            listMetaMonotype =
                parseFormatsList(await Downloader.downloadMonotypeMetagameFormatsList(month.year, month.month));
        } catch (err) {
            Logger.getInstance().warning("Could not download metagame monotype formats list. (Connection issues?)");
            month.status = "pending";
            continue;
        }

        /* Formats processing */
        Logger.getInstance().info("[" + monthID + "] " + "Processing formats...");
        let stopped = false;
        for (const format of list) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processFormat(month, format);
        }
        for (const format of listMonotype) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processFormat(month, format, true);
        }
        for (const format of listLeads) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processLeadsFormat(month, format);
        }
        for (const format of listLeadsMonotype) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processLeadsFormat(month, format, true);
        }
        for (const format of listMeta) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processMetaFormat(month, format);
        }
        for (const format of listMetaMonotype) {
            if (StatsCrawler.status.disabled) {
                break;
            }
            if (stopped || month.status === "stopped") {
                stopped = true;
                break;
            }
            await processMetaFormat(month, format, true);
        }
        if (stopped) {
            Logger.getInstance().info("[" + monthID + "] " + "INTERRUPTED!");
            month.status = "stopped";
        } else if (StatsCrawler.status.disabled) {
            Logger.getInstance().info("[" + monthID + "] " + "INTERRUPTED!");
            month.status = "pending";
        } else {
            Logger.getInstance().info("[" + monthID + "] " + "COMPLETED!");
            month.status = "ready";
            month.visible = true;
        }
    }
    try {
        await StatsCrawler.saveMonths();
    } catch (err) {
        Logger.getInstance().error(err);
    }
}

/**
 * Format processing for pokemon, moves, items and abilities.
 * @param month     The month data.
 * @param format    The format data.
 * @param isMonotype It is true if the format is a monotype format.
 */
async function processFormat(month: IMonthStatus, format: IFormat, isMonotype?: boolean) {
    const monthID = month.year + "-" + addLeftZeros(month.month, 2);
    Logger.getInstance().info("[" + monthID + "] " + "Working with format "
        + format.id + " (" + format.baseline + ")");

    const formatsListPkm = new PokemonFormatsList(await Storage.get("stats.pokemon." + monthID));
    const formatsListMv = new MovesFormatsList(await Storage.get("stats.moves." + monthID));
    const formatsListItm = new ItemsFormatsList(await Storage.get("stats.items." + monthID));
    const formatsListAbl = new AbilitiesFormatsList(await Storage.get("stats.abilities." + monthID));

    let foundPkm = false;
    formatsListPkm.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            foundPkm = true;
        }
    });

    let foundMv = false;
    formatsListMv.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            foundMv = true;
        }
    });

    let foundItm = false;
    formatsListItm.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            foundItm = true;
        }
    });

    let foundAbl = false;
    formatsListAbl.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            foundAbl = true;
        }
    });

    Logger.getInstance().info("[" + monthID + "] [" + format.id
        + "-" + format.baseline + "] Downloading resources... ");

    let pokemonRankingTxt = "";
    if (!foundPkm) {
        try {
            if (isMonotype) {
                pokemonRankingTxt = await Downloader.downloadMonotypeFormatUsage(month.year,
                    month.month, format.name, format.baseline);
            } else {
                pokemonRankingTxt = await Downloader.downloadFormatUsage(month.year,
                    month.month, format.name, format.baseline);
            }
        } catch (err) {
            Logger.getInstance().info("[" + monthID + "] [" + format.id
                + "-" + format.baseline + "] Could not download ranking (Connection issues?)");
            return;
        }
    }

    let pokemonUsageTableTxt = "";
    if (!foundPkm) {
        try {
            if (isMonotype) {
                pokemonUsageTableTxt = await Downloader
                    .downloadMonotypeFormatUsageDataTable(month.year,
                        month.month, format.name, format.baseline);
            } else {
                pokemonUsageTableTxt = await Downloader.downloadFormatUsageDataTable(month.year,
                    month.month, format.name, format.baseline);
            }
        } catch (err) {
            Logger.getInstance().info("[" + monthID + "] [" + format.id
                + "-" + format.baseline + "] Could not download ud-table (Connection issues?)");
            return;
        }
    }

    let jsonPokemonUsageData = {};
    if (!foundMv || !foundItm || !foundAbl) {
        try {
            if (isMonotype) {
                jsonPokemonUsageData = JSON.parse(await Downloader
                    .downloadMonotypeFormatUsageData(month.year, month.month,
                        format.name, format.baseline));
            } else {
                jsonPokemonUsageData = JSON.parse(await Downloader
                    .downloadFormatUsageData(month.year, month.month,
                        format.name, format.baseline));
            }
        } catch (err) {
            Logger.getInstance().info("[" + monthID + "] [" + format.id
                + "-" + format.baseline + "] JSON-UD ERR: " + err.message);
            return;
        }
    }

    Logger.getInstance().info("[" + monthID + "] [" + format.id
        + "-" + format.baseline + "] Parsing... ");

    if (!foundPkm) {
        const formatData: IPokemonFormat = {
            avgwt: 0,
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            topPokemon: "",
            totalBattles: 0,
        };
        const ranking: PokemonRanking = parsePokemonRanking(pokemonRankingTxt);
        formatData.totalBattles = ranking.totalBattles;
        formatData.avgwt = ranking.avgWeightTeam;
        if (ranking.pokemon.length > 0) {
            formatData.topPokemon = ranking.pokemon[0].name;
        }
        await parseUsageDataTable(pokemonUsageTableTxt, (pokemonName, pokemonData) => {
            return new Promise((resolve) => {
                Storage.put("stats.pokemon." + monthID + "." + format.id + "."
                    + format.baseline + "." + pokemonName, pokemonData).then(() => {
                        resolve();
                    }).catch((err) => {
                        Logger.getInstance().error(err);
                        resolve();
                    });
            });
        });
        try {
            await Storage.put("stats.pokemon." + monthID + "."
                + format.id + "." + format.baseline, ranking);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsListPkm.formats.push(formatData);
        formatsListPkm.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.pokemon." + monthID, formatsListPkm);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Pokemon)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Pokemon)");
    }

    if (!foundMv) {
        const formatData: IMovesFormat = {
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            topMove: "",
            totalMoves: 0,
        };

        const moveRanking: MovesRanking = extractMovesRanking(jsonPokemonUsageData);
        formatData.totalMoves = moveRanking.totalMoves;
        if (moveRanking.moves.length > 0) {
            formatData.topMove = moveRanking.moves[0].name;
        }

        /*const moveData: MoveData[] = extractMoveUsageData(jsonPokemonUsageData);
        for (const move of moveData) {
            try {
                await Storage.put("stats.moves." + monthID + "."
                    + format.id + "." + format.baseline + "." + move.name, move);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/

        try {
            await Storage.put("stats.moves." + monthID + "."
                + format.id + "." + format.baseline, moveRanking);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsListMv.formats.push(formatData);
        formatsListMv.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.moves." + monthID, formatsListMv);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Moves)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Moves)");
    }

    if (!foundItm) {
        const formatData: IItemsFormat = {
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            topItem: "",
            totalItems: 0,
        };

        const itemsRanking: ItemsRanking = extractItemsRanking(jsonPokemonUsageData);
        formatData.totalItems = itemsRanking.totalItems;
        if (itemsRanking.items.length > 0) {
            formatData.topItem = itemsRanking.items[0].name;
        }

        /*const itemData: ItemData[] = extractItemUsageData(jsonPokemonUsageData);
        for (const item of itemData) {
            try {
                await Storage.put("stats.items." + monthID + "."
                    + format.id + "." + format.baseline + "." + item.name, item);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/

        try {
            await Storage.put("stats.items." + monthID + "."
                + format.id + "." + format.baseline, itemsRanking);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsListItm.formats.push(formatData);
        formatsListItm.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.items." + monthID, formatsListItm);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Items)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Items)");
    }

    if (!foundAbl) {
        const formatData: IAbilitiesFormat = {
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            topAbility: "",
            totalAbilities: 0,
        };

        const abilityRanking: AbilitiesRanking = extractAbilitiesRanking(jsonPokemonUsageData);
        formatData.totalAbilities = abilityRanking.totalAbilities;
        if (abilityRanking.abilities.length > 0) {
            formatData.topAbility = abilityRanking.abilities[0].name;
        }

        /*const abilityData: AbilityData[] = extractAbilityUsageData(jsonPokemonUsageData);
        for (const ability of abilityData) {
            try {
                await Storage.put("stats.abilities." + monthID + "."
                    + format.id + "." + format.baseline + "." + ability.name, ability);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/

        try {
            await Storage.put("stats.abilities." + monthID + "."
                + format.id + "." + format.baseline, abilityRanking);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsListAbl.formats.push(formatData);
        formatsListAbl.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.abilities." + monthID, formatsListAbl);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Abilities)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Abilities)");
    }
}

/**
 * Format processing for leads.
 * @param month     The month data.
 * @param format    The format data.
 * @param isMonotype It is true if the format is a monotype format.
 */
async function processLeadsFormat(month: IMonthStatus, format: IFormat, isMonotype?: boolean) {
    const monthID = month.year + "-" + addLeftZeros(month.month, 2);
    Logger.getInstance().info("[" + monthID + "] [" + format.id
        + "-" + format.baseline + "] Getting leads stats...");

    const formatsList = new LeadsFormatsList(await Storage.get("stats.leads." + monthID));

    let found = false;
    formatsList.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            found = true;
        }
    });

    if (!found) {
        let leadsTxt;
        try {
            if (isMonotype) {
                leadsTxt = await Downloader.downloadMonotypeLeads(month.year,
                    month.month, format.name, format.baseline);
            } else {
                leadsTxt = await Downloader.downloadLeads(month.year,
                    month.month, format.name, format.baseline);
            }
        } catch (err) {
            Logger.getInstance().info("[" + monthID + "] [" + format.id
                + "-" + format.baseline + "] Could not download leads (Connection issues?)");
            return;
        }

        const formatData: ILeadsFormat = {
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            topLead: "",
            totalLeads: 0,
        };

        const leadsRanking: LeadsRanking = parseLeadsRanking(leadsTxt);
        formatData.totalLeads = leadsRanking.totalLeads;
        if (leadsRanking.leads.length > 0) {
            formatData.topLead = leadsRanking.leads[0].name;
        }

        try {
            await Storage.put("stats.leads." + monthID + "."
                + format.id + "." + format.baseline, leadsRanking);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsList.formats.push(formatData);
        formatsList.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.leads." + monthID, formatsList);
        } catch (err) {
            Logger.getInstance().error(err);
        }

        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Leads)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Leads)");
    }
}

/**
 * Format processing for metagame stats.
 * @param month     The month data.
 * @param format    The format data.
 * @param isMonotype It is true if the format is a monotype format.
 */
async function processMetaFormat(month: IMonthStatus, format: IFormat, isMonotype?: boolean) {
    const monthID = month.year + "-" + addLeftZeros(month.month, 2);
    Logger.getInstance().info("[" + monthID + "] [" + format.id
        + "-" + format.baseline + "] Getting metagame stats...");

    const formatsList = new MetagameFormatsList(await Storage.get("stats.meta." + monthID));

    let found = false;
    formatsList.formats.forEach((f) => {
        if (f.id === format.id && f.baseline === format.baseline) {
            found = true;
        }
    });

    if (!found) {
        let metagameTxt;
        try {
            if (isMonotype) {
                metagameTxt = await Downloader.downloadMonotypeMetagameInfo(month.year,
                    month.month, format.name, format.baseline);
            } else {
                metagameTxt = await Downloader.downloadMetagameInfo(month.year,
                    month.month, format.name, format.baseline);
            }
        } catch (err) {
            Logger.getInstance().info("[" + monthID + "] [" + format.id
                + "-" + format.baseline + "] Could not download mg-info (Connection issues?)");
            return;
        }

        const formatData: IMetagameFormat = {
            baseline: format.baseline,
            id: format.id,
            name: format.name,
            stalliness: 0,
            topStyle: "",
        };

        const metagameInfo: FormatMetagame = parseMetagameInformation(metagameTxt);
        formatData.stalliness = metagameInfo.meanStalliness;
        if (metagameInfo.playstyles.length > 0) {
            formatData.topStyle = metagameInfo.playstyles[0].name;
        }

        try {
            await Storage.put("stats.meta." + monthID + "."
                + format.id + "." + format.baseline, metagameInfo);
        } catch (err) {
            Logger.getInstance().error(err);
        }
        formatsList.formats.push(formatData);
        formatsList.formats.sort((a, b) => {
            return a.id.localeCompare(b.id) || (a.baseline < b.baseline ? -1 : 1);
        });
        try {
            await Storage.put("stats.meta." + monthID, formatsList);
        } catch (err) {
            Logger.getInstance().error(err);
        }

        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] DONE (Metagame)");
    } else {
        Logger.getInstance().info("[" + monthID + "] [" + format.id
            + "-" + format.baseline + "] SKIP (Metagame)");
    }
}

/**
 * Deletes all the data of a month.
 * @param month     The month to detele.
 */
async function deleteMonthData(month: IMonthStatus) {
    month.status = "deleting";
    try {
        await StatsCrawler.saveMonths();
    } catch (err) {
        Logger.getInstance().error(err);
    }

    const monthID = month.year + "-" + addLeftZeros(month.month, 2);
    Logger.getInstance().info("[" + monthID + "] " + "Deleting month data...");
    const formatsListPkm = new PokemonFormatsList(await Storage.get("stats.pokemon." + monthID));
    const formatsListMv = new MovesFormatsList(await Storage.get("stats.moves." + monthID));
    const formatsListItm = new ItemsFormatsList(await Storage.get("stats.items." + monthID));
    const formatsListAbl = new AbilitiesFormatsList(await Storage.get("stats.abilities." + monthID));
    const formatsListLeads = new LeadsFormatsList(await Storage.get("stats.leads." + monthID));
    const formatsListMeta = new MetagameFormatsList(await Storage.get("stats.meta." + monthID));

    /* Remove pokemon stats */
    for (const format of formatsListPkm.formats) {
        const ranking = new PokemonRanking(await Storage.get("stats.pokemon."
            + monthID + format.id + "." + format.baseline));
        for (const pokemon of ranking.pokemon) {
            try {
                await Storage.remove("stats.pokemon." + monthID
                    + format.id + "." + format.baseline + "." + pokemon.name);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }
        try {
            await Storage.remove("stats.pokemon." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.pokemon." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    /* Remove moves stats */
    for (const format of formatsListMv.formats) {
        const ranking = new MovesRanking(await Storage.get("stats.moves."
            + monthID + format.id + "." + format.baseline));
        /*for (const move of ranking.moves) {
            try {
                await Storage.remove("stats.moves." + monthID
                    + format.id + "." + format.baseline + "." + move.name);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/
        try {
            await Storage.remove("stats.moves." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.moves." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    /* Remove items stats */
    for (const format of formatsListItm.formats) {
        const ranking = new ItemsRanking(await Storage.get("stats.items."
            + monthID + format.id + "." + format.baseline));
        /*for (const item of ranking.items) {
            try {
                await Storage.remove("stats.items." + monthID
                    + format.id + "." + format.baseline + "." + item.name);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/
        try {
            await Storage.remove("stats.items." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.items." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    /* Remove abilities stats */
    for (const format of formatsListAbl.formats) {
        const ranking = new AbilitiesRanking(await Storage.get("stats.abilities."
            + monthID + format.id + "." + format.baseline));
        /*for (const ability of ranking.abilities) {
            try {
                await Storage.remove("stats.abilities." + monthID
                    + format.id + "." + format.baseline + "." + ability.name);
            } catch (err) {
                Logger.getInstance().error(err);
            }
        }*/
        try {
            await Storage.remove("stats.abilities." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.abilities." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    /* Remove leads stats */
    for (const format of formatsListLeads.formats) {
        try {
            await Storage.remove("stats.leads." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.leads." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    /* Remove metagame stats */
    for (const format of formatsListMeta.formats) {
        try {
            await Storage.remove("stats.meta." + monthID
                + format.id + "." + format.baseline);
        } catch (err) {
            Logger.getInstance().error(err);
        }
    }

    try {
        await Storage.remove("stats.meta." + monthID);
    } catch (err) {
        Logger.getInstance().error(err);
    }

    Logger.getInstance().info("[" + monthID + "] " + "DONE: Deleted month.");
    month.status = "deleted";
    month.visible = false;
}

/**
 * Schedules the next tick.
 */
function scheduleNextTick() {
    setTimeout(() => {
        nextTick();
    }, CRAWLER_DELAY);
}

/**
 * Does the next tick.
 */
function nextTick() {
    if (StatsCrawler.status.disabled) {
        scheduleNextTick();
        return;
    }
    crawler().then(() => {
        scheduleNextTick();
    }).catch((err) => {
        Logger.getInstance().error(err);
        scheduleNextTick();
    });
}

/**
 * Represents the crawler status.
 */
interface ICrawlerStatus {
    disabled: boolean;
}

/**
 * Smogon usage stats crawler.
 */
export class StatsCrawler {
    public static lastCheck: number = 0;
    public static months: object = {};
    public static status: ICrawlerStatus = {
        disabled: false,
    };

    /**
     * Starts the crawler.
     */
    public static start() {
        Storage.get("crawler.status").then((resultStatus) => {
            StatsCrawler.status = resultStatus || { disabled: false };
            Storage.get("stats.months").then((result) => {
                StatsCrawler.months = result || {};
                Object.values(StatsCrawler.months).forEach((month) => {
                    if (month.status === "working") {
                        month.status = "pending";
                    }
                    if (month.status === "deleting") {
                        month.status = "delete";
                    }
                });
                nextTick();
            });
        });
    }

    /**
     * Saves the months list.
     */
    public static saveMonths(): Promise<void> {
        return new Promise((resolve, reject) => {
            Storage.put("stats.months", StatsCrawler.months).then(() => {
                process.send({ type: "reload-months" });
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Saves the status.
     */
    public static saveStatus(): Promise<void> {
        return new Promise((resolve, reject) => {
            Storage.put("crawler.status", StatsCrawler.status).then(() => {
                process.send({ type: "reload-crawler-status" });
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Enables the crawler.
     */
    public static enable() {
        StatsCrawler.status.disabled = false;
        StatsCrawler.saveStatus().then(() => {
            Logger.getInstance().info("Crawler enabled.");
        }).catch((err) => {
            Logger.getInstance().error(err);
        });
    }

    /**
     * Disables the crawler.
     */
    public static disable() {
        StatsCrawler.status.disabled = true;
        StatsCrawler.saveStatus().then(() => {
            Logger.getInstance().info("Crawler disabled.");
        }).catch((err) => {
            Logger.getInstance().error(err);
        });
    }
}

process.on("message", (message) => {
    if (message.type === "crawler") {
        switch (message.action) {
            case "enable":
                StatsCrawler.enable();
                break;
            case "disable":
                StatsCrawler.disable();
                break;
            case "pending":
                if (StatsCrawler.months[message.month]) {
                    if (StatsCrawler.months[message.month].status !== "working"
                        && StatsCrawler.months[message.month].status !== "deleting") {
                        StatsCrawler.months[message.month].status = "pending";
                    }
                }
                StatsCrawler.saveMonths();
                break;
            case "show":
                if (StatsCrawler.months[message.month]) {
                    StatsCrawler.months[message.month].visible = true;
                }
                StatsCrawler.saveMonths();
                break;
            case "hide":
                if (StatsCrawler.months[message.month]) {
                    StatsCrawler.months[message.month].visible = false;
                }
                StatsCrawler.saveMonths();
                break;
            case "stop":
                if (StatsCrawler.months[message.month]) {
                    StatsCrawler.months[message.month].status = "stopped";
                }
                StatsCrawler.saveMonths();
                break;
            case "delete":
                if (StatsCrawler.months[message.month]) {
                    if (StatsCrawler.months[message.month].status !== "working"
                        && StatsCrawler.months[message.month].status !== "deleting") {
                        StatsCrawler.months[message.month].status = "delete";
                    }
                }
                StatsCrawler.saveMonths();
                break;
        }
    }
});
