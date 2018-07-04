/**
 * Time utils
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Utilities for working with dates and time.
 */

"use strict";

/**
 * Represents a simple date (Day, Month, Year).
 */
export interface ISimpleDate {
    day: number;
    month: number;
    year: number;
}

const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Gets the difference in days between 2 dates.
 * @param date1     The first date.
 * @param date2     The second date.
 * @returns         The difference in days.
 */
export function dateDiff(date1: ISimpleDate, date2: ISimpleDate) {
    let dif = 0;
    let daysA = 0;
    let daysB = 0;
    dif += 365 * (date1.year - date2.year);
    for (let i = 1; i < date1.month; i++) { daysA += days[i]; }
    daysA += date1.day;
    for (let i = 1; i < date2.month; i++) { daysB += days[i]; }
    daysB += date2.day;
    dif += (daysA - daysB);
    dif = Math.abs(dif);
    return dif;
}

const months = ["", "january", "february", "march", "april", "may", "june", "july",
    "august", "september", "october", "november", "december"];

/**
 * Obtains a month name.
 * @param num   The month number (1 = January).
 * @returns     The month name.
 */
export function getMonth(num: number): string {
    return months[num];
}
