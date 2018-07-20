/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Not-Found page
 */

"use strict";

import { Language } from "../../utils/languages";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class NotFoundPG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        print("<div class=\"container txtcenter\">");
        print("<h3>" + language.getText("404.title") + "</h3>");
        print("<p><b>" + language.getText("404.message") + "</b></p>");
        print("<p><img src=\"/static/images/missigno.png\" width=\"200\" height=\"250\" /></p>");
        print("<p><a href=\"/\">");
        print("<button class=\"mdl-button mdl-js-button pokemon-nav-button"
            + " mdl-button--raised mdl-button--colored\">"
            + language.getText("404.button") + "</button>");
        print("</a></p>");
        print("</div>");
    }
}
