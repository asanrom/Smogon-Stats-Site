/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Items usage ranking.
 */

"use strict";

import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { getItemName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { toId } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class RankingItemsPG implements IPageGenerator {

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

        if (formatRanking) {
            /* Title */
            print("<div class=\"container padded\" style=\"text-align: center;\">");
            print("<h3 align=\"center\">" + getFormatName(data.format)
                + " - " + data.baseline + "</h3>");

            /* Format stats */
            print("<p><b>" + language.getText("rank.items.total") + ":</b> "
                + Math.floor(formatRanking.totalItems) + "</p>");
            print("</div>");

            print("<div class=\"main-table-container\">");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            /* Table head */
            print("<thead><tr>");
            print("<th class=\"mid-screen\" width=\"3rem\">#</th>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<div class=\"item-icon\" style=\"" + Sprites.getItemIcon("") + "\"></div></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("rank.items.item") + "</th>");
            print("<th>" + language.getText("rank.items.usage") + " %</th>");
            print("<th class=\"mid-screen\">" + language.getText("rank.items.raw") + "</th>");
            print("</tr></thead>");
            /* Table body */
            print("<tbody>");
            for (const item of formatRanking.items) {
                print("<tr><td class=\"mid-screen\"><b>" + item.pos + "</b></td>");
                print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<div class=\"item-icon\" style=\"" + Sprites.getItemIcon(item.name) + "\"></div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">" + "<a href=\""
                    + this.getTargetURL(item.name)
                    + "\" target=\"_blank\"><b>" + getItemName(item.name) + "</b></a></td>");
                print("<td><b>" + this.prettyPercent(item.usage) + "</b></td>");
                print("<td class=\"mid-screen\">" + Math.floor(item.raw) + "</td>");
                print("</tr>");
            }
            print("</tbody></table></div>");
        }
    }

    private getTargetURL(target: string): string {
        return "https://dex.pokemonshowdown.com/items/" + toId(target);
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
}
