/**
 * Smogon usage stats API
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { AbilityData } from "../model/data-ability";
import { ItemData } from "../model/data-item";
import { MoveData } from "../model/data-move";
import { PokemonData } from "../model/data-pokemon";
import { FormatMetagame } from "../model/format-metagame";
import { AbilitiesFormatsList } from "../model/formats-list-abilities";
import { ItemsFormatsList } from "../model/formats-list-items";
import { LeadsFormatsList } from "../model/formats-list-leads";
import { MetagameFormatsList } from "../model/formats-list-metagame";
import { MovesFormatsList } from "../model/formats-list-moves";
import { PokemonFormatsList } from "../model/formats-list-pokemon";
import { IMonthStatus } from "../model/interfaces";
import { AbilitiesRanking } from "../model/ranking-abilities";
import { ItemsRanking } from "../model/ranking-items";
import { LeadsRanking } from "../model/ranking-leads";
import { MovesRanking } from "../model/ranking-moves";
import { PokemonRanking } from "../model/ranking-pokemon";
import { Storage } from "../storage/storage";
import { addLeftZeros } from "../utils/text-utils";

/**
 * Smogon stats API.
 * Obtains usage stats from the storage system.
 */
export class SmogonStatsAPI {

    /**
     * Obtains the months list.
     */
    public static getMonths(): Promise<IMonthStatus[]> {
        return new Promise((resolve) => {
            Storage.get("stats.months").then((value) => {
                const result = [];
                if (value) {
                    for (const k in value) {
                        if (value[k].visible) {
                            result.push(value[k]);
                        }
                    }
                }
                resolve(result);
            });
        });
    }

    /**
     * Obtains the default month in case it is not specified.
     * (The default month is the latest month)
     * @param months    Months list.
     * @returns         The default month.
     */
    public static getDefaultMonth(months: IMonthStatus[]): IMonthStatus {
        let result: IMonthStatus = null;
        let maxMID = -1;
        for (const month of months) {
            if (result === null || maxMID < month.mid) {
                result = month;
                maxMID = result.mid;
            }
        }
        if (result === null) {
            const date = new Date();
            result = {
                mid: 0,
                month: date.getMonth() + 1,
                status: "unknown",
                visible: true,
                year: date.getFullYear(),
            };
        }
        return result;
    }

    /**
     * Obtains the formats list for the "Pokemon stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsPokemon(year: number, month: number): Promise<PokemonFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.pokemon." + toMonthID(year, month)).then((value) => {
                resolve(new PokemonFormatsList(value));
            });
        });
    }

    /**
     * Obtains the formats list for the "Moves stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsMoves(year: number, month: number): Promise<MovesFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.moves." + toMonthID(year, month)).then((value) => {
                resolve(new MovesFormatsList(value));
            });
        });
    }

    /**
     * Obtains the formats list for the "Items stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsItems(year: number, month: number): Promise<ItemsFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.items." + toMonthID(year, month)).then((value) => {
                resolve(new ItemsFormatsList(value));
            });
        });
    }

    /**
     * Obtains the formats list for the "Abilities stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsAbilities(year: number, month: number): Promise<AbilitiesFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.abilities." + toMonthID(year, month)).then((value) => {
                resolve(new AbilitiesFormatsList(value));
            });
        });
    }

    /**
     * Obtains the formats list for the "Leads stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsLeads(year: number, month: number): Promise<LeadsFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.leads." + toMonthID(year, month)).then((value) => {
                resolve(new LeadsFormatsList(value));
            });
        });
    }

    /**
     * Obtains the formats list for the "Metagame stats" feature.
     * @param year  Year number.
     * @param month Month number (1-12).
     */
    public static getFormatsMetagame(year: number, month: number): Promise<MetagameFormatsList> {
        return new Promise((resolve) => {
            Storage.get("stats.meta." + toMonthID(year, month)).then((value) => {
                resolve(new MetagameFormatsList(value));
            });
        });
    }

    /**
     * Obtains the default baseline for a format.
     * @param baselines     Available baselines.
     * @returns             The default baseline.
     */
    public static getDefaultBaseline(baselines: number[]): number {
        let baseline = -1;
        for (const b of baselines) {
            if (baseline === -1 || (baseline <= 1500 && b > 1500)) {
                baseline = b;
            }
        }
        return baseline;
    }

