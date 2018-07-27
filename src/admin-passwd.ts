/**
 * Admin password reset
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Configuration sscript. Changes the control pnale password.
 */

"use strict";

import * as Crypto from "crypto";
import * as FS from "fs";
import * as Path from "path";
import * as Read from "read";

function questionAdminUser() {
    Read({ prompt: "Admin Usename: " }, (error, result) => {
        if (error) {
            throw error;
        }
        result = result.trim();
        if (result) {
            questionAdminPassword(result);
        } else {
            console.log("The username cannot be blank.");
            questionAdminUser();
        }
    });
}

function questionAdminPassword(user: string) {
    Read({
        prompt: "Password for " + user + ": ",
        silent: true,
    }, (error, result) => {
        if (error) {
            throw error;
        }
        result = result.trim();
        if (result) {
            questionAdminPasswordAgain(user, result);
        } else {
            console.log("The password cannot be blank.");
            questionAdminUser();
        }
    });
}

function questionAdminPasswordAgain(user: string, password: string) {
    Read({
        prompt: "Password for " + user + " (again): ",
        silent: true,
    }, (error, result) => {
        if (error) {
            throw error;
        }
        result = result.trim();
        if (result === password) {
            setPassword(user, password);
        } else {
            console.log("The passwords do not match.");
            questionAdminUser();
        }
    });
}

function setPassword(user: string, password: string) {
    const config = JSON.parse(FS.readFileSync(Path.resolve(__dirname, "../config.json")).toString());
    config.controlPanelUsername = user;
    config.controlPanelPasswdAlgo = "sha256";
    config.controlPanelPasswdSalt = Crypto.randomBytes(64).toString("hex");
    const hash = Crypto.createHash(config.controlPanelPasswdAlgo);
    hash.update(password);
    hash.update(config.controlPanelPasswdSalt);
    config.controlPanelPasswdHash = hash.digest().toString("hex");

    FS.writeFileSync(Path.resolve(__dirname, "../config.json"), JSON.stringify(config, null, 2));
    console.log("DONE! Sucessfully set control panel credentials.");
}

console.log("Set an username and password for accesing the web control panel.");
questionAdminUser();
