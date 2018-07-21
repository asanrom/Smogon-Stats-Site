/**
 * Sprites
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 *
 * Sprites for pokemon and items.
 */

"use strict";

import { PokemonData } from "./pokemon-data";
import { toId } from "./text-utils";

/**
 * Sprites for pokemon and items.
 */
export class Sprites {

    /**
     * Obstains a pokemon icon.
     * @param pokemon   The pokemon name.
     * @returns         The pokemon icon style.
     */
    public static getPokemonIcon(pokemon: string): string {
        pokemon = toId(pokemon);
        let num = 0;
        const dex = PokemonData.getPokedex()[pokemon];
        if (dex) {
            num = dex.num || 0;
            if (num > 807) {
                num = 0;
            } else if (num < 0) {
                num = 0;
            }
        }

        if (Sprites.altNums[pokemon]) {
            num = Sprites.altNums[pokemon];
        }

        const top = Math.floor(num / 12) * 30;
        const left = (num % 12) * 40;

        return "background:transparent url(/static/images/sprites/smicons-sheet.png?v1) no-repeat scroll -"
            + left + "px -" + top + "px;";
    }

    /**
     * Obtains an item icon.
     * @param item      The item name.
     * @returns         The item icon.
     */
    public static getItemIcon(item: string): string {
        item = toId(item);
        let num = 0;
        const dex = PokemonData.getItems()[item];
        if (dex) {
            num = dex.spritenum;
        }

        const top = Math.floor(num / 16) * 24;
        const left = (num % 16) * 24;

        return "background:transparent url(/static/images/sprites/itemicons-sheet.png?v1) no-repeat scroll -"
            + left + "px -" + top + "px;";
    }

    /**
     * Obtains a pokemon sprite.
     * @param pokemon   The pokemon name.
     * @returns         The url of the sprite.
     */
    public static getPokemonSpriteURL(pokemon: string): string {
        pokemon = toId(pokemon);
        if (PokemonData.getPokedex()[pokemon]) {
            return "/static/images/sprites/pokemon/" + pokemon + ".png";
        } else {
            return "/static/images/sprites/pokemon/0.png";
        }
    }

    /**
     * Obtains an item sprite.
     * @param item      The item name.
     * @returns         The url of the sprite.
     */
    public static getItemSpriteURL(item: string): string {
        item = toId(item);
        if (PokemonData.getItems()[item]) {
            return "/static/images/sprites/items/" + item + ".png";
        } else {
            return "/static/images/sprites/items/0.png";
        }
    }

    /**
     * Obtains a type icon.
     * @param type      The type name.
     * @returns         The type icon.
     */
    public static getTypeIcon(type: string): string {
        type = toId(type);
        if (Sprites.types[type]) {
            return "/static/images/sprites/types/" + type + ".png";
        } else {
            return "/static/images/sprites/types/none.png";
        }
    }

    /**
     * Obtains a category icon.
     * @param category  The category name.
     * @returns         The category icon.
     */
    public static getCategoryIcon(category: string): string {
        category = toId(category);
        if (Sprites.categories[category]) {
            return "/static/images/sprites/categories/" + category + ".png";
        } else {
            return "/static/images/sprites/categories/undefined.png";
        }
    }

