/**
 * Usage data tables parser
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { PokemonData } from "../model/data-pokemon";
import { toId } from "../utils/text-utils";

type TablesParserHandler = (name: string, data: PokemonData) => Promise<void>;

/**
 * Parses a percent string.
 * @param str   The percent as string.
 * @returns     The percent value as a number.
 */
function parsePercent(str) {
    return parseFloat((str || "").replace("%", "").trim());
}

/**
 * Parses an usage data table.
 * @param txt       The table as raw text.
 * @param handler   The handler for the parsed data.
 */
export async function parseUsageDataTable(txt: string, handler: TablesParserHandler) {
    const pokes = txt.split(" +----------------------------------------+ \n" +
        " +----------------------------------------+ \n");

    for (const pokeStr of pokes) {
        const pokemon: PokemonData = new PokemonData(null);

        const sections = pokeStr.split(" +----------------------------------------+ ");
        if (!sections[0]) {
            sections.shift();
        }

        pokemon.name = toId(sections[0]);

        if (sections[1]) {
            const lines = sections[1].split("\n");
            for (const line of lines) {
                if (line.indexOf(":") >= 0) {
                    const spl = line.split(":");
                    const id = toId(spl[0]);
                    const val = (spl[1] || "").trim();
                    if (id === "rawcount") {
                        pokemon.raw = parseInt(val, 10);
                    } else if (id === "avgweight") {
                        pokemon.avgWeight = parseFloat(val);
                    } else if (id === "viabilityceiling") {
                        pokemon.viability = parseInt(val, 10);
                    }
                }
            }
        }

        for (let k = 2; k < sections.length; k++) {
            const lines = sections[k].split("\n");
            const subject = toId(lines[1] || "");
            if (subject === "abilities") {
                for (let j = 2; j < lines.length; j++) {
                    let spl = lines[j].split("|");
                    if (spl[1]) {
                        spl = spl[1].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const name = toId(spl.join(" "));
                        if (name) {
                            pokemon.abilities.push({ name, usage: percent });
                        }
                    }
                }
            } else if (subject === "moves") {
                for (let j = 2; j < lines.length; j++) {
                    let spl = lines[j].split("|");
                    if (spl[1]) {
                        spl = spl[1].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const name = toId(spl.join(" "));
                        if (name) {
                            pokemon.moves.push({ name, usage: percent });
                        }
                    }
                }
            } else if (subject === "items") {
                for (let j = 2; j < lines.length; j++) {
                    let spl = lines[j].split("|");
                    if (spl[1]) {
                        spl = spl[1].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const name = toId(spl.join(" "));
                        if (name) {
                            pokemon.items.push({ name, usage: percent });
                        }
                    }
                }
            } else if (subject === "spreads") {
                for (let j = 2; j < lines.length; j++) {
                    let spl = lines[j].split("|");
                    if (spl[1]) {
                        spl = spl[1].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const spread = spl.join(" ").trim();
                        spl = spread.split(":");
                        const nature = toId(spl[0]);
                        spl = (spl[1] || "").split("/");
                        const stats = {
                            atk: parseInt(spl[1] || "", 10),
                            def: parseInt(spl[2] || "", 10),
                            hp: parseInt(spl[0] || "", 10),
                            spa: parseInt(spl[3] || "", 10),
                            spd: parseInt(spl[4] || "", 10),
                            spe: parseInt(spl[5] || "", 10),
                        };
                        pokemon.spreads.push({
                            atk: stats.atk,
                            def: stats.def,
                            hp: stats.hp,
                            nature,
                            spa: stats.spa,
                            spd: stats.spd,
                            spe: stats.spe,
                            usage: percent,
                        });
                    }
                }
            } else if (subject === "teammates") {
                for (let j = 2; j < lines.length; j++) {
                    let spl = lines[j].split("|");
                    if (spl[1]) {
                        spl = spl[1].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const name = toId(spl.join(" "));
                        if (toId(name)) {
                            pokemon.teammates.push({ name, usage: percent });
                        }
                    }
                }
            } else if (subject === "checksandcounters") {
                for (let j = 2; j < lines.length; j += 2) {
                    let spl = lines[j].split("|");
                    let spl2 = (lines[j + 1] || "").split("|");
                    if (spl[1] && spl2[1]) {
                        spl = spl[1].split("(")[0].trim().split(" ");
                        const percent = parsePercent(spl.pop());
                        const name = toId(spl.join(" "));
                        if (toId(name)) {
                            spl2 = spl2[1].replace("(", "").replace(")", "").trim().split("/");
                            const ko = parsePercent(spl2[0].trim().split(" ")[0]);
                            const sw = parsePercent((spl2[1] || "").trim().split(" ")[0]);
                            pokemon.counters.push({ name, total: percent, ko, switch: sw });
                        }
                    }
                }
            }
        }

        await handler(pokemon.name, pokemon);
    }
}
