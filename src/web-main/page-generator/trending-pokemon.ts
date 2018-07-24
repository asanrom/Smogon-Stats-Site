/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Pokemon usage trending.
 */

"use strict";

import { IPokemonUsage } from "../../model/interfaces";
import { PokemonRanking } from "../../model/ranking-pokemon";
import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { getPokemonName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros } from "../../utils/text-utils";
import { getMonth } from "../../utils/time-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class TrendingPokemonPG implements IPageGenerator {

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
        const prevRanking = data.previusMonth.rankingPokemon;

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
            // \u2206
            // \u2192
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon("") + "\"></div></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("rank.pokemon.pokemon") + "</th>");
            print("<th class=\"mid-screen\">#</th>");
            print("<th class=\"mid-screen\">" + language.getText("rank.pokemon.usage") + " %</th>");
            print("<th>\u2206 " + language.getText("rank.pokemon.usage") + "</th>");
            print("<th class=\"large-screen\">\u2206 " + language.getText("rank.pokemon.raw") + "</th>");
            print("<th class=\"large-screen\">\u2206 " + language.getText("rank.pokemon.real") + "</th>");
            print("</tr></thead>");
            /* Table body */
            print("<tbody>");
            for (const pokemon of formatRanking.pokemon) {
                const prevPoke = this.searchPokemon(prevRanking, pokemon.name);
                print("<tr><td class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon(pokemon.name)
                    + "\"></div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">" + "<a href=\""
                    + this.getTargetURL(data, pokemon.name)
                    + "\"><b>" + getPokemonName(pokemon.name) + "</b></a></td>");
                if (prevPoke) {
                    print("<td class=\"mid-screen " + this.getSigClass(pokemon.pos - prevPoke.pos)
                        + "\">" + prevPoke.pos + " \u2192 " + pokemon.pos + "</td>");
                    print("<td class=\"mid-screen " + this.getSigClass(pokemon.usage - prevPoke.usage)
                        + "\"><b>" + this.prettyPercent(prevPoke.usage) + " \u2192 "
                        + this.prettyPercent(pokemon.usage) + "</b></td>");
                    print("<td class=\"" + this.getSigClass(pokemon.usage - prevPoke.usage)
                        + "\"><b>" + this.prettyPercentSig(pokemon.usage - prevPoke.usage) + "</b></td>");
                    print("<td class=\"large-screen " + this.getSigClass(pokemon.rawp - prevPoke.rawp)
                        + "\">" + this.prettyPercentSig(pokemon.rawp - prevPoke.rawp) + "</td>");
                    print("<td class=\"large-screen " + this.getSigClass(pokemon.realp - prevPoke.realp)
                        + "\">" + this.prettyPercentSig(pokemon.realp - prevPoke.realp) + "</td>");
                } else {
                    print("<td class=\"mid-screen\">" + "???" + " \u2192 " + pokemon.pos + "</td>");
                    print("<td class=\"mid-screen\"><b>" + "???" + " \u2192 "
                        + this.prettyPercent(pokemon.usage) + "</b></td>");
                    print("<td><b>" + "???" + "</b></td>");
                    print("<td class=\"large-screen\">" + "???" + "</td>");
                    print("<td class=\"large-screen\">" + "???" + "</td>");
                }
                print("</tr>");
            }
            print("</tbody></table></div>");

            print("<div class=\"container padded txtcenter\">");
            print("<p><b>" + language.getText("rank.pokemon.total") + ":</b> "
                + Math.floor(prevRanking.totalBattles) + " \u2192 "
                + Math.floor(formatRanking.totalBattles) + "</p>");
            print("<p><b>" + language.getText("rank.pokemon.avg") + ":</b> "
                + this.prettyDecimal(prevRanking.avgWeightTeam) + " \u2192 "
                + this.prettyDecimal(formatRanking.avgWeightTeam) + "</p>");
            print("</div>");
        }
    }

    private searchPokemon(ranking: PokemonRanking, pokemonId: string): IPokemonUsage {
        for (const pokemon of ranking.pokemon) {
            if (pokemon.name === pokemonId) {
                return pokemon;
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

    private getTargetURL(data: IGenerationData, target: string): string {
        let url = "/" + (data.feature || "pokemon");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
            url += "/details/" + target;
        }
        return url;
    }

    private getBaselineURL(data: IGenerationData, baseline: number): string {
        let url = "/" + data.feature;
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

    private prettyDecimal(dec: number): string {
        const p = Math.floor(dec * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 3) {
            d += "0";
        }
        return e + "." + d;
    }
}
