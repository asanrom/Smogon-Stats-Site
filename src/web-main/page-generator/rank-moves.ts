/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Moves usage ranking.
 */

"use strict";

import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { PokemonData } from "../../utils/pokemon-data";
import { getMovesName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros, escapeHTML, toId } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class RankingMovesPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        const formatRanking = data.statsData.rankingMoves;

        if (formatRanking) {
            /* Title */
            print("<div class=\"container padded\" style=\"text-align: center;\">");
            print("<h3 align=\"center\">" + getFormatName(data.format)
                + " - " + data.baseline + "</h3>");

            /* Format stats */
            print("<p><b>" + language.getText("rank.moves.total") + ":</b> "
                + Math.floor(formatRanking.totalMoves) + "</p>");
            print("</div>");

            print("<div class=\"main-table-container\">");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            /* Table head */
            print("<thead><tr>");
            print("<th class=\"mid-screen\" width=\"3rem\">#</th>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<img class=\"type-image\" src=\"" + Sprites.getTypeIcon("") + "\" /></div></th>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<img class=\".caregory-image\" src=\"" + Sprites.getCategoryIcon("") + "\" /></div></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("rank.moves.move") + "</th>");
            print("<th>" + language.getText("rank.moves.usage") + " %</th>");
            print("<th class=\"large-screen\">" + language.getText("rank.moves.raw") + "</th>");
            print("</tr></thead>");
            /* Table body */
            print("<tbody>");
            for (const move of formatRanking.moves) {
                const moveData = PokemonData.getMoves()[move.name] || {};
                print("<tr><td class=\"mid-screen\"><b>" + move.pos + "</b></td>");
                print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<img class=\"type-image\" src=\"" + Sprites.getTypeIcon(moveData.type)
                    + "\" /></div></td>");
                print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<img class=\".caregory-image\" src=\"" + Sprites.getCategoryIcon(moveData.category)
                    + "\" /></div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">" + "<a href=\""
                    + this.getTargetURL(move.name)
                    + "\" target=\"_blank\"><b>" + getMovesName(move.name) + "</b></a></td>");
                print("<td><b>" + this.prettyPercent(move.usage) + "</b></td>");
                print("<td class=\"large-screen\">" + Math.floor(move.raw) + "</td>");
                print("</tr>");
            }
            print("</tbody></table></div>");
        }
    }

    private getTargetURL(target: string): string {
        return "https://dex.pokemonshowdown.com/moves/" + toId(target);
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
