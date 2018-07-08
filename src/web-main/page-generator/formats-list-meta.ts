/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Formats list for metagame stats.
 */

"use strict";

import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { getMovesName } from "../../utils/pokemon-names";
import { Sprites } from "../../utils/sprites";
import { addLeftZeros, escapeHTML, toId } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class FormatsListMetaPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {

        /* Sort options */
        print("<div class=\"hidden\">");
        print("<label class=\"mdl-radio mdl-js-radio mdl-js-ripple-effect\" for=\"option-sort-abc\">");
        print("<input type=\"radio\" id=\"option-sort-abc\" class=\"mdl-radio__button\""
            + " name=\"options-sort\" value=\"1\" " + (data.cookies.sorted !== "total" ? "checked" : "") + ">");
        print("<span class=\"mdl-radio__label\">" + language.getText("flist.metagame.sortabc") + "</span>");
        print("</label><span class=\"options-separator\"></span>");
        print("<label class=\"mdl-radio mdl-js-radio mdl-js-ripple-effect\" for=\"option-sort-total\">");
        print("<input type=\"radio\" id=\"option-sort-total\" class=\"mdl-radio__button\""
            + " name=\"options-sort\" value=\"2\" " + (data.cookies.sorted === "total" ? "checked" : "") + ">");
        print("<span class=\"mdl-radio__label\">" + language.getText("flist.metagame.sorttotal") + "</span>");
        print("</label></div>");

        /* Filter baselines options */
        print("<div class=\"container padded\">");
        print("<label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect autowidth\" for=\"check-only-top\">");
        print("<input type=\"checkbox\" id=\"check-only-top\" class=\"mdl-checkbox__input\" "
            + (data.cookies.onlytop === "yes" ? "checked" : "") + ">");
        print("<span class=\"mdl-checkbox__label\">" + language.getText("flist.metagame.onlytop")
            + " (&gt; 1500)</span>");
        print("</label></div>");

        print("<div class=\"cards-container\">");
        print("<div id=\"format-cards-container\" align=\"center\">");
        /* Search field */
        print("<div><div class=\"mdl-textfield mdl-js-textfield mdl-textfield--expandable"
            + " mdl-textfield--floating-label mdl-textfield--align-right\">");
        print("<label class=\"mdl-button mdl-js-button mdl-button--icon\" for=\"input-text-search\">");
        print("<i class=\"material-icons\">search</i>");
        print("</label><div class=\"mdl-textfield__expandable-holder\">");
        print("<input class=\"mdl-textfield__input\" type=\"text\" name=\"sample\" id=\"input-text-search\">");
        print("</div></div></div>");

        if (data.statsData.formatsMetagame) {
            const formats = data.statsData.formatsMetagame.formats;
            for (const format of formats) {
                print("<div class=\"format-card mdl-card mdl-shadow--2dp\" "
                    + "id=\"" + format.id + "-" + format.baseline + "-0"
                    + "\">");
                print("<div class=\"mdl-card__title\">");
                print("<div class=\"format-card-sprite\" style=\""
                    + "background: url('" + Sprites.getPokemonSpriteURL("")
                    + "') top right no-repeat;" + "\"></div>");
                print("<span class=\"format-card-title\">" + escapeHTML(getFormatName(format.id))
                    + " - " + format.baseline + "</span>");
                print("</div>");

                print("<div class=\"mdl-card__supporting-text\">");
                print("" + language.getText("flist.metagame.baseline") + ": " + format.baseline);
                print(", " + language.getText("flist.metagame.stall") + ": " + this.prettyDecimal(format.stalliness));
                print(", " + language.getText("flist.metagame.top") + ": "
                    + escapeHTML(format.topStyle || "(none)"));
                print("</div>");

                print("<div class=\"mdl-card__actions mdl-card--border\">");
                print("<a href=\"" + this.getFormatBaselineURL(data, format.id, format.baseline)
                    + "\" class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">");
                print(language.getText("flist.metagame.view"));
                print("</a></div>");
                print("</div>");
            }
        }

        print("</div>");
        print("</div>");
        print("<script type=\"text/javascript\" src=\"/static/js/format-list.js\"></script>");
    }

    private getFormatBaselineURL(data: IGenerationData, format: string, baseline: number): string {
        let url = "/" + (data.feature || "metagame");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        url += "/" + format + "/" + baseline;
        return url;
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
