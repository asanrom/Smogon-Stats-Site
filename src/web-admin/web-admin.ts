/**
 * Web-Application for control panel.
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import * as Crypto from "crypto";
import * as Express from "express";
import * as Path from "path";

import { Config } from "../config";
import { IMonthStatus } from "../crawler/months-list";
import { Storage } from "./../storage/storage";
import { Logger } from "./../utils/logs";
import { generateControlPanelPage, generateLoginPage } from "./page-generator";

const MAX_TOKEN_DURATION = 24 * 60 * 60 * 1000;
const TOKEN_LENGTH = 32;

/**
 * Control panel (Web Application).
 */
export class ControlPanelWebApplication {
    public app: Express.Express;
    private sessions: { [s: string]: number };
    private bannedIps: { [s: string]: boolean };

    /**
     * Creates a new instance of ControlPanelWebApplication.
     */
    constructor() {
        this.app = Express();
        this.sessions = {};
        this.bannedIps = {};
        this.app.all("/admin", this.adminWebHandler.bind(this));
        this.app.post("/admin/action", this.actionHandler.bind(this));
        process.on("message", this.processMessageHandler.bind(this));
    }

    /**
     * Adds a session token.
     * @param token The session token to add.
     */
    public addSession(token: string) {
        this.sessions[token] = Date.now();
    }

    /**
     * Removes a session token.
     * @param token The session token to remove.
     */
    public removeSession(token: string) {
        delete this.sessions[token];
    }

    private printControlPanelWeb(response: Express.Response) {
        Storage.get("stats.months").then((data) => {
            Storage.get("crawler.status").then((status) => {
                generateControlPanelPage((html) => {
                    response.write(html);
                }, Object.values(data), status ? !status.disabled : true,
                    Math.floor(process.uptime() * 1000));
                response.end();
            });
        });
    }

    private adminWebHandler(request: Express.Request, response: Express.Response) {
        this.checkSessions();
        if (!this.checkToken(request.cookies.token)) {
            const username = request.body.username || "";
            const password = request.body.password || "";
            const error = "";
            if (this.bannedIps[request.ip] && username) {
                response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                generateLoginPage((html) => {
                    response.write(html);
                }, "You are locked and cannot try to login anymore.");
            } else if (Config.controlPanelUsername === username) {
                const passwdHash = Crypto.createHash(Config.controlPanelPasswdAlgo)
                    .update(password)
                    .update(Config.controlPanelPasswdSalt)
                    .digest().toString("hex");
                if (passwdHash === Config.controlPanelPasswdHash) {
                    const token = this.createSessionToken();
                    Logger.getInstance().info("[ADMIN] BY=" + request.ip + "; LOGIN SUCESS");
                    response.writeHead(200, {
                        "Content-Type": "text/html; charset=utf-8",
                        "Set-Cookie": "token=" + token + "; Path=/",
                    });
                    this.printControlPanelWeb(response);
                    return;
                } else {
                    process.send({ type: "login-try", ip: request.ip });
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    generateLoginPage((html) => {
                        response.write(html);
                    }, "Invalid username or password.");
                }
            } else if (username) {
                process.send({ type: "login-try", ip: request.ip });
                response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                generateLoginPage((html) => {
                    response.write(html);
                }, "Invalid username or password.");
            } else {
                response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                generateLoginPage((html) => {
                    response.write(html);
                });
            }
        } else {
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            this.printControlPanelWeb(response);
            return;
        }
        response.end();
    }

    private actionHandler(request: Express.Request, response: Express.Response) {
        if (!this.checkToken(request.cookies.token)) {
            response.writeHead(401, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ error: "Access denied." }));
            response.end();
            return;
        }

        Logger.getInstance().info("[ADMIN] BY=" + request.ip + ";ACTION="
            + request.body.action + "; ARG=" + request.body.arg);

        const result = {
            done: "",
        };
        switch (request.body.action) {
            case "logout":
                this.closeSession(request.cookies.token);
                result.done = "Logged out";
                break;
            case "crawler-status":
                this.changeCrawlerStatus(("" + request.body.arg) === "true");
                if (("" + request.body.arg) === "true") {
                    result.done = "Crawler enabled.";
                } else {
                    result.done = "Crawler disabled.";
                }
                break;
            case "add-pending":
                this.markMonthAsPending(request.body.arg);
                result.done = "Month pending to download and parse.";
                break;
            case "delete-month":
                this.deleteMonth(request.body.arg);
                result.done = "Month pending to delete.";
                break;
            case "interrupt":
                this.interruptMonth(request.body.arg);
                result.done = "Interrupted sucessfully.";
                break;
            case "clear-cache":
                this.clearCache();
                result.done = "Cleared cache.";
                break;
            case "reload-res":
                this.reloadResources();
                result.done = "Reloaded resources.";
                break;
            case "stop-app":
                this.stopApplication();
                result.done = "Application stopped.";
                response.writeHead(200, { "Content-Type": "application/json" });
                response.write(JSON.stringify(result));
                response.end();
                this.stopApplication();
                return;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.write(JSON.stringify(result));
        response.end();
    }

    private processMessageHandler(message: any) {
        switch (message.type) {
            case "admin-token":
                this.addSession(message.token);
                break;
            case "admin-token-remove":
                this.removeSession(message.token);
                break;
            case "admin-lock":
                this.bannedIps[message.ip] = true;
                break;
            case "admin-unlock":
                delete this.bannedIps[message.ip];
                break;
        }
    }

    private stopApplication() {
        process.send({ type: "stop", msg: "Stop via control panel." });
    }

    private reloadResources() {
        process.send({ type: "reload" });
    }

    private clearCache() {
        process.send({ type: "clear-cache" });
    }

    private interruptMonth(mid: number) {
        process.send({ type: "crawler", action: "stop", month: mid });
    }

    private markMonthAsPending(mid: number) {
        process.send({ type: "crawler", action: "pending", month: mid });
    }

    private deleteMonth(mid: number) {
        process.send({ type: "crawler", action: "delete", month: mid });
    }

    private changeCrawlerStatus(enabled: boolean) {
        if (enabled) {
            process.send({ type: "crawler", action: "enable" });
        } else {
            process.send({ type: "crawler", action: "disable" });
        }
    }

    private checkToken(token: string): boolean {
        if (token) {
            return !!this.sessions[token];
        } else {
            return false;
        }
    }

    private checkSessions() {
        const now = Date.now();
        for (const token of Object.keys(this.sessions)) {
            if (now - this.sessions[token] > MAX_TOKEN_DURATION) {
                this.removeSession(token);
            }
        }
    }

    private closeSession(token: string) {
        this.removeSession(token);
        process.send({ type: "admin-token-remove", token });
    }

    private createSessionToken(): string {
        let token: string;
        do {
            token = Crypto.randomBytes(TOKEN_LENGTH).toString("hex");
        } while (this.sessions[token]);
        this.sessions[token] = Date.now();
        process.send({ type: "admin-token", token });
        return token;
    }
}
