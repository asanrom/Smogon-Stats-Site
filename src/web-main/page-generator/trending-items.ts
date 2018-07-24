/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Items usage ranking.
 */

"use strict";

import { IItemUsage } from "../../model/interfaces";
import { ItemsRanking } from "../../model/ranking-items";
import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { getItemName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros, toId } from "../../utils/text-utils";
import { getMonth } from "../../utils/time-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class TrendingItemsPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        const formatRanking = data.statsData.rankingItems;
        const prevRanking = data.previusMonth.rankingItems;

        if (formatRanking && prevRanking) {
            /* Title */
            print("<div class=\"container padded txtcenter\">");
            print("<h3 align=\"center\">" + getFormatName(data.format)
                + " - " + data.baseline + "</h3>");
            if (data.statsData.baselines) {
                print("<p>");
                for (const baseline of data.statsData.baselines) {
                    if (baseline === data.baseline) {
                        print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                            + " mdl-button--raised mdl-button--colored\" disabled>"
                            + baseline + "</button>");
                    } else {
                        print("<a href=\"" + this.getBaselineURL(data, baseline) + "\">");
                        print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                            + " mdl-button--raised mdl-button--colored\">"
                            + baseline + "</button>");
                        print("</a>");
                    }
                }
                print("</p>");
            }
            print("<p>");
            print("<a href=\"" + this.getRankingURL(data) + "\">");
            print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                + " mdl-button--raised mdl-button--accent\">"
                + language.getText("format.ranking") + "</button>");
            print("</a>");
            print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                + " mdl-button--raised mdl-button--accent\" disabled>"
                + language.getText("format.trending") + "</button>");
            print("</p>");

            if (data.previusMonth.month) {
                const month1 = language.getText("header.short-title", {
                    month: language.getText("months." + getMonth(data.previusMonth.month.month)),
                    year: (data.previusMonth.month.year || 0),
                });
                const month2 = language.getText("header.short-title", {
                    month: language.getText("months." + getMonth(data.month)),
                    year: (data.year || 0),
                });
                print("<p><b>" + month1 + "</b> \u2192 <b>" + month2 + "</b></p>");
            }
            print("</div>");

            print("<div class=\"main-table-container\">");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            /* Table head */
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<div class=\"item-icon\" style=\"" + Sprites.getItemIcon("") + "\"></div></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("rank.items.item") + "</th>");
            print("<th class=\"mid-screen\">#</th>");
            print("<th class=\"mid-screen\">" + language.getText("rank.items.usage") + "</th>");
            print("<th>\u2206 " + language.getText("rank.items.usage") + "</th>");
            print("</tr></thead>");
            /* Table body */
            print("<tbody>");
            for (const item of formatRanking.items) {
                const prevItem = this.searchItem(prevRanking, item.name);
                print("<tr><td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<div class=\"item-icon\" style=\"" + Sprites.getItemIcon(item.name) + "\"></div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">" + "<a href=\""
                    + this.getTargetURL(item.name) + "\" target=\"_blank\"><b>"
                    + getItemName(item.name) + "</b></a></td>");
                if (prevItem) {
                    print("<td class=\"mid-screen " + this.getSigClass(item.pos - prevItem.pos)
                        + "\">" + prevItem.pos + " \u2192 " + item.pos + "</td>");
                    print("<td class=\"mid-screen " + this.getSigClass(item.usage - prevItem.usage)
                        + "\"><b>" + this.prettyPercent(prevItem.usage) + " \u2192 "
                        + this.prettyPercent(item.usage) + "</b></td>");
                    print("<td class=\"" + this.getSigClass(item.usage - prevItem.usage)
                        + "\"><b>" + this.prettyPercentSig(item.usage - prevItem.usage) + "</b></td>");
                } else {
                    print("<td class=\"mid-screen\">" + "???" + " \u2192 " + item.pos + "</td>");
                    print("<td class=\"mid-screen\"><b>" + "???" + " \u2192 "
                        + this.prettyPercent(item.usage) + "</b></td>");
                    print("<td><b>" + "???" + "</b></td>");
                }
                print("</tr>");
            }
            print("</tbody></table></div>");

            print("<div class=\"container padded txtcenter\">");
            print("<p><b>" + language.getText("rank.items.total") + ":</b> "
                + Math.floor(prevRanking.totalItems) + " \u2192 "
                + Math.floor(formatRanking.totalItems) + "</p>");
            print("</div>");
        }
    }

    private searchItem(ranking: ItemsRanking, itemId: string): IItemUsage {
        for (const item of ranking.items) {
            if (item.name === itemId) {
                return item;
            }
        }
    }

    private getSigClass(num: number): string {
        if (num < 0) {
            return "negative";
        } else if (num > 0) {
            return "positive";
        } else {
            return "zero";
        }
    }

    private getTargetURL(target: string): string {
        return "https://dex.pokemonshowdown.com/items/" + toId(target);
    }

    private getBaselineURL(data: IGenerationData, baseline: number): string {
        let url = "/" + (data.feature || "items");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        if (data.format) {
            url += "/" + data.format + "/" + baseline + "/trending";
        }
        return url;
    }

    private getRankingURL(data: IGenerationData): string {
        let url = "/" + data.feature;
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        return url;
    }

    private prettyPercent(percent: number): string {
        const p = Math.floor(percent * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 3) {
            d += "0";
        }
        return e + "." + d + "%";
    }

    private prettyPercentSig(percent: number): string {
        let sig = "+";
        if (percent < 0) {
            sig = "-";
            percent = Math.abs(percent);
        }
        const p = Math.floor(percent * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 3) {
            d += "0";
        }
        return sig + e + "." + d + "%";
    }
}
