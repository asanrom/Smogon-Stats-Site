/**
 * Page-Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Format metagame information.
 */

"use strict";

import { IStallBar } from "../../model/interfaces";
import { getFormatName } from "../../utils/formats-names";
import { Language } from "../../utils/languages";
import { addLeftZeros, capitalize, escapeHTML } from "../../utils/text-utils";
import { IGenerationData, IPageGenerator, PrintFunction } from "./page-generator";

export class FormatMetagamePG implements IPageGenerator {

    /**
     * Generates a web page.
     * @param data              Data for the dynamic page generation.
     * @param language          Language package used for texts.
     * @param printFunction     Function for printing the generated html.
     * @param nestedGenerator   Nested generator (optional).
     */
    public generateHTML(data: IGenerationData, language: Language, print: PrintFunction,
                        nestedGenerator?: IPageGenerator) {
        const formatMetagame = data.statsData.metagameInfo;
        if (formatMetagame) {
            /* Title */
            print("<div class=\"container padded\" style=\"text-align: center;\">");
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
            print("</div>");

            /* Graph */
            print("<div class=\"main-table-container\">");
            print(this.generateGraph(formatMetagame.graph));
            print("</div>");

            /* Info */
            print("<div class=\"container padded txtcenter\">");
            print("<p><b>" + language.getText("metagame.stall")
                + " (" + language.getText("metagame.mean") + ": "
                + this.prettyDecimal(formatMetagame.meanStalliness) + ")</b></p>");
            print("<p>" + language.getText("metagame.help") + "</p>");
            print("</div>");

            /* PlayStyles */
            print("<div class=\"main-table-container\">");
            print("<table class=\"container limited-width main-table mdl-data-table mdl-js-data-table\">");
            print("<thead><tr>");
            print("<th class=\"mdl-data-table__cell--non-numeric\">"
                + language.getText("metagame.playstyle") + "</th>");
            print("<th>" + language.getText("metagame.usage") + " %</th>");
            print("</tr></thead><tbody>");
            for (const ps of formatMetagame.playstyles) {
                print("<tr><td class=\"mdl-data-table__cell--non-numeric\">"
                    + escapeHTML(capitalize(ps.name)) + "</td>");
                print("<td>" + this.prettyPercent(ps.usage) + "</td></tr>");
            }
            print("</tbody></table></div>");
        }
    }

    private getBaselineURL(data: IGenerationData, baseline: number): string {
        let url = "/" + (data.feature || "pokemon");
        if (!data.isNotFound) {
            url += "/" + data.year + "-" + addLeftZeros(data.month, 2);
        }
        if (data.format) {
            url += "/" + data.format + "/" + baseline;
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

    private prettyDecimal(dec: number): string {
        const p = Math.floor(dec * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 3) {
            d += "0";
        }
        return e + "." + d;
    }

    private prettyDecimalSig(dec: number): string {
        let sig = "+";
        if (dec < 0) {
            dec = Math.abs(dec);
            sig = "-";
        }
        const p = Math.floor(dec * 1000) / 1000;
        const e = Math.floor(p);
        let d = "" + Math.floor((p - e) * 1000);
        while (d.length < 2) {
            d += "0";
        }
        return sig + e + "." + d;
    }

    private generateGraph(bars: IStallBar[]): string {
        if (bars.length === 0) {
            return "";
        }

        const height = 125;
        const width = 20 + 10 * bars.length + 20;
        const points: Array<{ id: string, p: number }> = [];
        let svg = "<svg class=\"stall-graph limited-width\" viewBox=\"0 0 "
            + width + " " + height + "\">";

        let m = Number.NEGATIVE_INFINITY;
        for (const bar of bars) {
            if (bar.p > m) {
                m = bar.p;
            }
        }

        /* Polygon */

        let k = 1;
        for (const bar of bars) {
            points.push({ id: ("point-g-" + k), p: bar.p });
            k++;
        }

        svg += '<polygon points="30,110';
        let circles = "";
        k = 0;
        for (const point of points) {
            const px = 30 + (10 * k);
            const py = Math.floor(110 - (point.p * 100 / m));

            circles += '<circle id="' + point.id + '" cx="' + px + '" cy="'
                + py + '" r="2" stroke="black" stroke-width="1" fill="#756bb1" />';

            svg += " " + px + "," + py;
            k++;
            if (k === points.length) {
                svg += " " + px + "," + 110;
            }
        }
        svg += '" style="fill:#efedf5;stroke:#756bb1;stroke-width:0.5;fill-rule:evenodd;" />';
        svg += circles;

        /* Axe Y */
        svg += '<line x1="20" y1="10" x2="20" y2="110" style="stroke: black; stroke-width: 1;">'
            + "</line>";
        svg += '<text x="3" y="110" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent(0) + "</text>";
        svg += '<text x="3" y="90" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent((1 * m) / 5) + "</text>";
        svg += '<text x="3" y="70" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent((2 * m) / 5) + "</text>";
        svg += '<text x="3" y="50" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent((3 * m) / 5) + "</text>";
        svg += '<text x="3" y="30" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent((4 * m) / 5) + "</text>";
        svg += '<text x="3" y="10" style="text-align: center; font-size: 4px;">'
            + this.prettyPercent(m) + "</text>";

        /* Axe X */
        svg += '<line x1="20" y1="110" x2="' + (width - 20)
            + '" y2="110" style="stroke: black; stroke-width: 1;">'
            + "</line>";
        let x = 30;
        for (const bar of bars) {
            svg += '<line x1="' + x + '" y1="110" x2="' + x
                + '" y2="' + (!this.isNumber(bar.value) ? "113" : "115")
                + '" style="stroke: black; stroke-width: 0.5;"></line>';
            if (this.isNumber(bar.value)) {
                svg += '<text x="' + (x - 5)
                    + '" y="120" style="text-align: center; font-size: 4px;">'
                    + this.prettyDecimalSig(bar.value) + "</text>";
            }
            x += 10;
        }

        svg += "</svg>";
        for (const point of points) {
            svg += "<div class=\"mdl-tooltip\" data-mdl-for=\""
                + point.id + "\">" + this.prettyPercent(point.p) + "</div>";
        }
        return "<svg class=\"stall-graph limited-width\" viewBox=\"0 0 "
            + width + " " + height + "\">" + svg + "";
    }

    private isNumber(num: any): boolean {
        return (typeof num === "number" && !isNaN(num));
    }
}
