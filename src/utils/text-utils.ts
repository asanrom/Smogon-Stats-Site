/**
 * Text utils
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Utilities for working with strings.
 */

"use strict";

/**
 * Turns an input into a valid identifier using Pokemon Showdown standards.
 * @param input     Any input to transform.
 * @returns         The input string as an identifier.
 */
export function toId(input: any): string {
    if (typeof input === "string") {
        return input.toLowerCase().replace(/[^a-z0-9]/g, "");
    } else {
        return "";
    }
}

/**
 * Turns an input into a valid identifier (alphanumerics + dash).
 * @param input     Any input to transform.
 * @returns         The input string as an identifier.
 */
export function toIdWithDash(input: any): string {
    if (typeof input === "string") {
        return input.toLowerCase().replace(/[^a-z0-9-]/g, "");
    } else {
        return "";
    }
}

/**
 * Turns an input into a valid name.
 * @param input     Any input to transform.
 * @returns         The input string as a valid name.
 */
export function toName(input: any): string {
    if (typeof input === "string") {
        return input.trim();
    } else {
        return "";
    }
}

/**
 * Add zeros to the left in order to complete a number.
 * @param num       An integer number.
 * @param digits    Desired number of digits.
 * @returns         The number as a string, with the desired number of digits.
 */
export function addLeftZeros(num: number, digits: number): string {
    let res = "" + num;
    while (res.length < digits) {
        res = "0" + res;
    }
    return res;
}

/**
 * Escapes html reserved characters.
 * @param html      Input HTML text.
 * @returns         The escaped text.
 */
export function escapeHTML(html: string): string {
    return ("" + html).replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;").replace(/\//g, "&#x2f;");
}

/**
 * Capitalizes text (first letter uppercase).
 * @param txt       Input text.
 * @returns         The capitalized text.
 */
export function capitalize(txt: string): string {
    txt = ("" + txt);
    if (txt.length > 1) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    } else {
        return txt.toUpperCase();
    }
}