    private static altNums = {
        abomasnowmega: 984 + 46,
        absolmega: 984 + 34,
        aegislashblade: 816 + 116,
        aerodactylmega: 984 + 12,
        aggronmega: 984 + 27,
        alakazammega: 984 + 6,
        altariamega: 984 + 32,
        ampharosmega: 984 + 15,
        araquanidtotem: 752,
        argalis: 1188 + 7,
        arghonaut: 1152 + 5,
        audinomega: 984 + 48,
        aurumoth: 1152 + 14,
        banettemega: 984 + 33,
        basculinbluestriped: 816 + 56,
        beedrillmega: 984 + 4,
        blastoisemega: 984 + 3,
        blazikenmega: 984 + 22,
        brattler: 1188 + 8,
        breezi: 1188 + 3,
        burmysandy: 816 + 41,
        burmytrash: 816 + 42,
        caimanoe: 1188 + 13,
        cameruptmega: 984 + 31,
        castformrainy: 816 + 35,
        castformsnowy: 816 + 36,
        castformsunny: 816 + 37,
        cawdet: 1188 + 9,
        cawmodore: 1152 + 16,
        charizardmegax: 984 + 1,
        charizardmegay: 984 + 2,
        cherrimsunshine: 816 + 45,
        colossoil: 1152 + 8,
        crucibelle: 1152 + 20,
        crucibellemega: 1152 + 21,
        cupra: 1188 + 6,
        cyclohm: 1152 + 7,
        darmanitanzen: 816 + 57,
        deerlingautumn: 816 + 58,
        deerlingsummer: 816 + 59,
        deerlingwinter: 816 + 60,
        deoxysattack: 816 + 38,
        deoxysdefense: 816 + 39,
        deoxysspeed: 816 + 40,
        dianciemega: 984 + 49,
        diglettalola: 816 + 126,
        dugtrioalola: 816 + 127,
        duohm: 1188 + 20,
        egg: 816 + 1,
        embirch: 1188 + 1,
        exeggutoralola: 816 + 135,
        // protowatt: 1188 + 21,
        // unown gap
        fidgit: 1152 + 3,
        flabebeblue: 816 + 93,
        flabebeorange: 816 + 94,
        flabebewhite: 816 + 95,
        flabebeyellow: 816 + 96,
        flarelm: 1188 + 2,
        floatoy: 1188 + 12,
        floetteblue: 816 + 97,
        floetteeternal: 816 + 98,
        floetteorange: 816 + 99,
        floettewhite: 816 + 100,
        floetteyellow: 816 + 101,
        florgesblue: 816 + 102,
        florgesorange: 816 + 103,
        florgeswhite: 816 + 104,
        florgesyellow: 816 + 105,
        frillishf: 816 + 64,
        furfroudandy: 816 + 106,
        furfroudebutante: 816 + 107,
        furfroudiamond: 816 + 108,
        furfrouheart: 816 + 109,
        furfroukabuki: 816 + 110,
        furfroulareine: 816 + 111,
        furfroumatron: 816 + 112,
        furfroupharaoh: 816 + 113,
        furfroustar: 816 + 114,
        gallademega: 984 + 47,
        garchompmega: 984 + 44,
        gardevoirmega: 984 + 24,
        gastrodoneast: 816 + 47,
        gengarmega: 984 + 8,
        geodudealola: 816 + 130,
        giratinaorigin: 816 + 53,
        glaliemega: 984 + 35,
        golemalola: 816 + 132,
        graveleralola: 816 + 131,
        greninjaash: 816 + 137,
        grimeralola: 816 + 133,
        groudonprimal: 984 + 41,
        gumshoostotem: 735,
        gyaradosmega: 984 + 11,
        heracrossmega: 984 + 18,
        hoopaunbound: 816 + 118,
        houndoommega: 984 + 19,
        jellicentf: 816 + 65,
        jumbao: 1152 + 24,
        kangaskhanmega: 984 + 9,
        keldeoresolute: 816 + 71,
        kerfluffle: 1152 + 22,
        kitsunoh: 1152 + 6,
        kommoototem: 784,
        krilowatt: 1152 + 9,
        kyogreprimal: 984 + 40,
        kyuremblack: 816 + 69,
        kyuremwhite: 816 + 70,
        landorustherian: 816 + 68,
        latiasmega: 984 + 38,
        latiosmega: 984 + 39,
        lopunnymega: 984 + 43,
        lucariomega: 984 + 45,
        lurantistotem: 754,
        lycanrocdusk: 816 + 160,
        lycanrocmidnight: 816 + 143,
        magearnaoriginal: 816 + 152,
        malaconda: 1152 + 15,
        manectricmega: 984 + 29,
        marowakalola: 816 + 136,
        marowakalolatotem: 816 + 136,
        mawilemega: 984 + 26,
        medichammega: 984 + 28,
        meloettapirouette: 816 + 72,
        meowsticf: 816 + 115,
        meowthalola: 816 + 128,
        metagrossmega: 984 + 37,
        mewtwomegax: 984 + 13,
        mewtwomegay: 984 + 14,
        mimikyubustedtotem: 778,
        mimikyutotem: 778,
        miniorblue: 816 + 149,
        miniorgreen: 816 + 148,
        miniorindigo: 816 + 151,
        miniormeteor: 816 + 145,
        miniororange: 816 + 146,
        miniorviolet: 816 + 150,
        minioryellow: 816 + 147,
        mollux: 1152 + 13,
        monohm: 1188 + 19,
        mukalola: 816 + 134,
        naviathan: 1152 + 19,
        necrozmadawnwings: 816 + 162,
        necrozmaduskmane: 816 + 161,
        necrozmaultra: 816 + 163,
        necturine: 1188 + 5,
        necturna: 1152 + 12,
        ninetalesalola: 816 + 125,
        nohface: 1188 + 18,
        oricoriopau: 816 + 141,
        oricoriopompom: 816 + 140,
        oricoriosensu: 816 + 142,
        pajantom: 1152 + 23,
        persianalola: 816 + 129,
        pidgeotmega: 984 + 5,
        pikachualola: 816 + 158,
        pikachubelle: 816 + 2,
        pikachucosplay: 816 + 7,
        pikachuhoenn: 816 + 154,
        pikachukalos: 816 + 157,
        pikachulibre: 816 + 3,
        pikachuoriginal: 816 + 153,
        pikachupartner: 816 + 159,
        pikachuphd: 816 + 4,
        pikachupopstar: 816 + 5,
        pikachurockstar: 816 + 6,
        pikachusinnoh: 816 + 155,
        pikachuunova: 816 + 156,
        pinsirmega: 984 + 10,
        plasmanta: 1152 + 18,
        pluffle: 1188 + 14,
        privatyke: 1188 + 17,
        pyroak: 1152 + 2,
        pyroarf: 816 + 92,
        raichualola: 816 + 121,
        raticatealola: 816 + 120,
        raticatealolatotem: 816 + 120,
        rattataalola: 816 + 119,
        rayquazamega: 984 + 42,
        rebble: 1188 + 15,
        revenankh: 1152 + 1,
        ribombeetotem: 743,
        rotomfan: 816 + 48,
        rotomfrost: 816 + 49,
        rotomheat: 816 + 50,
        rotommow: 816 + 51,
        rotomwash: 816 + 52,
        sableyemega: 984 + 25,
        salamencemega: 984 + 36,
        salazzletotem: 758,
        sandshrewalola: 816 + 122,
        sandslashalola: 816 + 123,
        sawsbuckautumn: 816 + 61,
        sawsbucksummer: 816 + 62,
        sawsbuckwinter: 816 + 63,
        sceptilemega: 984 + 21,
        scizormega: 984 + 17,
        scratchet: 1188 + 4,
        sharpedomega: 984 + 30,
        shayminsky: 816 + 54,
        shelloseast: 816 + 46,
        slowbromega: 984 + 7,
        snugglow: 1188 + 11,
        steelixmega: 984 + 16,
        stratagem: 1152 + 4,
        swampertmega: 984 + 23,
        syclant: 1152 + 0,
        syclar: 1188 + 0,
        tactite: 1188 + 16,
        thundurustherian: 816 + 67,
        togedemarutotem: 777,
        tomohawk: 1152 + 11,
        tornadustherian: 816 + 66,
        tyranitarmega: 984 + 20,
        unfezantf: 816 + 55,
        venusaurmega: 984 + 0,
        vikavolttotem: 738,
        vivillonarchipelago: 816 + 73,
        vivilloncontinental: 816 + 74,
        vivillonelegant: 816 + 75,
        vivillonfancy: 816 + 76,
        vivillongarden: 816 + 77,
        vivillonhighplains: 816 + 78,
        vivillonicysnow: 816 + 79,
        vivillonjungle: 816 + 80,
        vivillonmarine: 816 + 81,
        vivillonmodern: 816 + 82,
        vivillonmonsoon: 816 + 83,
        vivillonocean: 816 + 84,
        vivillonpokeball: 816 + 85,
        vivillonpolar: 816 + 86,
        vivillonriver: 816 + 87,
        vivillonsandstorm: 816 + 88,
        vivillonsavanna: 816 + 89,
        vivillonsun: 816 + 90,
        vivillontundra: 816 + 91,
        volkraken: 1152 + 17,
        volkritter: 1188 + 10,
        voodoll: 1188 + 22,
        voodoom: 1152 + 10,
        vulpixalola: 816 + 124,
        wishiwashischool: 816 + 144,
        wormadamsandy: 816 + 43,
        wormadamtrash: 816 + 44,
        zygarde10: 816 + 138,
        zygardecomplete: 816 + 139,
    };

    private static types = {
        bird: true,
        bug: true,
        dark: true,
        dragon: true,
        electric: true,
        fairy: true,
        fighting: true,
        fire: true,
        flying: true,
        ghost: true,
        grass: true,
        ground: true,
        ice: true,
        normal: true,
        poison: true,
        psychic: true,
        rock: true,
        steel: true,
        water: true,
    };

    private static categories = {
        physical: true,
        special: true,
        status: true,
    };
}
