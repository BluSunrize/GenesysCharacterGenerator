'use strict';

import {Ability} from "./ability";
import {SkillSelection} from "./skill";

export class Archetype {
    name: string;
    description: string;
    characteristics: number[];
    wound_threshold: number;
    strain_threshold: number;
    experience: number;
    free_careerskills: number;
    skills: SkillSelection[];
    abilities: Ability[];

    constructor(name: string, description: string, characteristics: number[], wound_threshold: number, strain_threshold: number, experience: number, free_careerskills: number, skills: SkillSelection[], abilities: Ability[]) {
        this.name = name;
        this.description = description;
        this.characteristics = characteristics;
        this.wound_threshold = wound_threshold;
        this.strain_threshold = strain_threshold;
        this.experience = experience;
        this.free_careerskills = free_careerskills;
        this.skills = skills;
        this.abilities = abilities;
    }
}

module.exports = {Archetype};