    /**
     * Obtains the available baselines for a format.
     * (Pokemon stats feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static getBaselinesPkmn(year: number, month: number,
                                   format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsPokemon(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the available baselines for a format.
     * (Moves stats feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static getBaselinesMvs(year: number, month: number,
                                  format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsMoves(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the available baselines for a format.
     * (Items stats feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static getbaselinesItms(year: number, month: number,
                                   format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsItems(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the available baselines for a format.
     * (Abilities stats feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static getBaselinesAbl(year: number, month: number,
                                  format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsAbilities(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the available baselines for a format.
     * (Leads stats feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static getBaselinesLeads(year: number, month: number,
                                    format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsLeads(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the available baselines for a format.
     * (Metagame feature)
     * @param year    Year number.
     * @param month   Month number (1-12).
     * @param format  Format identifier.
     */
    public static gettBaselinesMeta(year: number, month: number,
                                    format: string): Promise<number[]> {
        return new Promise((resolve) => {
            SmogonStatsAPI.getFormatsMetagame(year, month).then((list) => {
                const baselines = [];
                list.formats.forEach((fmat) => {
                    if (fmat.id === format) {
                        baselines.push(fmat.baseline);
                    }
                });
                resolve(baselines);
            });
        });
    }

    /**
     * Obtains the pokemon ranking for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getPokemonRanking(year: number, month: number,
                                    format: string, baseline: number): Promise<PokemonRanking> {
        return new Promise((resolve) => {
            Storage.get("stats.pokemon." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new PokemonRanking(value));
                });
        });
    }

    /**
     * Obtains the moves ranking for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getMovesRanking(year: number, month: number,
                                  format: string, baseline: number): Promise<MovesRanking> {
        return new Promise((resolve) => {
            Storage.get("stats.moves." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new MovesRanking(value));
                });
        });
    }

    /**
     * Obtains the items ranking for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getItemsRanking(year: number, month: number,
                                  format: string, baseline: number): Promise<ItemsRanking> {
        return new Promise((resolve) => {
            Storage.get("stats.items." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new ItemsRanking(value));
                });
        });
    }

    /**
     * Obtains the abilities ranking for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getAbilitiesRanking(year: number, month: number,
                                      format: string, baseline: number): Promise<AbilitiesRanking> {
        return new Promise((resolve) => {
            Storage.get("stats.abilities." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new AbilitiesRanking(value));
                });
        });
    }

    /**
     * Obtains the leads ranking for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getLeadsRanking(year: number, month: number,
                                  format: string, baseline: number): Promise<LeadsRanking> {
        return new Promise((resolve) => {
            Storage.get("stats.leads." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new LeadsRanking(value));
                });
        });
    }

    /**
     * Obtains the metagame stats for a format.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     */
    public static getMetagameStats(year: number, month: number,
                                   format: string, baseline: number): Promise<FormatMetagame> {
        return new Promise((resolve) => {
            Storage.get("stats.meta." + toMonthID(year, month)
                + "." + format + "." + baseline).then((value) => {
                    resolve(new FormatMetagame(value));
                });
        });
    }

    /**
     * Obtains tha usage data for a pokemon.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     * @param target    Target pokemon.
     */
    public static getPokemonData(year: number, month: number, format: string,
                                 baseline: number, target: string): Promise<PokemonData> {
        return new Promise((resolve) => {
            Storage.get("stats.pokemon." + toMonthID(year, month) + "." + format
                + "." + baseline + "." + target).then((value) => {
                    resolve(new PokemonData(value));
                });
        });
    }

    /**
     * Obtains tha usage data for a move.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     * @param target    Target move.
     */
    public static getMoveData(year: number, month: number, format: string,
                              baseline: number, target: string): Promise<MoveData> {
        return new Promise((resolve) => {
            Storage.get("stats.moves." + toMonthID(year, month) + "." + format
                + "." + baseline + "." + target).then((value) => {
                    resolve(new MoveData(value));
                });
        });
    }

    /**
     * Obtains tha usage data for an item.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     * @param target    Target item.
     */
    public static getItemData(year: number, month: number, format: string,
                              baseline: number, target: string): Promise<ItemData> {
        return new Promise((resolve) => {
            Storage.get("stats.items." + toMonthID(year, month) + "." + format
                + "." + baseline + "." + target).then((value) => {
                    resolve(new ItemData(value));
                });
        });
    }

    /**
     * Obtains tha usage data for an ability.
     * @param year      Year number.
     * @param month     Month number (1-12).
     * @param format    Format identifier.
     * @param baseline  Ranking baseline.
     * @param target    Target ability.
     */
    public static getAbilityData(year: number, month: number, format: string,
                                 baseline: number, target: string): Promise<AbilityData> {
        return new Promise((resolve) => {
            Storage.get("stats.abilities." + toMonthID(year, month) + "." + format
                + "." + baseline + "." + target).then((value) => {
                    resolve(new AbilityData(value));
                });
        });
    }
}

/**
 * Creates a month identifier.
 * @param year  Year number.
 * @param month Month number (1-12).
 * @returns     The month identifier as yyyy-MM.
 */
function toMonthID(year: number, month: number) {
    return (year + "-" + addLeftZeros(month, 2));
}
