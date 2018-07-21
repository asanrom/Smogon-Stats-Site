/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Pokemon usage data.
 */

"use strict";

import { IPokemonUsage } from "../../model/interfaces";
import { Language } from "../../utils/languages";
import { PokemonData } from "../../utils/pokemon-data";
import { getAbilitiesName, getItemName, getMovesName, getNatureName, getPokemonName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros, escapeHTML, toId } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class DataPokemonPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        let pokemonUsage = null;
        if (data.statsData.rankingPokemon) {
            pokemonUsage = this.findPokemon(data.statsData.rankingPokemon.pokemon, data.target);
        }
        const pokemonData = data.statsData.pokemonData;

        if (pokemonUsage && pokemonData) {
            /* Title */
            print("<div class=\"container padded\">");
            print("<div align=\"center\">");
            print("<h3>#" + pokemonUsage.pos + " - " + getPokemonName(data.target) + "</h3>");
            print("<div class=\"pokemon-big-sprite\" style=\"background: url('"
                + Sprites.getPokemonSpriteURL(data.target) + "') top right no-repeat;\"></div>");
            print("<div>");

            /* Navigation */
            const prevUsage = data.statsData.rankingPokemon.pokemon[pokemonUsage.pos - 2];
            if (prevUsage) {
                print("<a href=\"" + this.getTargetURL(data, prevUsage.name) + "\">");
                print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                    + " mdl-button--raised mdl-button--colored\">"
                    + "<i class=\"material-icons\">skip_previous</i>"
                    + "#" + prevUsage.pos + " - " + getPokemonName(prevUsage.name)
                    + "</button>");
                print("</a>");
            } else {
                print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                    + " mdl-button--raised mdl-button--colored\" disabled>"
                    + "<i class=\"material-icons\">skip_previous</i>"
                    + "#" + pokemonUsage.pos + " - " + getPokemonName(data.target)
                    + "</button>");
            }

            print("<a href=\"" + this.getDexPokemonURL(data.target) + "\" target=\"_blank\">");
            print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                + " mdl-button--raised mdl-button--accent\">POKEDEX</button>");
            print("</a>");

            const nextUsage = data.statsData.rankingPokemon.pokemon[pokemonUsage.pos];
            if (nextUsage) {
                print("<a href=\"" + this.getTargetURL(data, nextUsage.name) + "\">");
                print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                    + " mdl-button--raised mdl-button--colored\">"
                    + "#" + nextUsage.pos + " - " + getPokemonName(nextUsage.name)
                    + "<i class=\"material-icons\">skip_next</i>"
                    + "</button>");
                print("</a>");
            } else {
                print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
                    + " mdl-button--raised mdl-button--colored\" disabled>"
                    + "#" + pokemonUsage.pos + " - " + getPokemonName(data.target)
                    + "<i class=\"material-icons\">skip_next</i>"
                    + "</button>");
            }
            print("</div></div></div>");
            print("<div class=\"poke-stats-main\">");
            print("<div align=\"center\">");

            /* Usage stats */
            print("<div class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.stats") + "</div>");
            print("<table class=\"container main-table limited-width"
                + " mdl-data-table mdl-js-data-table\"><tbody>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "usage-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "usage-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.usage"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.usage") + "</b></td>");
            print("<td>" + this.prettyPercent(pokemonUsage.usage) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "raw-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "raw-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.raw"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.raw") + "</b></td>");
            print("<td>" + Math.floor(pokemonUsage.raw) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "rawp-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "rawp-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.rawp"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.raw") + " (%)</b></td>");
            print("<td>" + this.prettyPercent(pokemonUsage.rawp) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "real-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "real-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.real"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.real") + "</b></td>");
            print("<td>" + Math.floor(pokemonUsage.real) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "realp-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "realp-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.realp"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.real") + " (%)</b></td>");
            print("<td>" + this.prettyPercent(pokemonUsage.realp) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "rc-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "rc-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.rawc"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.rawc") + "</b></td>");
            print("<td>" + Math.floor(pokemonData.raw) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "avg-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "avg-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.avg"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.avg") + "</b></td>");
            print("<td>" + this.prettyDecimal(pokemonData.avgWeight) + "</td>");
            print("</tr>");

            print("<tr>");
            print("<td width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">");
            print("<div id=\"" + "vc-tooltip" + "\" class=\"icon material-icons\">help</div>");
            print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"" + "vc-tooltip" + "\">");
            print(language.getHtml("pkmdata.tooltips.vc"));
            print("</div></td>");
            print("<td class=\"mdl-data-table__cell--non-numeric\"><b>");
            print(language.getText("pkmdata.vc") + "</b></td>");
            print("<td>" + Math.floor(pokemonData.viability) + "</td>");
            print("</tr>");
            print("</tbody></table>");

            /* Abilities */
            print("<a href=\"#abilities\"><div id=\"abilities\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.abilities") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.ability") + "</th>");
            print("<th>" + language.getText("pkmdata.usage") + "</th>");
            print("</tr></thead><tbody>");
            for (const ability of pokemonData.abilities) {
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<a href=\"" + this.getDexAbilityURL(ability.name)
                    + "\" target=\"_blank\"><b>" + escapeHTML(getAbilitiesName(ability.name))
                    + "</b></a></td>");
                print("<td>" + this.prettyPercent(ability.usage) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* Moves */
            print("<a href=\"#moves\"><div id=\"moves\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.moves") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<img class=\"type-image\" src=\"" + Sprites.getTypeIcon("") + "\" /></th>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                + "<img class=\"category-image\" src=\"" + Sprites.getCategoryIcon("") + "\" /></th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.move") + "</th>");
            print("<th>" + language.getText("pkmdata.usage") + "</th>");
            print("</tr></thead><tbody>");
            for (const move of pokemonData.moves) {
                const moveData = PokemonData.getMoves()[toId(move.name)] || {};
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<img class=\"type-image\" src=\""
                    + Sprites.getTypeIcon(moveData.type) + "\" /></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric mid-screen\">"
                    + "<img class=\"category-image\" src=\""
                    + Sprites.getCategoryIcon(moveData.category) + "\" /></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<a href=\"" + this.getDexMoveURL(move.name)
                    + "\" target=\"_blank\"><b>" + getMovesName(move.name)
                    + "</b></a></td>");
                print("<td>" + this.prettyPercent(move.usage) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* Items */
            print("<a href=\"#items\"><div id=\"items\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.items") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric\">"
                + "<div class=\"item-icon\" style=\"" + Sprites.getItemIcon("") + "')\"></div>" + "</th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.item") + "</th>");
            print("<th>" + language.getText("pkmdata.usage") + "</th>");
            print("</tr></thead><tbody>");
            for (const item of pokemonData.items) {
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<div class=\"item-icon\" style=\""
                    + Sprites.getItemIcon(item.name) + "')\"></div>" + "</td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<a href=\"" + this.getDexItemURL(item.name)
                    + "\" target=\"_blank\"><b>" + getItemName(item.name)
                    + "</b></a></td>");
                print("<td>" + this.prettyPercent(item.usage) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* Spreads */
            print("<a href=\"#spreads\"><div id=\"spreads\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.spreads") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.nature") + "</th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.evs") + "</th>");
            print("<th>" + language.getText("pkmdata.usage") + "</th>");
            print("</tr></thead><tbody>");
            let j = 0;
            for (const spread of pokemonData.spreads) {
                j++;
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">");
                print("<div id=\"spread-nat-" + j + "\">" + getNatureName(spread.nature) + "</div>");
                print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"spread-nat-" + j + "\">");
                print(getNatureName(spread.nature) + "<br />");
                print(this.getNatureTooltip(spread.nature, language.getHtml("pkmdata.neutral")));
                print("</div></td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">");
                const evsTxt = this.evsNumber(spread.hp) + " HP / "
                    + this.evsNumber(spread.atk) + " Atk / "
                    + this.evsNumber(spread.def) + " Def / "
                    + this.evsNumber(spread.spa) + " Spa / "
                    + this.evsNumber(spread.spd) + " Spd / "
                    + this.evsNumber(spread.spe) + " Spe";
                print("<span class=\"mid-screen\">" + evsTxt + "</span>");
                print("<span class=\"small-screen-sub\">");
                print("<div id=\"spread-evs-" + j + "\" class=\"icon material-icons\">more_horiz</div>");
                print("<div class=\"mdl-tooltip mdl-tooltip--large\" data-mdl-for=\"spread-evs-" + j + "\">");
                print(this.evsNumber(spread.hp) + " HP / "
                    + this.evsNumber(spread.atk) + " Atk /<br />"
                    + this.evsNumber(spread.def) + " Def / "
                    + this.evsNumber(spread.spa) + " Spa /<br />"
                    + this.evsNumber(spread.spd) + " Spd / "
                    + this.evsNumber(spread.spe) + " Spe");
                print("</div></span></td>");
                print("<td>" + this.prettyPercent(spread.usage) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* Teammates */
            print("<a href=\"#teammates\"><div id=\"teammates\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.teammates") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric\">"
                + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon("") + "')\"></div>" + "</th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.pokemon") + "</th>");
            print("<th>" + language.getText("pkmdata.usage") + "</th>");
            print("</tr></thead><tbody>");
            for (const teammate of pokemonData.teammates) {
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<div class=\"picon\" style=\""
                    + Sprites.getPokemonIcon(teammate.name) + "')\"></div>" + "</td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<a href=\"" + this.getDexPokemonURL(teammate.name)
                    + "\" target=\"_blank\"><b>" + getPokemonName(teammate.name)
                    + "</b></a></td>");
                print("<td>" + (teammate.usage < 0 ? "-" : "+")
                    + this.prettyPercent(Math.abs(teammate.usage)) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* Checks / counters */
            print("<a href=\"#counters\"><div id=\"counters\" class=\"poke-stats-section limited-width\">"
                + language.getText("pkmdata.counters") + "</div></a>");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th width=\"1rem\" class=\"mdl-data-table__cell--non-numeric\">"
                + "<div class=\"picon\" style=\"" + Sprites.getPokemonIcon("") + "')\"></div>" + "</th>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("pkmdata.pokemon") + "</th>");
            print("<th class=\"mid-screen\">" + language.getText("pkmdata.ko") + "</th>");
            print("<th class=\"mid-screen\">" + language.getText("pkmdata.switch") + "</th>");
            print("<th>" + language.getText("pkmdata.total") + "</th>");
            print("</tr></thead><tbody>");
            for (const counter of pokemonData.counters) {
                print("<tr>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<div class=\"picon\" style=\""
                    + Sprites.getPokemonIcon(counter.name) + "')\"></div>" + "</td>");
                print("<td class=\"mdl-data-table__cell--non-numeric\">"
                    + "<a href=\"" + this.getDexPokemonURL(counter.name)
                    + "\" target=\"_blank\"><b>" + getPokemonName(counter.name)
                    + "</b></a></td>");
                print("<td class=\"mid-screen\">" + this.prettyPercent(counter.ko) + "</td>");
                print("<td class=\"mid-screen\">" + this.prettyPercent(counter.switch) + "</td>");
                print("<td>" + this.prettyPercent(counter.total) + "</td>");
                print("</tr>");
            }
            print("</tbody></table>");

            /* End */
            print("</div></div>");
        }
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

    private prettyDecimal(dec: number): string {
        const p = Math.floor(dec * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 3) {
            d += "0";
        }
        return e + "." + d;
    }

    private getTargetURL(data: IGenerationData, target: string): string {
        let url = "/" + (data.feature || "pokemon");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        url += "/" + data.format + "/" + data.baseline;
        url += "/" + target;
        return url;
    }

    private getDexPokemonURL(target: string): string {
        return "https://dex.pokemonshowdown.com/pokemon/" + toId(target);
    }

    private getDexMoveURL(target: string): string {
        return "https://dex.pokemonshowdown.com/moves/" + toId(target);
    }

    private getDexItemURL(target: string): string {
        return "https://dex.pokemonshowdown.com/items/" + toId(target);
    }

    private getDexAbilityURL(target: string): string {
        return "https://dex.pokemonshowdown.com/abilities/" + toId(target);
    }

    private findPokemon(pokes: IPokemonUsage[], pokemon: string): IPokemonUsage {
        for (const poke of pokes) {
            if (poke.name === pokemon) {
                return poke;
            }
        }
        return {
            name: pokemon,
            pos: NaN,
            raw: 0,
            rawp: 0,
            real: 0,
            realp: 0,
            usage: 0,
        };
    }

    private evsNumber(stat: number): string {
        if (stat === null || isNaN(stat)) {
            return "?";
        } else {
            return "" + Math.floor(stat);
        }
    }

    private getNatureTooltip(nature: string, neutral: string): string {
        nature = toId(nature);
        switch (nature) {
            case "lonely":
                return "+10% Atk<br />-10% Def";
            case "brave":
                return "+10% Atk<br />-10% Spe";
            case "adamant":
                return "+10% Atk<br />-10% Spa";
            case "naughty":
                return "+10% Atk<br />-10% Spd";
            case "bold":
                return "+10% Def<br />-10% Atk";
            case "relaxed":
                return "+10% Def<br />-10% Spe";
            case "impish":
                return "+10% Def<br />-10% Spa";
            case "lax":
                return "+10% Def<br />-10% Spd";
            case "timid":
                return "+10% Spe<br />-10% Atk";
            case "hasty":
                return "+10% Spe<br />-10% Def";
            case "jolly":
                return "+10% Spe<br />-10% Spa";
            case "naive":
                return "+10% Spe<br />-10% Spd";
            case "modest":
                return "+10% Spa<br />-10% Atk";
            case "mild":
                return "+10% Spa<br />-10% Def";
            case "quiet":
                return "+10% Spa<br />-10% Spe";
            case "rash":
                return "+10% Spa<br />-10% Spd";
            case "calm":
                return "+10% Spd<br />-10% Atk";
            case "gentle":
                return "+10% Spd<br />-10% Def";
            case "sassy":
                return "+10% Spd<br />-10% Spe";
            case "careful":
                return "+10% Spd<br />-10% Spa";
            default:
                return neutral;
        }
    }
}
