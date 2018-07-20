/**
 * API (web application).
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Express from "express";
import * as XML from "xml";
import { toId } from "../utils/text-utils";
import {
    callAPIFormatsAbilities, callAPIFormatsItems,
    callAPIFormatsLeads, callAPIFormatsMetagame,
    callAPIFormatsMoves, callAPIFormatsPokemon,
} from "./formats";

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

        this.app.get("/api/moves/formats", this.movesFormatsHandler.bind(this));
        this.app.get("/api/moves/ranking", this.movesRankingHandler.bind(this));

        this.app.get("/api/items/formats", this.itemsFormatsHandler.bind(this));
        this.app.get("/api/items/ranking", this.itemsRankingHandler.bind(this));

        this.app.get("/api/abilities/formats", this.abilitiesFormatsHandler.bind(this));
        this.app.get("/api/abilities/ranking", this.abilitiesRankingHandler.bind(this));

        this.app.get("/api/leads/formats", this.leadsFormatsHandler.bind(this));
        this.app.get("/api/leads/ranking", this.leadsRankingHandler.bind(this));

        this.app.get("/api/metagame/formats", this.metagameFormatsHandler.bind(this));
        this.app.get("/api/metagame/data", this.metagameDataHandler.bind(this));

        this.app.get("/api/*", this.notFoundHandler.bind(this));
    }

    /* Handlers */

    private notFoundHandler(request: Express.Request, response: Express.Response) {
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

    private pokemonFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsPokemon(request, response);
    }

    private pokemonRankingHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private pokemonDataHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private movesFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsMoves(request, response);
    }

    private movesRankingHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private itemsFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsItems(request, response);
    }

    private itemsRankingHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private abilitiesFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsAbilities(request, response);
    }

    private abilitiesRankingHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private leadsFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsLeads(request, response);
    }

    private leadsRankingHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }

    private metagameFormatsHandler(request: Express.Request, response: Express.Response) {
        callAPIFormatsMetagame(request, response);
    }

    private metagameDataHandler(request: Express.Request, response: Express.Response) {
        this.notFoundHandler(request, response);
    }
}
