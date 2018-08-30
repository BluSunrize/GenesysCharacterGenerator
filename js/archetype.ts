'use strict';

import {Ability} from "./ability";
import {SkillSelection} from "./skill";

export class Archetype {
    name: string;
    characteristics: number[];
    wound_threshold: number;
    strain_threshold: number;
    experience: number;
    skills: SkillSelection[];
    abilities: Ability[];

    constructor(name: string, characteristics: number[], wound_threshold: number, strain_threshold: number, experience: number, skills: SkillSelection[], abilities: Ability[]) {
        this.name = name;
        this.characteristics = characteristics;
        this.wound_threshold = wound_threshold;
        this.strain_threshold = strain_threshold;
        this.experience = experience;
        this.skills = skills;
        this.abilities = abilities;
    }
}

module.exports = {Archetype};