/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Main page structure, headers, menus and footer.
 */

"use strict";

import { Language } from "../../utils/languages";
import { addLeftZeros, escapeHTML } from "../../utils/text-utils";
import { getMonth } from "../../utils/time-utils";
import { pkgVersion } from "../../utils/version";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

const META_TAGS = "<meta charset=\"utf-8\">" +
    "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, minimum-scale=1.0\">" +
    /* Shortcut icon */
    "<link rel=\"shortcut icon\" href=\"/static/images/favicon.ico\">";

const STYLE_REFS = "<link rel=\"stylesheet\" href=\"/static/lib/mdl/material.min.css\" />" +
    "<link href=\"/md-icons/iconfont/material-icons.css\" rel=\"stylesheet\">" +
    "<link href=\"/static/style/default-min.css?" + pkgVersion() + "\" rel=\"stylesheet\">";

const SCRIPT_REFS = "<script type=\"text/javascript\" src=\"/static/lib/jquery.min.js\"></script>" +
    "<script type=\"text/javascript\" src=\"/static/lib/mdl/material.min.js\"></script>";

/**
 * Generator for main page structure, headers, menus and footer.
 */
export class BasePG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, printFunction: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        const print = printFunction;
        print("<!DOCTYPE html><html><head>");
        let shortTitle = language.getText("header.short-title", {
            month: language.getText("months." + getMonth(data.month)),
            year: (data.year || 0),
        });

        /* Head */
        print(META_TAGS);
        print(STYLE_REFS);
        print(SCRIPT_REFS);
        print("<title>" + this.generateTitle(data, shortTitle)
            + language.getText("site.title") + "</title>");
        print("<meta name=\"description\" content=\"" + language.getText("site.description") + "\">");

        /* Body */
        print("</head><body>");

        /* Header */
        print("<div class=\"mdl-layout__container has-scrolling-header\">");
        print("<div class=\"mdl-layout mdl-js-layout mdl-layout--fixed-header\">");
        print("<header class=\"mdl-layout__header smogon-background\">");
        print("<div class=\"mdl-layout__header-row\">");

        /* Header: Title */
        if (data.isNotFound) {
            shortTitle = language.getText("header.not-found");
        }
        print("<span class=\"mdl-layout-title large-screen\">");
        print(language.getText("header.title") + " - " + shortTitle);
        print("</span>");
        print("<span class=\"mdl-layout-title mid-screen-sub\">");
        print(shortTitle);
        print("</span>");
        print("<span class=\"mdl-layout-title small-screen-sub\">");
        print(shortTitle);
        print("</span>");

        print("<div class=\"mdl-layout-spacer\"></div>");

        /* Header: language menu */
        print("<span class=\"language-abv\">" + ("" + data.language).toUpperCase() + "</span>");
        print("<button id=\"language-menu-btn\" class=\"mdl-button mdl-js-button mdl-button--icon\" title=\""
            + language.getText("tooltips.language") + "\">");
        print("<i class=\"material-icons\">language</i>");
        print("</button>");
        print("<ul class=\"mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect\""
            + " for=\"language-menu-btn\">");
        const languages = Language.list();
        for (const lang of languages) {
            print("<li class=\"mdl-menu__item\" onclick=\"setLanguage('"
                + lang + "');\">" + Language.get(lang).getName() + "</li>");
        }
        print("</ul>");
        print("</div>");

        /* Header: tabs */
        print("<div class=\"mdl-layout__tab-bar mdl-js-ripple-effect\">");
        const selectedFeature = data.feature || "pokemon";

        print("<a title=\"" + language.getText("tabs.pokemon.title") + "\" href=\""
            + this.getTabURL("pokemon", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "pokemon" ? "is-active" : "") + "\">"
            + language.getText("tabs.pokemon.text") + "</a>");
        print("<a title=\"" + language.getText("tabs.moves.title") + "\" href=\""
            + this.getTabURL("moves", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "moves" ? "is-active" : "") + "\">"
            + language.getText("tabs.moves.text") + "</a>");
        print("<a title=\"" + language.getText("tabs.items.title") + "\" href=\""
            + this.getTabURL("items", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "items" ? "is-active" : "") + "\">"
            + language.getText("tabs.items.text") + "</a>");
        print("<a title=\"" + language.getText("tabs.abilities.title") + "\" href=\""
            + this.getTabURL("abilities", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "abilities" ? "is-active" : "") + "\">"
            + language.getText("tabs.abilities.text") + "</a>");
        print("<a title=\"" + language.getText("tabs.leads.title") + "\" href=\""
            + this.getTabURL("leads", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "leads" ? "is-active" : "") + "\">"
            + language.getText("tabs.leads.text") + "</a>");
        print("<a title=\"" + language.getText("tabs.metagame.title") + "\" href=\""
            + this.getTabURL("metagame", data) + "\" class=\"mdl-layout__tab "
            + (selectedFeature === "metagame" ? "is-active" : "") + "\">"
            + language.getText("tabs.metagame.text") + "</a>");

        print("</div>");
        print("</header>");

        /* Months menu */
        print("<div class=\"mdl-layout__drawer\">");
        print("<span class=\"mdl-layout-title\">" + language.getText("months.title") + "</span>");
        print("<nav class=\"mdl-navigation\">");
        if (data.months) {
            for (const m of data.months) {
                const monthTitle = language.getText("header.short-title", {
                    month: language.getText("months." + getMonth(m.month)),
                    year: (m.year || 0),
                });
                print("<a class=\"mdl-navigation__link\" href=\""
                    + this.getMonthURL(m.year, m.month, data) + "\">"
                    + monthTitle + "</a>");
            }
        }
        print("</nav>");
        print("</div>");

        /* Content */
        print("<main class=\"mdl-layout__content\">");
        print("<section class=\"main-content section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp\">");
        print("<div class=\"container padded\">");

        if (data.feature) {
            print("<a href=\"" + this.getFormatsListURL(data) + "\">");
            print("<button type=\"button\" class=\"mdl-chip\">");
            print("<span class=\"mdl-chip__text\">");
            print(language.getText("chips.formats"));
            print("</span></button></a>");

            if (data.formatName) {
                print("<a href=\"" + this.getFormatURL(data) + "\">");
                print("<button type=\"button\" class=\"mdl-chip\">");
                print("<span class=\"mdl-chip__text\">");
                print(escapeHTML(data.formatName));
                print("</span></button></a>");

                print("<a href=\"" + this.getFormatBaselineURL(data) + "\">");
                print("<button type=\"button\" class=\"mdl-chip\">");
                print("<span class=\"mdl-chip__text\">");
                print(escapeHTML("" + data.baseline));
                print("</span></button></a>");
            }

            if (data.targetName) {
                print("<a href=\"" + this.getTargetURL(data) + "\">");
                print("<button type=\"button\" class=\"mdl-chip\">");
                print("<span class=\"mdl-chip__text\">");
                print(escapeHTML(data.targetName));
                print("</span></button></a>");
            }
        }

        print("</div>");

        if (nestedGenerator) {
            nestedGenerator.generateHTML(data, language, printFunction);
        }

        print("</section>");

        /* Footer */
        print("<footer class=\"mdl-mini-footer\">");
        print("<div class=\"mdl-mini-footer__left-section\">");
        print("<div class=\"mdl-logo\">"
            + language.getText("footer.logo") + "</div>");
        print("<ul class=\"mdl-mini-footer__link-list\">");
        print("<li><a href=\"/api-reference/\" target=\"_blank\">"
            + language.getText("footer.api") + "</a></li>");
        print("<li><a href=\"https://github.com/asanrom/Smogon-Stats-Site\" target=\"_blank\">"
            + language.getText("footer.github") + "</a></li>");
        print("<li><a href=\"https://www.smogon.com/stats/\" target=\"_blank\">"
            + language.getText("footer.source") + "</a></li>");
        print("</ul>");
        print("</div>");
        print("</footer>");

        print("</main>");
        print("</div>");
        print("</div>");
        print("</body></html>");
    }

    private generateTitle(data: IGenerationData, shortTitle: string): string {
        let title = "";
        if (data.targetName) {
            title += data.targetName + " - ";
        }
        if (data.formatName) {
            title += "[" + data.baseline + "] - " + data.formatName + " - ";
        }
        if (data.feature) {
            title += data.feature.toUpperCase() + " - ";
        }
        if (!data.isNotFound) {
            title += "[" + shortTitle + "] - ";
        }
        return escapeHTML(title);
    }

    private getTabURL(feature: string, data: IGenerationData): string {
        let url = "/" + feature;
        url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        return url;
    }

    private getFormatsListURL(data: IGenerationData): string {
        let url = "/" + (data.feature || "pokemon");
        url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        return url;
    }

    private getFormatURL(data: IGenerationData): string {
        let url = "/" + (data.feature || "pokemon");
        url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        if (data.format) {
            url += "/" + data.format;
        }
        return url;
    }

    private getFormatBaselineURL(data: IGenerationData): string {
        let url = "/" + (data.feature || "pokemon");
        url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        return url;
    }

    private getTargetURL(data: IGenerationData): string {
        let url = "/" + (data.feature || "pokemon");
        url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        if (data.target) {
            url += "/" + data.target;
        }
        return url;
    }

    private getMonthURL(year: number, month: number, data: IGenerationData): string {
        let url = "/" + (data.feature || "pokemon");
        url += "/" + year + "-" + addLeftZeros(month, 2);
        if (data.format) {
            url += "/" + data.format + "/" + data.baseline;
        }
        if (data.target) {
            url += "/" + data.target;
        }
        return url;
    }
}
