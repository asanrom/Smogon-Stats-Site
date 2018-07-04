/**
 * Page generator for control panel.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { IMonthStatus } from "../crawler/months-list";
import { addLeftZeros, capitalize } from "../utils/text-utils";
import { getMonth } from "../utils/time-utils";

export type PrintFunction = (arg: string) => void;

const META_TAGS = "<meta charset=\"utf-8\">" +
    "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, minimum-scale=1.0\">" +
    /* Shortcut icon */
    "<link rel=\"shortcut icon\" href=\"/static/images/favicon.ico\">";

const STYLE_REFS = "<link rel=\"stylesheet\" href=\"/static/lib/mdl/material.min.css\" />" +
    "<link href=\"/md-icons/iconfont/material-icons.css\" rel=\"stylesheet\">" +
    "<link rel=\"stylesheet\" href=\"/static/style/control-panel.css\" />";

const SCRIPT_REFS = "<script type=\"text/javascript\" src=\"/static/lib/mdl/material.min.js\"></script>";

const SCRIPT_REFS2 = "<script type=\"text/javascript\" src=\"/static/lib/jquery.min.js\"></script>" +
    "<script type=\"text/javascript\" src=\"/static/js/control-panel.js\"></script>";

/**
 * Generates the login page.
 * @param print     Print function for output html.
 * @param errormsg  Error message (optional).
 */
export function generateLoginPage(print: PrintFunction, errormsg?: string) {
    print("<!DOCTYPE html><html><head>");
    print(META_TAGS);
    print(STYLE_REFS);
    print(SCRIPT_REFS);
    print("<title>Control Panel - Smogon Stats Site</title>");
    print("<meta name=\"description\" content=\"Control panel for Smogon Stats Site.\">");
    print("</head><body>");

    print("<div class=\"main-login-div\">");
    print("<div class=\"login-div mdl-shadow--2dp\">");
    print("<h3>Smogon Usage Stats Site</h3>");
    print("<h4>(Control Panel)</h4>");
    print("<form method=\"POST\" action=\"\">");

    print("<p><div class=\"mdl-textfield mdl-js-textfield\">");
    print("<input id=\"field-username\" class=\"mdl-textfield__input\""
        + " type=\"text\" name=\"username\" size=\"40\" />");
    print("<label class=\"mdl-textfield__label\" for=\"field-username\">"
        + "Username...</label>");
    if (errormsg) {
        print("<span class=\"mdl-textfield__error\" style=\"visibility: visible;\">"
            + errormsg + "</span>");
    }
    print("</div></p>");

    print("<p><div class=\"mdl-textfield mdl-js-textfield\">");
    print("<input id=\"field-password\" class=\"mdl-textfield__input\""
        + " type=\"password\" name=\"password\" size=\"40\" />");
    print("<label class=\"mdl-textfield__label\" for=\"field-password\">"
        + "Password...</label>");
    print("</div></p>");

    print("<input type=\"hidden\" name=\"action\" value=\"login\" />");
    print("<p><button class=\"mdl-button mdl-js-button mdl-button--raised mdl-button--colored\">"
        + "LOGIN" + "</button></p>");

    print("</form>");
    print("</div></div>");
    print("</body></html>");
}

/**
 * Generates the control panel page.
 * @param print     Print function for output html.
 * @param errormsg  Error message (optional).
 */
