/**
 * Application
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Main application object. Loads the modules and creates the server.
 */

"use strict";

import * as BodyParser from "body-parser";
import * as CookieParser from "cookie-parser";
import * as Express from "express";
import * as FS from "fs";
import * as HTTP from "http";
import * as HTTPS from "https";
import * as Path from "path";
import { Config } from "./config";
import { Logger } from "./utils/logs";
import { ControlPanelWebApplication } from "./web-admin/web-admin";
import { APIWebApplication } from "./web-api/web-api";
import { MainWebApplication } from "./web-main/web-main";

/**
 * Represents the web application: Smogon Usage Stats Site.
 */
export class SmogonUsageStatsSite {
    private app: Express.Express;
    private controlPanel: ControlPanelWebApplication;
    private mainApp: MainWebApplication;
    private apiApp: APIWebApplication;

    /**
     * Creates a new instance of SmogonUsageStatsSite.
     */
    constructor() {
        this.app = Express();
        this.controlPanel = new ControlPanelWebApplication();
        this.mainApp = new MainWebApplication();
        this.apiApp = new APIWebApplication();
        this.configureApplication();
    }

    /**
     * Starts the listening process.
     */
    public listen() {
        if (Config.portHTTP) {
            if (Config.redirectSecure) {
                HTTP.createServer((request, response) => {
                    response.writeHead(301, { Location: "https://" + request.headers.host + request.url });
                    response.end();
                }).on("error", (e: any) => {
                    if (e.code === "EADDRINUSE") {
                        process.send({ type: "fatal", msg: (e.code + " - " + e.message) });
                    }
                }).listen(Config.portHTTP, Config.bindAddress, () => {
                    Logger.getInstance().info("[HTTP] Application listening on "
                        + Config.bindAddress + ":" + Config.portHTTP);
                });
            } else {
                HTTP.createServer(this.app).on("error", (e: any) => {
                    if (e.code === "EADDRINUSE") {
                        process.send({ type: "fatal", msg: (e.code + " - " + e.message) });
                    }
                }).listen(Config.portHTTP, Config.bindAddress, () => {
                    Logger.getInstance().info("[HTTP] Application listening on "
                        + Config.bindAddress + ":" + Config.portHTTP);
                });
            }
        }

        if (Config.portHTTPS && Config.certificate && Config.privateKey) {
            HTTPS.createServer({
                cert: FS.readFileSync(Config.certificate),
                key: FS.readFileSync(Config.privateKey),
            }, this.app).on("error", (e: any) => {
                if (e.code === "EADDRINUSE") {
                    process.send({ type: "fatal", msg: (e.code + " - " + e.message) });
                }
            }).listen(Config.portHTTP, Config.bindAddress, () => {
                Logger.getInstance().info("[HTTPS] Application listening on "
                    + Config.bindAddress + ":" + Config.portHTTP);
            });
        }
    }

    private configureApplication() {
        /* Firewall */
        this.app.all("*", this.firewall.bind(this));
        /* Middleware */
        this.app.use(BodyParser.json());
        this.app.use(BodyParser.urlencoded({ extended: true }));
        this.app.use(CookieParser());
        /* Static configuration */
        this.app.use("/md-icons", Express.static(require("material-design-icons").STATIC_PATH));
        this.app.use("/static", Express.static(Path.resolve(__dirname, "../public")));
        this.app.use("/favicon.ico", Express.static(Path.resolve(__dirname, "../public/images/favicon.ico")));
        this.app.use("/robots.txt", Express.static(Path.resolve(__dirname, "../public/robots.txt")));
        /* Modules */
        this.app.use(this.controlPanel.app);
        this.app.use(this.apiApp.app);
        this.app.use(this.mainApp.app);
    }

    private firewall(request: Express.Request, response: Express.Response, next) {
        Logger.getInstance().info("SERVED " + JSON.stringify(request.path) + " FOR " + request.ip);
        next();
    }
}
