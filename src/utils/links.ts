/**
 * Links finder
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Finds links in HTML code.
 */

"use strict";

/**
 * Finds all links in a webpage.
 * @param html  The input HTML code.
 * @returns     The list of found links.
 */
export function findAllLinks(html: string): string[] {
    const links = [];
    const linkPrefix = "href=\"";
    while (html.length > 0) {
        const index = html.indexOf(linkPrefix);
        if (index >= 0) {
            html = html.substr(index + linkPrefix.length);
            const index2 = html.indexOf("\"");
            if (index2 >= 0) {
                const link = html.substr(0, index2);
                html = html.substr(index2 + 1);
                links.push(link);
            }
        } else {
            return links;
        }
    }
    return links;
}
