'use strict';

import {Archetype} from "./archetype";
import {Career} from "./career";
import {Talent} from "./talent";
import {Weapon} from "./weapon";

export class Character {
    //Base Info
    name: string;
    player: string;
    campaign: string;
    gender: string;
    age: string;
    height: string;
    build: string;
    hair: string;
    eyes: string;
    features: string;
    strength: string;
    flaw: string;
    desire: string;
    fear: string;

    //Initial Selection
    archetype: Archetype;
    career: Career;

    //Stats
    characteristics: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    soak: number[] = [0, 0];
    wound_threshold: number[] = [0, 0];
    wounds: number;
    strain_threshold: number[] = [0, 0];
    strain: number;
    defense_ranged: number[] = [0, 0];
    defense_melee: number[] = [0, 0];

    //XP
    experience_earned: number = 0;
    experience_spent: number = 0;

    //Skills
    archetype_skills: string[] = [];
    career_skills: string[] = [];
    career_skills_free_ranks: boolean[] = [false, false, false, false, false, false, false, false];
    extra_career_skills: string[] = [];
    skills_bought: { [skill: string]: number; } = {};
    skills_bought_noncareer: { [skill: string]: number; } = {};

    //Talents
    talents: Talent[] = [];

    //Inventory
    weapons: Weapon[] = [];
    inventory_money: string;
    inventory_armor: string;
    inventory_gear: string;

    constructor() {
    }
}

module.exports = Character;