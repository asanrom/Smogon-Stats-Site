/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Pokemon usage ranking.
 */

"use strict";

import { IPokemonFormat } from "../../model/interfaces";
import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { getItemName, getPokemonName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros, escapeHTML, toId } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class RankingPokemonPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        const formatRanking = data.statsData.rankingPokemon;

        if (formatRanking) {
            /* Title */
            print("<div class=\"container padded\" style=\"text-align: center;\">");
            print("<h3 align=\"center\">" + getFormatName(data.format)
                + " - " + data.baseline + "</h3>");

            /* Format stats */
            print("<p><b>" + language.getText("rank.pokemon.total") + ":</b> "
                + formatRanking.totalBattles + "</p>");
            print("<p><b>" + language.getText("rank.pokemon.avg") + ":</b> "
                + formatRanking.avgWeightTeam + "</p>");
            print("</div>");

            print("<table class=\"container main-table mdl-data-table mdl-js-data-table\">");
            /* Table head */
            print("<thead><tr>");
            print("<th class=\"mid-screen\" width=\"3rem\">#</th>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon("") + "\"></div></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("rank.pokemon.pokemon") + "</th>");
            print("<th>" + language.getText("rank.pokemon.usage") + " %</th>");
            print("<th class=\"mid-screen\">" + language.getText("rank.pokemon.raw") + "</th>");
            print("<th class=\"mid-screen\">" + language.getText("rank.pokemon.raw") + " %</th>");
            print("<th class=\"large-screen\">" + language.getText("rank.pokemon.real") + "</th>");
            print("<th class=\"large-screen\">" + language.getText("rank.pokemon.real") + " %</th>");
            print("</tr></thead>");
            /* Table body */
            print("<tbody>");
            for (const pokemon of formatRanking.pokemon) {
                print("<tr><td class=\"mid-screen\"><b>" + pokemon.pos + "</b></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon(pokemon.name)
                    + "\"></div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">" + "<a href=\""
                    + this.getTargetURL(data, pokemon.name)
                    + "\"><b>" + getPokemonName(pokemon.name) + "</b></a></td>");
                print("<td><b>" + this.prettyPercent(pokemon.usage) + "</b></td>");
                print("<td class=\"mid-screen\">" + pokemon.raw + "</td>");
                print("<td class=\"mid-screen\">" + this.prettyPercent(pokemon.rawp) + "</td>");
                print("<td class=\"large-screen\">" + pokemon.real + "</td>");
                print("<td class=\"large-screen\">" + this.prettyPercent(pokemon.realp) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");
        }
    }

    private getTargetURL(data: IGenerationData, target: string): string {
        let url = "/" + (data.feature || "pokemon");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        url += "/" + target;
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
}
