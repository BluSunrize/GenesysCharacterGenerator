'use strict';

import {Character} from "./character";

export const characteristics = ["brawn", "agility", "intellect", "cunning", "willpower", "presence"];
export enum Characteristic {
    BR = "BR",
    AG = "AG",
    INT = "INT",
    CUN = "CUN",
    WILL = "WILL",
    PR = "PR"
}

export enum SkillCategory {
    GENERAL = "General",
    COMBAT = "Combat",
    SOCIAL = "Social",
    KNOWLEDGE = "Knowledge",
    POWER = "Power"
}

export class Skill {
    readonly name: string;
    readonly characteristic: Characteristic;
    readonly category: SkillCategory;

    constructor(name: string, characteristic: Characteristic, category: SkillCategory) {
        this.name = name;
        this.characteristic = characteristic;
        this.category = category;
    }
}

export function buildSkillDropdown(skills: Skill[], selection: SkillSelection, character: Character) {
    var newSelection = new SkillSelection(selection.skills, selection.predicate);
    skills = newSelection.getSkills(skills, character);
    skills.sort((a: Skill, b: Skill) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    let element_select = document.createElement("select");
    for (let skill of skills) {
        let option = document.createElement("option");
        option.innerText = skill.name;
        element_select.appendChild(option);
    }
    if(skills.length<2)
    {
        element_select.classList.add("no-select");
        element_select.disabled = true
    }
    return element_select;
}

export enum SkillSelectionPredicate {
    LIST = "LIST",
    NON_CAREER = "NON_CAREER",
    SOCIAL = "SOCIAL",
    COMBAT = "COMBAT",
    POWER = "POWER",
    KNOWLEDGE = "KNOWLEDGE",
    NON_COMBAT = "NON_COMBAT",
    NON_POWER = "NON_POWER"
}

export class SkillSelection {
    readonly predicate: SkillSelectionPredicate;
    readonly skills: string[];

    constructor(skills: string[], predicate?: SkillSelectionPredicate) {
        this.skills = skills;
        this.predicate = predicate ? predicate : SkillSelectionPredicate.LIST;
    }

    getSkills(skills: Skill[], character: Character) {
        let ret = [];
        for (let skill of skills) {
            let add = true;
            if (this.predicate == SkillSelectionPredicate.LIST)
                add = this.skills.indexOf(skill.name)!=-1;
            else if (this.predicate == SkillSelectionPredicate.NON_CAREER)
                add = character.career_skills.indexOf(skill.name) < 0;
            else if (this.predicate == SkillSelectionPredicate.SOCIAL)
                add = skill.category == SkillCategory.SOCIAL;
            else if (this.predicate == SkillSelectionPredicate.COMBAT)
                add = skill.category == SkillCategory.COMBAT;
            else if (this.predicate == SkillSelectionPredicate.POWER)
                add = skill.category == SkillCategory.POWER;
            else if (this.predicate == SkillSelectionPredicate.KNOWLEDGE)
                add = skill.category == SkillCategory.KNOWLEDGE;
            else if (this.predicate == SkillSelectionPredicate.NON_COMBAT)
                add = skill.category != SkillCategory.COMBAT;
            else if (this.predicate == SkillSelectionPredicate.NON_POWER)
                add = skill.category != SkillCategory.POWER;

            if (add)
                ret.push(skill);
        }
        return ret;
    }
}

module.exports = {Skill, characteristics, Characteristic, SkillCategory, buildSkillDropdown, SkillSelectionPredicate, SkillSelection};