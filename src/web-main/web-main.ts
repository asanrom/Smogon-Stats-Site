/**
 * Main web application.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as Path from "path";

import { Config } from "../config";
import { Storage } from "./../storage/storage";
import { Logger } from "./../utils/logs";
import { SmogonStatsAPI } from "./../web-api/api";

import { Language } from "../utils/languages";
import { BasePG } from "./page-generator/base";
import { FormatsListAbilitiesPG } from "./page-generator/formats-list-abilities";
import { FormatsListItemsPG } from "./page-generator/formats-list-items";
import { FormatsListLeadsPG } from "./page-generator/formats-list-leads";
import { FormatsListMetaPG } from "./page-generator/formats-list-meta";
import { FormatsListMovesPG } from "./page-generator/formats-list-moves";
import { FormatsListPokemonPG } from "./page-generator/formats-list-pokemon";
import { IGenerationData, newGenerationData } from "./page-generator/page-generator";

/**
 * Main web application.
 */
export class MainWebApplication {
    public app: Express.Express;

    private basePG: BasePG;
    private pokemonFormatsPG: FormatsListPokemonPG;
    private movesFormatsPG: FormatsListMovesPG;
    private itemsFormatsPG: FormatsListItemsPG;
    private abilitiesFormatsPG: FormatsListAbilitiesPG;
    private leadsFormatsPG: FormatsListLeadsPG;
    private metagameFormatsPG: FormatsListMetaPG;

    /**
     * Creates a new instance of MainWebApplication.
     */
    constructor() {
        this.basePG = new BasePG();
        this.pokemonFormatsPG = new FormatsListPokemonPG();
        this.movesFormatsPG = new FormatsListMovesPG();
        this.itemsFormatsPG = new FormatsListItemsPG();
        this.abilitiesFormatsPG = new FormatsListAbilitiesPG();
        this.leadsFormatsPG = new FormatsListLeadsPG();
        this.metagameFormatsPG = new FormatsListMetaPG();

        this.app = Express();
        this.app.get("/", this.homeHandler.bind(this));

        this.app.get("/pokemon", this.pokemonHomeHandler.bind(this));
        this.app.get("/pokemon/:month", this.pokemonMonthHandler.bind(this));
        this.app.get("/pokemon/:month/:format", this.pokemonFormatHandler.bind(this));
        this.app.get("/pokemon/:month/:format/:baseline", this.pokemonFormatBaselineHandler.bind(this));
        this.app.get("/pokemon/:month/:format/:baseline/:target", this.pokemonTargetHandler.bind(this));

        this.app.get("/moves", this.movesHomeHandler.bind(this));
        this.app.get("/moves/:month", this.movesMonthHandler.bind(this));
        this.app.get("/moves/:month/:format", this.movesFormatHandler.bind(this));
        this.app.get("/moves/:month/:format/:baseline", this.movesFormatBaselineHandler.bind(this));
        this.app.get("/moves/:month/:format/:baseline/:target", this.movesFormatBaselineHandler.bind(this));

        this.app.get("/items", this.itemsHomeHandler.bind(this));
        this.app.get("/items/:month", this.itemsMonthHandler.bind(this));
        this.app.get("/items/:month/:format", this.itemsFormatHandler.bind(this));
        this.app.get("/items/:month/:format/:baseline", this.itemsFormatBaselineHandler.bind(this));
        this.app.get("/items/:month/:format/:baseline/:target", this.itemsTargetHandler.bind(this));

        this.app.get("/abilities", this.abilitiesHomeHandler.bind(this));
        this.app.get("/abilities/:month", this.abilitiesMonthHandler.bind(this));
        this.app.get("/abilities/:month/:format", this.abilitiesFormatHandler.bind(this));
        this.app.get("/abilities/:month/:format/:baseline", this.abilitiesFormatBaselineHandler.bind(this));
        this.app.get("/abilities/:month/:format/:baseline/:target", this.abilitiesTargetHandler.bind(this));

        this.app.get("/leads", this.leadsHomeHandler.bind(this));
        this.app.get("/leads/:month", this.leadsMonthHandler.bind(this));
        this.app.get("/leads/:month/:format", this.leadsFormatHandler.bind(this));
        this.app.get("/leads/:month/:format/:baseline", this.leadsFormatBaselineHandler.bind(this));

        this.app.get("/metagame", this.metagameHomeHandler.bind(this));
        this.app.get("/metagame/:month", this.metagameMonthHandler.bind(this));
        this.app.get("/metagame/:month/:format", this.metagameFormatHandler.bind(this));
        this.app.get("/metagame/:month/:format/:baseline", this.metagameFormatBaselineHandler.bind(this));
    }