export function generateControlPanelPage(print: PrintFunction, months: IMonthStatus[],
                                         crawlerStatus: boolean, uptime: number) {
    print("<!DOCTYPE html><html><head>");
    print(META_TAGS);
    print(STYLE_REFS);
    print(SCRIPT_REFS);
    print(SCRIPT_REFS2);
    print("<title>Control Panel - Smogon Stats Site</title>");
    print("<meta name=\"description\" content=\"Control panel for Smogon Stats Site.\">");
    print("</head><body>");

    /* Snackbar */
    print("<div id=\"action-snackbar\" class=\"mdl-js-snackbar mdl-snackbar\">");
    print("<div class=\"mdl-snackbar__text\"></div>");
    print("<button class=\"mdl-snackbar__action\" type=\"button\"></button>");
    print("</div>");

    /* Dialog */
    print("<div id=\"confirmation-dialog\" class=\"modal-dialog-container\">");
    print("<div class=\"dialog-div mdl-shadow--2dp\">");
    print("<h4>Confirm action: <span id=\"confirmation-dialog-action\"></span></h4>");
    print("<p><b>Are you sure you want to do this?</b></p>");
    print("<p class=\"\">");
    print("<button name=\"cancel-action\" class=\"mdl-button mdl-js-button mdl-button--raised"
        + " mdl-button--colored action-button\">NO</button>");
    print("<button name=\"confirm-action\" class=\"mdl-button mdl-js-button mdl-button--raised"
        + " mdl-button--accent action-button\">YES</button>");
    print("</p>");
    print("</div></div>");

    print("<div class=\"mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs\">");

    /* Header */
    print("<header class=\"mdl-layout__header smogon-background\">");
    print("<div class=\"mdl-layout__header-row control-panel-header\">");
    print("<span class=\"mdl-layout-title\">");
    print("<span class=\"large-screen\">Control Panel (Smogon Stats Site)</span>");
    print("<span class=\"small-screen\">Control Panel</span>");
    print("</span>");
    print("<div class=\"mdl-layout-spacer\"></div>");
    print("<button title=\"Log out\" name=\"logout\" "
        + "class=\"mdl-button mdl-js-button mdl-button--icon\">"
        + "<i class=\"material-icons\">exit_to_app</i></button>");
    print("</div></header>");

    print("<main class=\"mdl-layout__content\">");
    print("<section class=\"main-content section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp\">");

    /* Crawler status */
    print("<div class=\"container padded\">");
    print("<ul class=\"mdl-list\"><li class=\"mdl-list__item\">");
    print("<span class=\"mdl-list__item-primary-content\">Stats Crawler</span>");
    print("<span class=\"mdl-list__item-secondary-action\">");
    print("<label class=\"mdl-switch mdl-js-switch mdl-js-ripple-effect\" for=\"crawler-status-check\">");
    print("<input type=\"checkbox\" id=\"crawler-status-check\" class=\"mdl-switch__input\" "
        + (crawlerStatus ? "checked" : "") + " />");
    print("</label></span>");
    print("</li></ul></div>");

    /* Table of months */
    print("<table class=\"container main-table mdl-data-table mdl-js-data-table\">");
    print("<thead>");
    print("<tr>" + "<th class=\"mdl-data-table__cell--non-numeric\">ID</th>"
        + "<th class=\"mdl-data-table__cell--non-numeric large-screen\">Year</th>"
        + "<th class=\"mdl-data-table__cell--non-numeric large-screen\">Month</th>"
        + "<th class=\"mdl-data-table__cell--non-numeric\">Status</th>"
        + "<th class=\"mdl-data-table__cell--non-numeric\">Actions</th>"
        + "</tr>");
    print("</thead><tbody>");
    for (const month of months) {
        const monthID = month.year + "-" + addLeftZeros(month.month, 2);
        print("<tr>");
        print("<td class=\"mdl-data-table__cell--non-numeric\">"
            + monthID + "</td>");
        print("<td class=\"mdl-data-table__cell--non-numeric large-screen\">"
            + month.year + "</td>");
        print("<td class=\"mdl-data-table__cell--non-numeric large-screen\">"
            + capitalize(getMonth(month.month)) + "</td>");
        print("<td class=\"mdl-data-table__cell--non-numeric\">"
            + capitalize(month.status) + "</td>");
        print("<td class=\"mdl-data-table__cell--non-numeric\">");
        switch (month.status) {
            case "new":
            case "stopped":
            case "ready":
                print("<button title=\"Mark as pending " + monthID + ".\" name=\"add-pending\" value=\""
                    + month.mid + "\" class=\"mdl-button mdl-js-button mdl-button--icon\">"
                    + "<i class=\"material-icons\">add_to_queue</i></button>");
                print("<button title=\"Delete " + monthID + ".\" name=\"delete-month\" value=\""
                    + month.mid + "\" class=\"mdl-button mdl-js-button mdl-button--icon\">"
                    + "<i class=\"material-icons\">delete_forever</i></button>");
                break;
            case "deleted":
                print("<button title=\"Mark as pending " + monthID + ".\" name=\"add-pending\" value=\""
                    + month.mid + "\" class=\"mdl-button mdl-js-button mdl-button--icon\">"
                    + "<i class=\"material-icons\">add_to_queue</i></button>");
                break;
            case "working":
            case "deleting":
            case "pending":
                print("<button title=\"Interrupt crawler for " + monthID + ".\" name=\"interrupt\" value=\""
                    + month.mid + "\" class=\"mdl-button mdl-js-button mdl-button--icon\">"
                    + "<i class=\"material-icons\">remove_from_queue</i></button>");
                break;
        }
        print("</td></tr>");
    }
    print("</tbody></table>");

    /* Other actions */
    print("<div class=\"actions-container\">");
    print("<button name=\"clear-cache\" class=\"mdl-button mdl-js-button mdl-button--raised"
        + " mdl-button--accent action-button\">CLEAR CACHE</button>");
    print("<button name=\"reload-res\" class=\"mdl-button mdl-js-button mdl-button--raised"
        + " mdl-button--accent action-button\">RELOAD RESOURCES</button>");
    print("<button name=\"stop-app\" class=\"mdl-button mdl-js-button mdl-button--raised"
        + " mdl-button--accent action-button\">STOP APPLICATION</button>");
    print("</div>");

    /* Uptime */
    print("<div class=\"container padded\">");
    print("<b>UPTIME: </b>");
    print("<span id=\"uptime-span\">" + Math.floor(process.uptime() * 1000) + "</span>");
    print("</div>");

    print("</section></main>");
    print("</div>");
    print("</body></html>");
}
