/**
 * API (web application).
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { addLeftZeros, toId } from "../utils/text-utils";
import { SmogonStatsAPI } from "./api";
import {
    callAPIFormatsAbilities, callAPIFormatsItems,
    callAPIFormatsLeads, callAPIFormatsMetagame,
    callAPIFormatsMoves, callAPIFormatsPokemon,
} from "./formats";
import { callAPIMetagame } from "./metagame";
import { callAPIPokemonData } from "./poke-data";
import {
    callAPIRankingAbilities, callAPIRankingItems,
    callAPIRankingLeads, callAPIRankingMoves,
    callAPIRankingPokemon,
} from "./ranking";

/**
 * API (web application).
 */
export class APIWebApplication {
    public app: Express.Express;

    /**
     * Creates a new instance of APIWebApplication.
     */
    constructor() {
        this.app = Express();

        this.app.get("/api/pokemon/formats", this.pokemonFormatsHandler.bind(this));
        this.app.get("/api/pokemon/ranking", this.pokemonRankingHandler.bind(this));
        this.app.get("/api/pokemon/data", this.pokemonDataHandler.bind(this));
        this.app.get("/api-:mode/pokemon/formats", this.pokemonFormatsHandler.bind(this));
        this.app.get("/api-:mode/pokemon/ranking", this.pokemonRankingHandler.bind(this));
        this.app.get("/api-:mode/pokemon/data", this.pokemonDataHandler.bind(this));

        this.app.get("/api/moves/formats", this.movesFormatsHandler.bind(this));
        this.app.get("/api/moves/ranking", this.movesRankingHandler.bind(this));
        this.app.get("/api-:mode/moves/formats", this.movesFormatsHandler.bind(this));
        this.app.get("/api-:mode/moves/ranking", this.movesRankingHandler.bind(this));

        this.app.get("/api/items/formats", this.itemsFormatsHandler.bind(this));
        this.app.get("/api/items/ranking", this.itemsRankingHandler.bind(this));
        this.app.get("/api-:mode/items/formats", this.itemsFormatsHandler.bind(this));
        this.app.get("/api-:mode/items/ranking", this.itemsRankingHandler.bind(this));

        this.app.get("/api/abilities/formats", this.abilitiesFormatsHandler.bind(this));
        this.app.get("/api/abilities/ranking", this.abilitiesRankingHandler.bind(this));
        this.app.get("/api-:mode/abilities/formats", this.abilitiesFormatsHandler.bind(this));
        this.app.get("/api-:mode/abilities/ranking", this.abilitiesRankingHandler.bind(this));

        this.app.get("/api/leads/formats", this.leadsFormatsHandler.bind(this));
        this.app.get("/api/leads/ranking", this.leadsRankingHandler.bind(this));
        this.app.get("/api-:mode/leads/formats", this.leadsFormatsHandler.bind(this));
        this.app.get("/api-:mode/leads/ranking", this.leadsRankingHandler.bind(this));

        this.app.get("/api/metagame/formats", this.metagameFormatsHandler.bind(this));
        this.app.get("/api/metagame/data", this.metagameDataHandler.bind(this));
        this.app.get("/api-:mode/metagame/formats", this.metagameFormatsHandler.bind(this));
        this.app.get("/api-:mode/metagame/data", this.metagameDataHandler.bind(this));

        this.app.get("/api/months", this.monthsHandler.bind(this));
        this.app.get("/api-:mode/months", this.monthsHandler.bind(this));

        this.app.get("/api/*", this.notFoundHandler.bind(this));
        this.app.get("/api-:mode/*", this.notFoundHandler.bind(this));
    }

    /* Handlers */

    private notFoundHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        if (toId(request.query["return-as"]) === "xml") {
            response.writeHead(404, { "Content-Type": "application/xml; charset=utf-8" });
            response.write(XML({
                error: [{ _attr: { code: 404 } },
                    "The API call you are looking for was not found."],
            }, { indent: "  " }));
        } else {
            response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
            response.write(JSON.stringify({
                error: {
                    code: 404,
                    message: "The API call you are looking for was not found.",
                },
            }, null, 2));
        }
        response.end();
    }

    private async monthsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        const months = await SmogonStatsAPI.getMonths();
        if (toId(request.query["return-as"]) === "xml") {
            const result = { months: [] };
            for (const month of months) {
                result.months.push({
                    month: [{
                        _attr: {
                            year: month.year,
                            month: month.month,
                        },
                    }, (month.year + "-" + addLeftZeros(month.month, 2))],
                });
            }
            response.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
            response.write(XML(result, { indent: "  " }));
        } else {
            const result = { months: [] };
            for (const month of months) {
                result.months.push({
                    id: (month.year + "-" + addLeftZeros(month.month, 2)),
                    year: month.year,
                    month: month.month,
                });
            }
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            response.write(JSON.stringify(result, null, 2));
        }
        response.end();
    }

    private pokemonFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsPokemon(request, response);
    }

    private pokemonRankingHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIRankingPokemon(request, response);
    }

    private pokemonDataHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIPokemonData(request, response);
    }

    private movesFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsMoves(request, response);
    }

    private movesRankingHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIRankingMoves(request, response);
    }

    private itemsFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsItems(request, response);
    }

    private itemsRankingHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIRankingItems(request, response);
    }

    private abilitiesFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsAbilities(request, response);
    }

    private abilitiesRankingHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIRankingAbilities(request, response);
    }

    private leadsFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsLeads(request, response);
    }

    private leadsRankingHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIRankingLeads(request, response);
    }

    private metagameFormatsHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIFormatsMetagame(request, response);
    }

    private metagameDataHandler(request: Express.Request, response: Express.Response) {
        if (request.params.mode) {
            request.query["return-as"] = request.params.mode;
        }
        callAPIMetagame(request, response);
    }
}
