'use strict';

import {Archetype} from "./archetype";
import {Career} from "./career";

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

    //Initial Selection
    archetype: Archetype;
    career: Career;

    //Stats
    characteristics: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
    soak: number;
    wound_threshold: number;
    wounds: number;
    strain_threshold: number;
    strain: number;
    defense_ranged: number;
    defense_melee: number;

    //XP
    experience_earned: number = 0;
    experience_spent: number = 0;

    //Skills
    archetype_skills: string[] = [];
    career_skills: string[] = [];
    career_skills_free_ranks: boolean[] = [false, false, false, false, false, false, false, false];
    skills_bought: { [skill: string]: number; } = {};

    //Abilities
    abilities: string[] = [];

    //Talents
    talents: string[] = [];

    constructor() {
    }
}

module.exports = Character;