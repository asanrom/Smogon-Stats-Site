/**
 * API reference Generator
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as FS from "fs";
import * as Path from "path";
import { escapeHTML } from "../utils/text-utils";
import { pkgVersion } from "../utils/version";

const MethodData = {
    methods: [],
};

/**
 * Realoads the method list.
 */
export function realoadAPIReference() {
    MethodData.methods = JSON.parse(FS.readFileSync(
        Path.resolve(__dirname, "../../resources/api-reference/methods.json")).toString(),
    ).methods;
}

/**
 * Obtains the content for a reference page.
 * @param id    Page identifier.
 * @returns     The content.
 */
function getReferencePage(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
        FS.readFile(Path.resolve(__dirname, "../../resources/api-reference/", id + ".html"),
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data.toString());
            });
    });
}

/**
 * Gnerates the API-Reference HTML.
 * @param page Requested page identifier.
 * @returns    The generated HTML.
 */
export async function generateReferenceHTML(page: string): Promise<{ status: number, content: string }> {
    let status = 200;
    let html = "";
    html += "<!DOCTYPE html><html lang=\"en\"><head>";
    html += "<meta charset=\"utf-8\">";
    html += "<link rel=\"shortcut icon\" href=\"/static/images/favicon.ico\">";
    html += "<link href=\"/static/style/api-reference-min.css?"
        + pkgVersion() + "\" rel=\"stylesheet\">";
    html += "<title>API Reference - Smogon Stats Site</title>";
    html += "</head><body>";

    if (!page) {
        page = MethodData.methods[0].id;
    }

    /* Menu */
    let selectedMethod = null;

    html += "<div class=\"menu\">";
    html += "<h3>API Reference</h3>";
    html += "<ul>";
    for (const method of MethodData.methods) {
        if (method.id === page) {
            selectedMethod = method;
        }
        html += "<li><a" + (method.id === page ? " class=\"selected\"" : "")
            + " href=\"/api/reference/" + method.id + "\">";
        html += escapeHTML(method.name);
        html += "</a></li>";
    }
    html += "</ul>";
    html += "</div>";

    /* Content */

    html += "<div class=\"content\">";
    if (selectedMethod) {
        try {
            html += await getReferencePage(page);
        } catch (err) {
            status = 404;
            html += "<h1>Page not found (404)</h1>";
            html += "<p>The page you are looking for was not found.</p>";
        }
    } else {
        status = 404;
        html += "<h1>Page not found (404)</h1>";
        html += "<p>The page you are looking for was not found.</p>";
    }
    html += "</div>";

    html += "</body></html>";
    return { status, content: html };
}

/**
 * API reference.
 * @param request   Client request.
 * @param response  Server response.
 */
export async function apiReferenceWebHandler(request: Express.Request, response: Express.Response) {
    const result = await generateReferenceHTML(request.params.page || "");
    response.writeHead(result.status, { "Content-Type": "text/html; charset=utf-8" });
    response.write(result.content);
    response.end();
}

realoadAPIReference();
