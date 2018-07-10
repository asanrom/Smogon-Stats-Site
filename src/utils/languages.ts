/**
 * Multi-language tool
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Tool for working with language packages.
 */

"use strict";

import * as FS from "fs";
import * as Path from "path";
import { Logger } from "./logs";
import { escapeHTML } from "./text-utils";

const LANG_PATH = Path.resolve(__dirname, "../../resources/lang");

/**
 * Represents a language manager.
 * Allows to work with multiple languajes for text resurces,
 * used for end-user interfaces.
 */
export class Language {

    /**
     * Gets the language manager for a specific languaje.
     * @param id    Language identifier.
     * @returns     The instance of Language corresponding to the identifier.
     */
    public static get(id: string): Language {
        return Language.languages[id] || Language.defaultLang;
    }

    /**
     * Loads languages from text files in a directory.
     */
    public static loadLanguages() {
        FS.readdirSync(LANG_PATH).forEach((file) => {
            if (file.match(/^[a-z0-9-]+\.txt$/)) {
                const filePath = Path.resolve(LANG_PATH, file);
                const id = file.substr(0, file.length - 4);
                try {
                    Language.languages[id] = new Language(FS.readFileSync(filePath).toString());
                    Logger.getInstance().info("Language loaded: " + id + " (" + Language.languages[id].getName() + ")");
                } catch (err) {
                    Logger.getInstance().error(err);
                }
            }
        });
    }

    /**
     * Obtains the list of languages.
     * @returns The list of language identifiers.
     */
    public static list(): string[] {
        return Object.keys(Language.languages);
    }

    private static languages: object = {};
    private static defaultLang: Language = new Language("");

    private languageData: object;

    /**
     * Creates a new instance of Language.
     * @param packageContent Content of the language package.
     */
    constructor(packageContent: string) {
        this.languageData = {};

        const lines = packageContent.split("\n");
        let curr = this.languageData;
        for (let line of lines) {
            line = line.trim();
            if (line.length > 0 && line.charAt(0) !== "#") {
                if (line.charAt(0) === "@") {
                    if (line === "@@") {
                        curr = this.languageData;
                    } else if (line.length > 1) {
                        const parts = this.getIdParts(line.substr(1).trim());
                        for (const part of parts) {
                            if (typeof curr[part] !== "object") {
                                curr[part] = {};
                            }
                            curr = curr[part];
                        }
                    }
                } else {
                    const spaceIndex = line.indexOf(" ");
                    if (spaceIndex > 0) {
                        const parts = this.getIdParts(line.substr(0, spaceIndex).toLowerCase().trim());
                        let currAux = curr;
                        for (let i = 0; i < parts.length - 1; i++) {
                            const part = parts[i];
                            if (typeof currAux[part] !== "object") {
                                currAux[part] = {};
                            }
                            currAux = currAux[part];
                        }
                        const value = line.substr(spaceIndex + 1).trim();
                        currAux[parts[parts.length - 1]] = value;
                    }
                }
            }
        }
        // console.log(JSON.stringify(this.languageData));
    }

    /**
     * Obtains a text resource from the language package.
     * @param id        The text resource identifier.
     * @param replaces  An object with variable replacements (var -> value).
     */
    public getText(id: string, replaces?: object): string {
        const parts = this.getIdParts(id);
        let curr = this.languageData;
        for (const part of parts) {
            curr = curr[part];
            if (curr === undefined) {
                return escapeHTML(id);
            }
            if (typeof curr === "string") {
                return escapeHTML(this.replaceVars(curr, replaces || {}));
            }
        }
        return escapeHTML(id);
    }

    /**
     * Obtains aan html resource from the language package.
     * @param id        The text resource identifier.
     * @param replaces  An object with variable replacements (var -> value).
     */
    public getHtml(id: string, replaces?: object): string {
        const parts = this.getIdParts(id);
        let curr = this.languageData;
        for (const part of parts) {
            curr = curr[part];
            if (curr === undefined) {
                return id;
            }
            if (typeof curr === "string") {
                return this.replaceVars(curr, replaces || {});
            }
        }
        return id;
    }

    /**
     * Obtains the language name.
     * @returns The language name.
     */
    public getName(): string {
        return this.getText("lang.name");
    }

    private getIdParts(id: string): string[] {
        const idParts: string[] = [];
        const parts = id.split(".");
        for (const part of parts) {
            if (part.length > 0) {
                idParts.push(part);
            }
        }
        return idParts;
    }

    private replaceVars(template: string, vars: object): string {
        return template.replace(/\$\{[a-z0-9_]+\}/gi, (key) => {
            const v = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
            if (vars[v] !== undefined) {
                return ("" + vars[v]);
            } else {
                return key;
            }
        });
    }
}

Language.loadLanguages();
