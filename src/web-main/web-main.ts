/**
 * Main web application.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import { getFormatName } from "../utils/formats-names";
import { Language } from "../utils/languages";
import { getPokemonName } from "../utils/pokemon-names";
import { toId } from "../utils/text-utils";
import { SmogonStatsAPI } from "./../web-api/api";
import { BasePG } from "./page-generator/base";
import { FormatMetagamePG } from "./page-generator/format-metagame";
import { FormatsListAbilitiesPG } from "./page-generator/formats-list-abilities";
import { FormatsListItemsPG } from "./page-generator/formats-list-items";
import { FormatsListLeadsPG } from "./page-generator/formats-list-leads";
import { FormatsListMetaPG } from "./page-generator/formats-list-meta";
import { FormatsListMovesPG } from "./page-generator/formats-list-moves";
import { FormatsListPokemonPG } from "./page-generator/formats-list-pokemon";
import { NotFoundPG } from "./page-generator/not-found";
import { IGenerationData, newGenerationData } from "./page-generator/page-generator";
import { DataPokemonPG } from "./page-generator/pokemon-data";
import { RankingAbilitiesPG } from "./page-generator/rank-abilities";
import { RankingItemsPG } from "./page-generator/rank-items";
import { RankingLeadsPG } from "./page-generator/rank-leads";
import { RankingMovesPG } from "./page-generator/rank-moves";
import { RankingPokemonPG } from "./page-generator/rank-pokemon";

/**
 * Main web application.
 */
export class MainWebApplication {
    public app: Express.Express;

    private basePG: BasePG;
    private notFoundPG: NotFoundPG;

    private pokemonFormatsPG: FormatsListPokemonPG;
    private movesFormatsPG: FormatsListMovesPG;
    private itemsFormatsPG: FormatsListItemsPG;
    private abilitiesFormatsPG: FormatsListAbilitiesPG;
    private leadsFormatsPG: FormatsListLeadsPG;
    private metagameFormatsPG: FormatsListMetaPG;

    private pokemonRankingPG: RankingPokemonPG;
    private pokemonDataPG: DataPokemonPG;
    private movesRankingPG: RankingMovesPG;
    private itemsRankingPG: RankingItemsPG;
    private abilitiesRankingPG: RankingAbilitiesPG;
    private leadsRankingPG: RankingLeadsPG;
    private metagamePG: FormatMetagamePG;

    /**
     * Creates a new instance of MainWebApplication.
     */
    constructor() {
        this.basePG = new BasePG();
        this.notFoundPG = new NotFoundPG();
        this.pokemonFormatsPG = new FormatsListPokemonPG();
        this.movesFormatsPG = new FormatsListMovesPG();
        this.itemsFormatsPG = new FormatsListItemsPG();
        this.abilitiesFormatsPG = new FormatsListAbilitiesPG();
        this.leadsFormatsPG = new FormatsListLeadsPG();
        this.metagameFormatsPG = new FormatsListMetaPG();
        this.pokemonRankingPG = new RankingPokemonPG();
        this.movesRankingPG = new RankingMovesPG();
        this.itemsRankingPG = new RankingItemsPG();
        this.abilitiesRankingPG = new RankingAbilitiesPG();
        this.leadsRankingPG = new RankingLeadsPG();
        this.pokemonDataPG = new DataPokemonPG();
        this.metagamePG = new FormatMetagamePG();

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

        this.app.get("/items", this.itemsHomeHandler.bind(this));
        this.app.get("/items/:month", this.itemsMonthHandler.bind(this));
        this.app.get("/items/:month/:format", this.itemsFormatHandler.bind(this));
        this.app.get("/items/:month/:format/:baseline", this.itemsFormatBaselineHandler.bind(this));

        this.app.get("/abilities", this.abilitiesHomeHandler.bind(this));
        this.app.get("/abilities/:month", this.abilitiesMonthHandler.bind(this));
        this.app.get("/abilities/:month/:format", this.abilitiesFormatHandler.bind(this));
        this.app.get("/abilities/:month/:format/:baseline", this.abilitiesFormatBaselineHandler.bind(this));

        this.app.get("/leads", this.leadsHomeHandler.bind(this));
        this.app.get("/leads/:month", this.leadsMonthHandler.bind(this));
        this.app.get("/leads/:month/:format", this.leadsFormatHandler.bind(this));
        this.app.get("/leads/:month/:format/:baseline", this.leadsFormatBaselineHandler.bind(this));

        this.app.get("/metagame", this.metagameHomeHandler.bind(this));
        this.app.get("/metagame/:month", this.metagameMonthHandler.bind(this));
        this.app.get("/metagame/:month/:format", this.metagameFormatHandler.bind(this));
        this.app.get("/metagame/:month/:format/:baseline", this.metagameFormatBaselineHandler.bind(this));

        this.app.get("*", this.featureNotFoundhandler.bind(this));
    }