    /* Utils */

    private getLanguage(request: Express.Request): string {
        if (request.cookies.lang) {
            return request.cookies.lang;
        } else if (typeof request.headers["accept-language"] === "string") {
            const locale = (request.headers["accept-language"] + "").split(",")[0].toLowerCase().trim();
            if (Language.list().indexOf(locale) >= 0) {
                return locale;
            } else {
                return "en";
            }
        }
    }

    private parseMonth(request: Express.Request, genData: IGenerationData) {
        if (request.params.month) {
            if (request.params.month === "last") {
                const last = SmogonStatsAPI.getDefaultMonth(genData.months);
                genData.year = last.year;
                genData.month = last.month;
            } else {
                const parts = (request.params.month + "").split("-");
                if (parts.length === 2) {
                    genData.year = parseInt(parts[0], 10);
                    genData.month = parseInt(parts[1], 10);
                }
            }
        }
    }

    private checkMonth(genData: IGenerationData): boolean {
        for (const month of genData.months) {
            if (month.year === genData.year && month.month === genData.month) {
                return true;
            }
        }
        return false;
    }

    private serveNotFoundPage(genData: IGenerationData, response: Express.Response) {
        response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        response.end();
    }

    /* Home */

    private homeHandler(request: Express.Request, response: Express.Response) {
        this.pokemonHomeHandler(request, response);
    }

    /* Pokemon */

    private pokemonHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.pokemonMonthHandler(request, response);
    }

    private async pokemonMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "pokemon";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsPokemon = await SmogonStatsAPI
                .getFormatsPokemon(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.pokemonFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private pokemonFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private pokemonFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private pokemonTargetHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    /* Moves */

    private movesHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.movesMonthHandler(request, response);
    }

    private async movesMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "moves";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsMoves = await SmogonStatsAPI
                .getFormatsMoves(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.movesFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private movesFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private movesFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private movesTargetHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    /* Items */

    private itemsHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.itemsMonthHandler(request, response);
    }

    private async itemsMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "items";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsItems = await SmogonStatsAPI
                .getFormatsItems(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.itemsFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private itemsFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private itemsFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private itemsTargetHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    /* Abilities */

    private abilitiesHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.abilitiesMonthHandler(request, response);
    }

    private async abilitiesMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "abilities";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsAbilities = await SmogonStatsAPI
                .getFormatsAbilities(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.abilitiesFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private abilitiesFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private abilitiesFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private abilitiesTargetHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    /* Leads */

    private leadsHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.leadsMonthHandler(request, response);
    }

    private async leadsMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "leads";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsLeads = await SmogonStatsAPI
                .getFormatsLeads(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.leadsFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private leadsFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    private leadsFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }

    /* Metagame */

    private metagameHomeHandler(request: Express.Request, response: Express.Response) {
        request.params.month = "last";
        this.metagameMonthHandler(request, response);
    }

    private async metagameMonthHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "metagame";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.statsData.formatsMetagame = await SmogonStatsAPI
                .getFormatsMetagame(genData.year, genData.month);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                response.write(html);
            }, this.metagameFormatsPG);
            response.end();
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private metagameFormatHandler(request: Express.Request, response: Express.Response) {
        response.end();

    }

    private metagameFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        response.end();
    }
}
