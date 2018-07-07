/**
 * Resources builder
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 * 
 * Builds the resources required by the application
 */

"use strict";

function toId(str) {
    if (typeof str === "string") {
        return str.toLowerCase().replace(/[^a-z0-9]/g, "");
    } else {
        return "";
    }
}

const Path = require("path");
const FileSystem = require("fs");

const Pokedex_File = Path.resolve(__dirname, "resources/pokedex.js");
const Pokedex_File_Min = Path.resolve(__dirname, "resources/pokedex-min.json");

let pokedex = require(Pokedex_File).BattlePokedex;
let newPokedex = {};

for (let poke in pokedex) {
    newPokedex[poke] = { name: pokedex[poke].species, num: pokedex[poke].num };
}

FileSystem.writeFileSync(Pokedex_File_Min, JSON.stringify(newPokedex));

const Movedex_File = Path.resolve(__dirname, "resources/moves.js");
const Movedex_File_Min = Path.resolve(__dirname, "resources/moves-min.json");

let movedex = require(Movedex_File).BattleMovedex;
let newMovedex = {};

for (let move in movedex) {
    newMovedex[move] = {
        name: movedex[move].name, num: movedex[move].num,
        type: toId(movedex[move].type), category: toId(movedex[move].category)
    };
}

FileSystem.writeFileSync(Movedex_File_Min, JSON.stringify(newMovedex));

const Items_File = Path.resolve(__dirname, "resources/items.js");
const Items_File_Min = Path.resolve(__dirname, "resources/items-min.json");

let items = require(Items_File).BattleItems;
let newItems = {};

for (let item in items) {
    newItems[item] = { name: items[item].name, spritenum: items[item].spritenum };
}

FileSystem.writeFileSync(Items_File_Min, JSON.stringify(newItems));

const Abilities_File = Path.resolve(__dirname, "resources/abilities.js");
const Abilities_File_Min = Path.resolve(__dirname, "resources/abilities-min.json");

let abilities = require(Abilities_File).BattleAbilities;
let newAbilities = {};

for (let ability in abilities) {
    newAbilities[ability] = { name: abilities[ability].name };
}

FileSystem.writeFileSync(Abilities_File_Min, JSON.stringify(newAbilities));
