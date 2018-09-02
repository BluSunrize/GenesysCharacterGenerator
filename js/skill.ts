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
    if (skills.length < 2) {
        element_select.classList.add("no-select");
        element_select.disabled = true
    }
    return element_select;
}

export enum SkillSelectionPredicate {
    FROM_LIST = "FROM_LIST",
    ANY_NON_CAREER = "ANY_NON_CAREER",
    ANY_SOCIAL = "ANY_SOCIAL",
    ANY_COMBAT = "ANY_COMBAT",
    ANY_POWER = "ANY_POWER",
    ANY_KNOWLEDGE = "ANY_KNOWLEDGE",
    ANY_NON_COMBAT = "ANY_NON_COMBAT",
    ANY_NON_POWER = "ANY_NON_POWER"
}

const makeReadable = str => {
    return str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
};

export function buildSkillSelectionConfiguration(skills: Skill[], selection: SkillSelection) {
    let div = document.createElement("div");
    div.style.display = "inline-flex";
    let dropdown = document.createElement("select");
    dropdown.classList.add("toggleEdit");
    dropdown.style.height = "18.8px";
    div.appendChild(dropdown);
    for (let predicate in SkillSelectionPredicate) {
        let option = document.createElement("option");
        option.value = predicate;
        option.innerText = makeReadable(predicate);
        dropdown.appendChild(option);
    }
    let option = document.createElement("option");
    option.innerText = "REMOVE";
    dropdown.insertBefore(option, dropdown.firstChild);


    let listBuilder = document.createElement("div");
    div.appendChild(listBuilder);
    listBuilder.classList.add("skillselection");
    let addButton = document.createElement("button");
    listBuilder.appendChild(addButton);
    addButton.classList.add("toggleEdit");
    addButton.innerText = "Add";
    let addFunc = function (skill: string) {
        let skillDrop = createSkillDropdown(skills, true);
        skillDrop.classList.add("toggleEdit");
        if (skill) {
            skillDrop.value = skill;
            skillDrop.disabled = true;
        }
        listBuilder.insertBefore(skillDrop, listBuilder.lastChild);
    };
    addButton.onclick = () => addFunc(null);

    dropdown.onchange = function () {
        if (dropdown.value === "REMOVE") {
            let highestChild = <HTMLElement>div;
            while (highestChild.parentElement.tagName !== "DIV" && highestChild.parentElement.tagName !== "TBODY")
                highestChild = highestChild.parentElement;
            highestChild.parentElement.removeChild(highestChild);
        }
        else if (dropdown.value !== SkillSelectionPredicate.FROM_LIST)
            listBuilder.style.display = "none";
        else
            listBuilder.style.display = "block";
    };

    if (selection) {
        dropdown.disabled = addButton.disabled = true;
        dropdown.value = selection.predicate;
        dropdown.onchange.call(dropdown.onchange);
        if (selection.predicate === SkillSelectionPredicate.FROM_LIST)
            for (let skill of selection.skills)
                addFunc(skill);
    }

    return div;
}
export function parseSkillSelectionConfiguration(element: HTMLElement): SkillSelection {
    let skills = [];
    let predicate = SkillSelectionPredicate.FROM_LIST;
    if(element.firstChild instanceof HTMLSelectElement)
        predicate = SkillSelectionPredicate[(<HTMLSelectElement>element.firstChild).value];
    let builder = <HTMLElement>element.lastChild;
    for(let i=0; i<builder.children.length; i++)
    if(builder.children[i] instanceof HTMLSelectElement)
        skills.push((<HTMLSelectElement>builder.children[i]).value);
    return new SkillSelection(skills, predicate);
}


function createSkillDropdown(skills: Skill[], addRemoveOption: boolean) {
    let dropdown = document.createElement("select");
    for (let skill of skills) {
        let option = document.createElement("option");
        option.value = option.innerText = skill.name;
        dropdown.appendChild(option);
    }
    if (addRemoveOption) {
        let option = document.createElement("option");
        option.innerText = "REMOVE";
        dropdown.insertBefore(option, dropdown.firstChild);
        dropdown.onchange = function () {
            if (dropdown.value === "REMOVE")
                dropdown.parentElement.removeChild(dropdown);
        };
    }
    return dropdown;
}


export class SkillSelection {
    readonly predicate: SkillSelectionPredicate;
    readonly skills: string[];

    constructor(skills: string[], predicate?: SkillSelectionPredicate) {
        this.skills = skills;
        this.predicate = predicate ? predicate : SkillSelectionPredicate.FROM_LIST;
    }

    getSkills(skills: Skill[], character: Character) {
        let ret = [];
        for (let skill of skills) {
            let add = true;
            if (this.predicate == SkillSelectionPredicate.FROM_LIST)
                add = this.skills.indexOf(skill.name) != -1;
            else if (this.predicate == SkillSelectionPredicate.ANY_NON_CAREER)
                add = character.career_skills.indexOf(skill.name) < 0;
            else if (this.predicate == SkillSelectionPredicate.ANY_SOCIAL)
                add = skill.category == SkillCategory.SOCIAL;
            else if (this.predicate == SkillSelectionPredicate.ANY_COMBAT)
                add = skill.category == SkillCategory.COMBAT;
            else if (this.predicate == SkillSelectionPredicate.ANY_POWER)
                add = skill.category == SkillCategory.POWER;
            else if (this.predicate == SkillSelectionPredicate.ANY_KNOWLEDGE)
                add = skill.category == SkillCategory.KNOWLEDGE;
            else if (this.predicate == SkillSelectionPredicate.ANY_NON_COMBAT)
                add = skill.category != SkillCategory.COMBAT;
            else if (this.predicate == SkillSelectionPredicate.ANY_NON_POWER)
                add = skill.category != SkillCategory.POWER;

            if (add)
                ret.push(skill);
        }
        return ret;
    }
}

module.exports = {
    Skill,
    characteristics,
    Characteristic,
    SkillCategory,
    buildSkillDropdown,
    SkillSelectionPredicate,
    buildSkillSelectionConfiguration,
    parseSkillSelectionConfiguration,
    SkillSelection
};