    /* Utils */

    private getLanguage(request: Express.Request): string {
        if (request.cookies.lang) {
            return request.cookies.lang;
        } else if (typeof request.headers["accept-language"] === "string") {
            const locale = (request.headers["accept-language"] + "").substr(0, 2).toLowerCase();;
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
        this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
            response.write(html);
        }, this.notFoundPG);
        response.end();
    }

    /* Home */

    private homeHandler(request: Express.Request, response: Express.Response) {
        this.pokemonHomeHandler(request, response);
    }

    /* Not found */

    private async featureNotFoundhandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        request.params.month = "last";
        genData.feature = "";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = true;
        this.serveNotFoundPage(genData, response);
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
        request.params.baseline = "default";
        this.pokemonFormatBaselineHandler(request, response);
    }

    private async pokemonFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "pokemon";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getBaselinesPkmn(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.rankingPokemon = await SmogonStatsAPI
                        .getPokemonRanking(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.pokemonRankingPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }

    private async pokemonTargetHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "pokemon";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getBaselinesPkmn(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.target = toId(request.params.target || "");
                    genData.targetName = getPokemonName(genData.target) || "(Not Found)";
                    genData.statsData.rankingPokemon = await SmogonStatsAPI
                        .getPokemonRanking(genData.year, genData.month, genData.format, genData.baseline);
                    genData.statsData.pokemonData = await SmogonStatsAPI
                        .getPokemonData(genData.year, genData.month,
                            genData.format, genData.baseline, genData.target);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.pokemonDataPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
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
        request.params.baseline = "default";
        this.movesFormatBaselineHandler(request, response);
    }

    private async movesFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "moves";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getBaselinesMvs(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.rankingMoves = await SmogonStatsAPI
                        .getMovesRanking(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.movesRankingPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
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
        request.params.baseline = "default";
        this.itemsFormatBaselineHandler(request, response);
    }

    private async itemsFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "items";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getbaselinesItms(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.rankingItems = await SmogonStatsAPI
                        .getItemsRanking(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.itemsRankingPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
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
        request.params.baseline = "default";
        this.abilitiesFormatBaselineHandler(request, response);
    }

    private async abilitiesFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "abilities";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getBaselinesAbl(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.rankingAbilities = await SmogonStatsAPI
                        .getAbilitiesRanking(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.abilitiesRankingPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
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
        request.params.baseline = "default";
        this.leadsFormatBaselineHandler(request, response);
    }

    private async leadsFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "leads";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.getBaselinesLeads(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.rankingLeads = await SmogonStatsAPI
                        .getLeadsRanking(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.leadsRankingPG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
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
        request.params.baseline = "default";
        this.metagameFormatBaselineHandler(request, response);
    }

    private async metagameFormatBaselineHandler(request: Express.Request, response: Express.Response) {
        const genData = newGenerationData();
        genData.feature = "metagame";
        genData.language = this.getLanguage(request);
        genData.cookies = request.cookies || {};
        genData.months = await SmogonStatsAPI.getMonths();
        this.parseMonth(request, genData);
        genData.isNotFound = !this.checkMonth(genData);

        if (!genData.isNotFound) {
            genData.format = toId(request.params.format || "");
            genData.formatName = getFormatName(genData.format);
            const baselines = await
                SmogonStatsAPI.gettBaselinesMeta(genData.year, genData.month, genData.format);
            if (baselines.length !== 0) {
                if (request.params.baseline === "default") {
                    genData.baseline = SmogonStatsAPI.getDefaultBaseline(baselines);
                } else {
                    genData.baseline = parseInt(request.params.baseline, 10);
                }
                if (baselines.indexOf(genData.baseline) < 0) {
                    this.serveNotFoundPage(genData, response);
                } else {
                    genData.statsData.metagameInfo = await SmogonStatsAPI
                        .getMetagameStats(genData.year, genData.month, genData.format, genData.baseline);
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    this.basePG.generateHTML(genData, Language.get(genData.language), (html) => {
                        response.write(html);
                    }, this.metagamePG);
                    response.end();
                }
            } else {
                this.serveNotFoundPage(genData, response);
            }
        } else {
            this.serveNotFoundPage(genData, response);
        }
    }
}
